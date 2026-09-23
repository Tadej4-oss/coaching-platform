require("dotenv").config()
const express = require("express")
const router = express.Router()
const crypto = require("node:crypto")
const pool = require("../src/db")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const authenticateToken = require("../middleware/auth.middleware")


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
    //1.0 pull token from url (sent from register)
    const token = req.query.token
    //1.1 hash it to compare to db token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    //2.0  check for valid token and get user id
    const user = await pool.query(`
        SELECT user_id FROM email_verification_tokens WHERE token_hash = $1 AND expires_at > NOW()
    `, [hashedToken])

    //2.2 token expired, impliment resend token logic
    if(user.rows.length === 0){
        //impliment resend token 
        const resendLink = "http://localhost:5000/utils/refresh-email-token"
        return res.status(400).send(`invalid or expired verification link <a href = ${resendLink}>Resens Varification Link</a>`)
    }


    //3.0 open db connection
    const client = await pool.connect()

    try {
        //3.1 start from here if fails delete use after this 
        await client.query("BEGIN")

        //3.2 set user to be verified
        await pool.query(`
            UPDATE users SET 
            verified = true
            WHERE id = $1
            `, [user.rows[0].user_id])

        //3.3 delete email token
        await pool.query(`
            DELETE FROM email_verification_tokens WHERE user_id = $1
            `, [user.rows[0].user_id])
 
        //3.4 finish transaction
        await client.query("COMMIT")
        
    } catch (err) {
        //3.5 if fails rollback to begin
        await client.query("ROLLBACK")
        console.error(err)

        return res.status(500).json({
        success: false,
        message: "Error During Verification"
        });
    }
    finally{
        //3.6 close db connection
        client.release()
    }

    //4.0 return to login
    return res.redirect("http://localhost:5173")
})

router.get("/me", authenticateToken, async (req, res) => {
    //"eazy" pull user data 
    const userData = await pool.query(`
        SELECT * FROM users WHERE id = $1
    `,[req.user.id])

    //lhko bi dodau error handling if user not found za extra check sam authenticateToken ze nrdi to
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
    //1.0 get token from payload 
    const refreshToken = req.cookies.refreshToken

    //1.1 if no token return
    if(!refreshToken){
        return res.status(401).json({
            success: false,
            message: "no token"
        })
    }

    //2.0 else 
    try {

        //2.1 verify token
        const verify = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN)

        //2.2 hash it to compare to db
        const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex")

        //2.3 check for token and check if not expired
        const checkToken = await pool.query(`
            SELECT * FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()
        `, [hashedRefreshToken])


        //2.4 if expired or not exists return
        if(checkToken.rows.length === 0){
            return res.status(401).json({
                success: false,
                message: "token no match in db"
            })
        }

        //2.5 get userid to create new tokens
        const user = await pool.query(`
            SELECT * FROM users WHERE id = $1
        `, [verify.id])

        //2.6 create tokens aand hash refresh token
        const newTokens = createTokens(user.rows[0])
        const newRefresTokenHashed = crypto.createHash("sha256").update(newTokens.refreshToken).digest("hex")

        //2.7 update refresh token in db
        await pool.query(`
            UPDATE refresh_tokens 
            SET
                token_hash = $1,
                created_at = NOW(),
                expires_at = NOW() + '7 days'
            WHERE 
                user_id = $2
        `, [newRefresTokenHashed, verify.id])

        //2.8 send cookies as payload
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

        //2.9 return
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

//should not be in utils
router.get("/getCoachData", authenticateToken, async (req, res) => {

    //1.0 get coach data
    const coach = await pool.query(`
        SELECT email, role, profile_image_url, id, username  FROM users WHERE id = $1
    `, [req.user.id])

    //1.1 get client related to that coach
    const clients = await pool.query(`
        SELECT users.*
        FROM users
        JOIN coach_client_rel
            ON coach_client_rel.client_id = users.id
        WHERE coach_client_rel.coach_id = $1;
    `, [req.user.id])

    //1.2 get programs from that coach 
    const programs = await pool.query(`
        SELECT * FROM programs WHERE coach_id = $1
    `, [req.user.id])

    res.json({
        coach: coach.rows[0],
        client: clients.rows,
        programs: programs.rows,
    })
})

module.exports = router;