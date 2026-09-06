const express = require("express")
const router = express.Router()
const pool = require("../src/db")
const authenticateToken = require("../middleware/auth.middleware")
const { z } = require("zod")
const bcrypt = require("bcrypt")

const passwordSchema = z
        .string()
        .min(8)
        .max(128)
        .regex(/[a-z]/, "Password must contain a lowercase letter")
        .regex(/[A-Z]/, "Password must contain an uppercase letter")
        .regex(/\d/, "Password must contain a number")
        .regex(/[^\w\s]/, "Passowrd must contain a special character")


router.get("/getClients", async (req,res) => {
    const clients = await pool.query(`
        SELECT email, username, id, role, profile_image_url FROM users WHERE role = 'client'
    `)

    res.json({
        success: true,
        clients: clients.rows
    })
})

router.post("/addBio", authenticateToken, async (req, res) => {
    const userData = await pool.query(`
        UPDATE users SET bio = $1 WHERE id = $2 RETURNING bio;
    `,[req.body.bio, req.user.id])


    res.json({
        message: "bio route works",
        bio: userData.rows[0].bio
    })
})

router.post("/changeUsername" , authenticateToken, async (req, res) => {
    const username = await pool.query(`
        UPDATE users SET username = $1 WHERE id = $2 RETURNING username
    `, [req.body.username, req.user.id])

    res.json({
        message: "changeusername route works",
        username: username.rows[0].username
    })
})

router.post("/saveAccountInfo", authenticateToken, async (req, res) => {
    const updateUserInfo = await pool.query(`
        UPDATE users SET
            bio = $1,
            display_name = $2
        WHERE id = $3
        RETURNING bio,display_name
    `, [req.body.bio, req.body.displayName, req.user.id])

    console.log(updateUserInfo.rows)


    res.json({
        bio: updateUserInfo.rows[0].bio,
        displayName: updateUserInfo.rows[0].display_name
    })
})

router.post("/changePassword", authenticateToken, async (req, res) => {
    try {
        const resoult = passwordSchema.parse(req.body.newPassword)

        const userPassword = await pool.query(`
            SELECT password_hash FROM users WHERE id = $1
        `, [req.user.id])

        if(userPassword.rows.length === 0){
            return res.json({
                success: false,
                message: "User in db not found"
            })
        }

        const verfyPassword = await bcrypt.compare(req.body.currentPassword, userPassword.rows[0].password_hash)

        if(!verfyPassword){
            return res.json({
                success: false,
                message: "Wrong password cunt"
            })
        }

        const newPasswordHash = await bcrypt.hash(resoult, 10)

        const updatePassword = await pool.query(`
            UPDATE users SET
                password_hash = $1
            WHERE id = $2
            RETURNING password_hash
        `, [newPasswordHash, req.user.id])


        res.json({
            success: true,
            message: "Password Changed"
        })
        
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.issues[0].message
        })
    }
})

router.post("/createProgram", authenticateToken, async (req, res) => {
    console.log(req.body.program)

    const result = await pool.query(
    `
    WITH new_program AS (
        INSERT INTO programs (
            coach_id,
            name,
            description,
            goal,
            difficulty,
            duration_weeks,
            days_per_week
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    ),

    new_weeks AS (
        INSERT INTO program_weeks (
            program_id,
            week_number,
            name
        )
        SELECT
            new_program.id,
            week_number,
            'Week ' || week_number
        FROM new_program
        CROSS JOIN generate_series(1, $6::integer) AS week_number

        RETURNING id, week_number
    )

    INSERT INTO workout_days (
        program_week_id,
        day_number,
        name
    )
    SELECT
        new_weeks.id,
        day_number,
        'Day ' || day_number
    FROM new_weeks
    CROSS JOIN generate_series(1, $7::integer) AS day_number

    RETURNING *;
    `,
    [
        req.user.id,
        req.body.program.name,
        req.body.program.description,
        req.body.program.goal,
        req.body.program.difficulty,
        req.body.program.duration,
        req.body.program.daysPerWeek
    ]
);


    res.json({
        success: true,
        message: "Proghram route works"
    })
})

router.post("/addExercise", authenticateToken, async (req, res) => {

    await pool.query(`
        INSERT INTO exercises (
        coach_id,
        name,
        description,
        muscle_group,
        equipment,
        video_url
        )
        VALUES ($1, $2, $3, $4, $5, $6)
    `, [
        req.user.id,
        req.body.name,
        req.body.overview,
        req.body.primaryMuscle,
        req.body.equipment,
        req.body.video
    ])

    res.json({
        success: true,
        message: "exercise rpoute works"
    })
})

router.post("/addClient", authenticateToken, async (req, res) => {
    await pool.query(`
        INSERT INTO coach_client_rel (
            coach_id,
            client_id
        ) VALUES( $1, $2)
    `,[req.user.id, req.body.client.id])

    res.json({
        message: "route works"
    })
})



module.exports = router