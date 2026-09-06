const express = require("express")
const router = express.Router()
const pool = require("../src/db")
const bcrypt = require("bcrypt")
const { z } = require("zod")
const {Resend} = require("resend")
const crypto = require("node:crypto")
const jwt = require("jsonwebtoken")

const schema = z.object({
    email: z.email().toLowerCase(),
    password: z.string()
        .min(8)
        .max(128)
        .regex(/[a-z]/, "Password must contain a lowercase letter")
        .regex(/[A-Z]/, "Password must contain an uppercase letter")
        .regex(/\d/, "Password must contain a number")
        .regex(/[^\w\s]/, "Passowrd must contain a special character")
})

function createTokens(user){
    const accessToken = jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        photo_url: `http://localhost:5000${user.profile_image_url}`,
    }, process.env.JWT_ACCESS_TOKEN, {expiresIn: "15min"})

    const refreshToken = jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        photo_url: `http://localhost:5000${user.profile_image_url}`,
    }, process.env.JWT_REFRESH_TOKEN, {expiresIn: "7d"})

    return {accessToken, refreshToken}
}

router.post("/register", async (req, res) => {
    try {
        const resoult = schema.parse(req.body)

        const user = await pool.query("SELECT * FROM users WHERE email = $1", [resoult.email])
        if(user.rows.length > 0){
            return res.status(409).json({
                success: false,
                message: "user allready exists"
            })
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const verificationToken = crypto.randomBytes(32).toString("hex")

        const verificationTokenHash = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex")


        
        const client = await pool.connect()

        try {
            await client.query("BEGIN")

            const userResoult = await client.query(`
                INSERT INTO users(email, password_hash) VALUES ($1, $2) RETURNING id;
            `, [resoult.email, hashedPassword])

            const userId = userResoult.rows[0].id

            await client.query(`
                INSERT INTO email_verification_tokens(user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')
            `, [userId, verificationTokenHash])

            await client.query("COMMIT")

            const resend = new Resend(process.env.RESEND_API_KEY)
            const verificationLink = `http://localhost:5000/utils/verify-email?token=${verificationToken}`

            resend.emails.send({
                    from: `onboarding@resend.dev`,
                    to: `tadej.podboj114@gmail.com`,
                    subject: `Email Verification`,
                    html: `
                        <h2> Click Below to Verify your email</h2>
                        <a href = ${verificationLink}>Verifiy Your Email</a>
                        `
                        
                        
                })

            res.status(201).json({
                success: true,
                message: "Email Varification Link Was Sent To Your Email"
            })

        } catch (err) {
            await client.query("ROLLBACK")
            console.error(err)

            return res.status(500).json({
            success: false,
            message: "Could not create user"
            });
        }
        finally{
            client.release()
        }
        



    } catch (err) {
        return res.status(400).json({
            success: false,
            errors: err.issues
        })
    }

})

router.post("/login", async (req,res) => {
    try {
        const resoult = schema.parse(req.body)
        const email = resoult.email


        const user = await pool.query(`
            SELECT * FROM users WHERE email = $1 
            `,[email])


        if(user.rows.length === 0){
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        const passwordMatches = await bcrypt.compare(resoult.password, user.rows[0].password_hash)


        if(!passwordMatches){
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        if(!user.rows[0].verified){
            return res.status(400).json({
                success: false,
                message: "user Not Verified"
            })
        }

        const tokens = createTokens(user.rows[0])
        const hashedRefreshToken = crypto.createHash("sha256").update(tokens.refreshToken).digest("hex")

        await pool.query(`
            INSERT INTO refresh_tokens(
                user_id,
                token_hash,
                created_at,
                expires_at
                )
            VALUES ($1, $2, NOW(), NOW() + INTERVAL '7 days')

            ON CONFLICT (user_id)
            DO UPDATE SET
                token_hash = EXCLUDED.token_hash,
                created_at = EXCLUDED.created_at,
                expires_at = EXCLUDED.expires_at;
                
        `,[user.rows[0].id, hashedRefreshToken])

        
        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        })


        

        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
            path: "/"
        })

    
        res.json({
            success: true,
            message: "logged in and token set",
            redirect: "/home"
        })



        


    } catch (err) {
        return res.status(400).json({
            success: false,
            errors: err
        })
    }
})

router.post("/logout", async (req, res) => {
    const token = req.cookies.refreshToken
    
    if(token){
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

        await pool.query(`
            DELETE FROM refresh_tokens WHERE token_hash = $1
        `, [hashedToken])
    }

    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")

    res.status(201).json({
        success: true,
        message: "loged out"
    })
})

module.exports = router