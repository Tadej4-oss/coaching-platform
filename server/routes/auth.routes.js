const express = require("express")
const router = express.Router()
const pool = require("../src/db")
const bcrypt = require("bcrypt")
const { z } = require("zod")
const {Resend} = require("resend")
const crypto = require("node:crypto")
const jwt = require("jsonwebtoken")
const guestProfile = "/uploads/guest_profile.jpg";
const authenticateToken = require("../middleware/auth.middleware")

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

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/"
}

function createTokens(user){
    //create accesstoken
    const accessToken = jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        photo_url: `http://localhost:5000${user.profile_image_url}`,
    }, process.env.JWT_ACCESS_TOKEN, {expiresIn: "15min"}) // dodaj experiation date 

    //create refreesh
    const refreshToken = jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        photo_url: `http://localhost:5000${user.profile_image_url}`,
    }, process.env.JWT_REFRESH_TOKEN, {expiresIn: "7d"}) // dodaj experiation date 

    //return so its accessable with authenticateToken
    return {accessToken, refreshToken}
}

router.post("/register", async (req, res) => {
    try {
        //1.0 validate req.body, if not valid throws an error in catch 
        const resoult = schema.parse(req.body)

        //2.0 check if email exists from parsed schema
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [resoult.email])
        //2.1 if exists, return
        if(user.rows.length > 0){
            return res.status(409).json({
                success: false,
                message: "user allready exists"
            })
        }

        //3.0 if user no exists: -> hashe psw -> create varification token -> hash it -> send to email
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const verificationToken = crypto.randomBytes(32).toString("hex")

        const verificationTokenHash = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex")


        
        //3.1 open a connection to DB to insert data
        const client = await pool.connect()

        //3.2 try catch for conveniont reasons also ce any 1 query faila ROOLBACK reseta oba oziroma reseta use after BEGIN
        try {
            //4.0 start a transaction (BEGIN zrd ROLLBACK ker ce faila se use po tem reseta )
            await client.query("BEGIN")

            //4.1 create user with email, psq, photo (varification pride pol (default values je false)) vrni id zarad emial var insert
            const userResoult = await client.query(`
                INSERT INTO users(email, password_hash, profile_image_url) VALUES ($1, $2, $3) RETURNING id;
            `, [resoult.email, hashedPassword, guestProfile])

            //4.2 set id ker rabs email var(lhko bi blo tud brez in sam "userResoult.rows[0].id")
            const userId = userResoult.rows[0].id

            //4.3 inesrt var token into email (to rabs zto d dejansko matchas to proti url token k ga posles plus exp date ma)
            await client.query(`
                INSERT INTO email_verification_tokens(user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')
            `, [userId, verificationTokenHash])

            //4.4 keep every change -> use kar je med BEGIN pa tem se executa at once, if any error reseta use od BEGIN 
            await client.query("COMMIT")

            //5.0 create a resend instance using api key
            const resend = new Resend(process.env.RESEND_API_KEY)
            //5.1 create a link to send to email (use po "?"  je query ne pa param, zto je pol route lhko sam /verfy-email)
            const verificationLink = `http://${process.env.SERVER_URL}/utils/verify-email?token=${verificationToken}`

            //5.2 send actual email
            resend.emails.send({
                    from: `onboarding@resend.dev`,
                    to: `tadej.podboj114@gmail.com`,
                    subject: `Email Verification`,
                    html: `
                        <h2> Click Below to Verify your email</h2>
                        <a href = ${verificationLink}>Verifiy Your Email</a>
                        `
                        
                        
                })
            
            //5.3 return response
            return res.status(201).json({
                success: true,
                message: "Email Varification Link Was Sent To Your Email"
            })

        } catch (err) {
            //4.* tle je ta ROLLBACK incase the querys fail or erros
            await client.query("ROLLBACK")
            //6.0 self explanatory
            console.error(err)

            //6.1 return status plus error msg incase error
            return res.status(500).json({
            success: false,
            message: "Could not create user"
            });
        }
        finally{
            //7.0 release connection ***NERABS AWAIT KER NI PROMISE BASED****
            client.release()
        }
        



    } catch (err) {
        console.error("REGISTER ERROR:", err)

        if (err.issues) {
            return res.status(400).json({
                success: false,
                errors: err.issues
            })
        }

        return res.status(500).json({
            success: false,
            message: "Registration failed"
        })
    }

})

router.post("/login", async (req,res) => {
    try {
        //1.0 get parsed data from user
        const resoult = schema.parse(req.body)
        const email = resoult.email

        //2.0 check if user exists
        const user = await pool.query(`
            SELECT * FROM users WHERE email = $1 
        `,[email])

        //2.1 if not exists reuturne rr
        if(user.rows.length === 0){
            return res.status(400).json({
                success: false,
                error: "Invalid email or password"
            })
        }

        //2.2 compare psws
        const passwordMatches = await bcrypt.compare(resoult.password, user.rows[0].password_hash)

        //2.3 safety checck if psw doesnt match
        if(!passwordMatches){
            return res.json({
                success: false,
                error: "Invalid email or password"
            })
        }

        //2.4 safety check if email verified
        if(!user.rows[0].verified){
            return res.status(400).json({
                success: false,
                error: "user Not Verified"
            })
        }

        //3.0 create tokens
        const tokens = createTokens(user.rows[0])
        //3.1 hashed refresh token
        const hashedRefreshToken = crypto.createHash("sha256").update(tokens.refreshToken).digest("hex")

        //3.2 INSERT hashed refresh token 
        await pool.query(`
            INSERT INTO refresh_tokens(
                user_id,
                token_hash,
                created_at,
                expires_at
                )
            VALUES ($1, $2, NOW(), NOW() + INTERVAL '7 days')
        
            -- row ni nikol deleted tko da je zmer updejtan da ni miljon rows per user (ONCONFLICT means ce user_id ze obsataaj pol updejta db ne isnerta)

            ON CONFLICT (user_id)
            DO UPDATE SET 
                token_hash = EXCLUDED.token_hash,
                created_at = EXCLUDED.created_at,
                expires_at = EXCLUDED.expires_at;
                
        `,[user.rows[0].id, hashedRefreshToken])

        //3.3 send refreshtoken as payload 
        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/" 
        })

        //3.4 send accestoken as paylaod
        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true, // JavaScript in the browser cannot access the cookie (helps protect against token theft via XSS)
            secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",  // Don't send cookie with requests coming from other websites (helps prevent CSRF)
            maxAge: 15 * 60 * 1000, // Cookie expires after 15 min (value is in milliseconds)
            path: "/" // Cookie is available for every route on your website
        })

        //4.0 if user null chose role
        if(user.rows[0].role === null){
            return res.json({
                success: true,
                message: "role je null",
                redirect: "/choseRole"
            })
        }

        //4.1 if user has role pol redirect home
        res.json({
            success: true,
            redirect: "/home"
        })



        


    } catch (err) {
        return res.status(400).json({
            success: false,
            error: "zod errror"
        })
    }
})

router.post("/logout", async (req, res) => {
    //1.0 get refresh
    //zakaj refresh? ker ga treba zbirisat iz db
    const token = req.cookies.refreshToken
    
    //2.0 ce obstaja (ni poteku) zbrisi iz db
    if(token){
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

        await pool.query(`
            DELETE FROM refresh_tokens WHERE token_hash = $1
        `, [hashedToken])
    }

    //3.0 zbrisi se iz payloada
    res.clearCookie("accessToken", cookieOptions)
    res.clearCookie("refreshToken", cookieOptions)

    res.status(201).json({
        success: true,
        message: "loged out"
    })
})

router.get("/getRole", authenticateToken, async (req,res) => {
    // get role and send it 
    const role = await pool.query(`
        SELECT role FROM users WHERE id = $1
    `, [req.user.id])

    res.json({
        role: role.rows[0].role
    })
})

module.exports = router