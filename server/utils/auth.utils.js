require("dotenv").config()
const express = require("express")
const router = express.Router()
const crypto = require("node:crypto")
const pool = require("../src/db")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const authenticateToken = require("../middleware/auth.middleware")
const { success } = require("zod")


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

router.get("/verify-email", async (req, res) => {
    const token = req.query.token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await pool.query(`
        SELECT user_id FROM email_verification_tokens WHERE token_hash = $1 AND expires_at > NOW()
    `, [hashedToken])

    if(user.rows.length === 0){
        //impliment resend token 
        const resendLink = "http://localhost:5000/utils/refresh-email-token"
        return res.status(400).send(`invalid or expired verification link <a href = ${resendLink}>Resens Varification Link</a>`)
    }

    const client = await pool.connect()

    try {
        await client.query("BEGIN")

        await pool.query(`
            UPDATE users SET 
            verified = true
            WHERE id = $1
            `, [user.rows[0].user_id])

        await pool.query(`
            DELETE FROM email_verification_tokens WHERE user_id = $1
            `, [user.rows[0].user_id])

        await client.query("COMMIT")
        
    } catch (err) {
        await client.query("ROLLBACK")
        console.error(err)

        return res.status(500).json({
        success: false,
        message: "Error During Verification"
        });
    }
    finally{
        client.release()
    }

    return res.redirect("http://localhost:5173")
})

router.get("/me", authenticateToken, async (req, res) => {
    const userData = await pool.query(`
        SELECT * FROM users WHERE id = $1
    `,[req.user.id])

    return res.status(201).json({
        success: true,
        redirect: "/home",
        user: req.user,
        bio: userData.rows[0].bio,
        username: userData.rows[0].username,
        display_name: userData.rows[0].display_name
    })
    

   
})

router.get("/refresh", async (req, res) => {
    console.log("REFRESH CALLED:", Date.now())
    const refreshToken = req.cookies.refreshToken

    if(!refreshToken){
        return res.status(401).json({
            success: false,
            message: "no token"
        })
    }

    try {

        const verify = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN)

        const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex")


        const checkToken = await pool.query(`
            SELECT * FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()
        `, [hashedRefreshToken])


        if(checkToken.rows.length === 0){
            return res.status(401).json({
                success: false,
                message: "token no match in db"
            })
        }

        const user = await pool.query(`
            SELECT * FROM users WHERE id = $1
        `, [verify.id])

        const newTokens = createTokens(user.rows[0])

        const newRefresTokenHashed = crypto.createHash("sha256").update(newTokens.refreshToken).digest("hex")

        await pool.query(`
            UPDATE refresh_tokens 
            SET
                token_hash = $1,
                created_at = NOW(),
                expires_at = NOW() + '7 days'
            WHERE 
                user_id = $2
        `, [newRefresTokenHashed, verify.id])

        res.cookie("accessToken", newTokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
            path : "/"
        })

        res.cookie("refreshToken", newTokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path : "/"
        })

        res.json({
            success: true,
            message: "new token issued, refresh token updated"
        })

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "verify"
        })
    }
    
})

router.post("/checkPassword", authenticateToken, async (req, res) => {
    const password = await pool.query(`
        SELECT password_hash FROM users WHERE id = $1
    `, [req.user.id])

    if(password.rows.length === 0){
        return res.status(500).json({
            success: false,
            massage: "Cant get psw from DB"
        })
    }

    const passwordMatches = await bcrypt.compare(req.body.confirmPassword, password.rows[0].password_hash)

    if(passwordMatches){
        return res.status(201).json({
            success: true,
            message: "Password Correct"
        })
    }


    res.json({
        success: false,
        message: "wrong psw"
    })
})

router.get("/getCoachData", authenticateToken, async (req, res) => {
    const coach = await pool.query(`
        SELECT email, role, profile_image_url, id, username  FROM users WHERE id = $1
    `, [req.user.id])

    const clients = await pool.query(`
        SELECT users.*
        FROM users
        JOIN coach_client_rel
            ON coach_client_rel.client_id = users.id
        WHERE coach_client_rel.coach_id = $1;
    `, [req.user.id])

    const programs = await pool.query(`
        SELECT * FROM programs WHERE coach_id = $1
    `, [req.user.id])

    console.log(programs.rows)

    res.json({
        coach: coach.rows[0],
        client: clients.rows,
        programs: programs.rows,
    })
})

module.exports = router;