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
    //1.0 pull clients to map on coachHome
    const clients = await pool.query(`
        SELECT email, username, id, role, profile_image_url FROM users WHERE role = 'client'
    `)

    res.json({
        success: true,
        clients: clients.rows
    })
})

//shopuld be patch
router.post("/addBio", authenticateToken, async (req, res) => {
    //1.0 Update Bio (should be PATCH ne POST)
    const userData = await pool.query(`
        UPDATE users SET bio = $1 WHERE id = $2 RETURNING bio;
    `,[req.body.bio, req.user.id])


    res.json({
        bio: userData.rows[0].bio
    })
})

//shopuld be patch
router.post("/changeUsername" , authenticateToken, async (req, res) => {
    //1.0 update usernbame
    const username = await pool.query(`
        UPDATE users SET username = $1 WHERE id = $2 RETURNING username
    `, [req.body.username, req.user.id])

    res.json({
        username: username.rows[0].username
    })
})

//shopuld be patch
router.post("/saveAccountInfo", authenticateToken, async (req, res) => {
    //1.0 update user info
    const updateUserInfo = await pool.query(`
        UPDATE users SET
            bio = $1,
            display_name = $2
        WHERE id = $3
        RETURNING bio,display_name
    `, [req.body.bio, req.body.displayName, req.user.id])

    res.json({
        bio: updateUserInfo.rows[0].bio,
        displayName: updateUserInfo.rows[0].display_name
    })
})

router.post("/changePassword", authenticateToken, async (req, res) => {
    try {
        //1.0 check if psw matches zod crioteria
        const resoult = passwordSchema.parse(req.body.newPassword)

        //2.0 get psw 
        const userPassword = await pool.query(`
            SELECT password_hash FROM users WHERE id = $1
        `, [req.user.id])

        //3.0 error check ce je in db
        if(userPassword.rows.length === 0){
            return res.json({
                success: false,
                message: "User in db not found"
            })
        }

        //4.0 verify psw
        const verfyPassword = await bcrypt.compare(req.body.currentPassword, userPassword.rows[0].password_hash)

        //4.1 psw safety check
        if(!verfyPassword){
            return res.json({
                success: false,
                message: "Wrong password cunt"
            })
        }

        //5.0 make and hash new psw (confirm psw je checked in frontend)
        const newPasswordHash = await bcrypt.hash(resoult, 10)

        //5.1 UPDATE psw in DB
        await pool.query(`
            UPDATE users SET
                password_hash = $1
            WHERE id = $2
            RETURNING password_hash
        `, [newPasswordHash, req.user.id])

        //6.0
        res.json({
            success: true,
            message: "Password Changed"
        })
        
    } catch (err) {
        //7.0 error handling
        return res.status(500).json({
            success: false,
            message: err.issues[0].message
        })
    }
})

router.post("/createProgram", authenticateToken, async (req, res) => {

    //1.0 not gonna lie to query je chat generatu:: however vem da nardi weeks in workout days based on program weeks in program days
    //basicaly kot neek loop go genereta new week x amount of time in workout days x amount of times
    //in usaj workout day ma svoj weekid in usak week id pa svoj program id
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
    })
})

router.post("/addExercise", authenticateToken, async (req, res) => {

    //1.0 ISNERT into EX new Exercise
    //Should be error check ce je ze u db
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
    })
})

router.post("/addClient", authenticateToken, async (req, res) => {
    //1.0 self explenatory add client to coach
    await pool.query(`
        INSERT INTO coach_client_rel (
            coach_id,
            client_id
        ) VALUES( $1, $2)
    `,[req.user.id, req.body.client.id])

    res.json({
       success: true
    })
})

router.patch("/addRole/:role", authenticateToken, async (req, res) => {
    //1.0 to pride after login ce je role === null
    await pool.query(`
        UPDATE users SET role = $1 WHERE id = $2
    `, [req.params.role, req.user.id])

    res.json({
        success: true,
        redirect: "/home",
        role: req.params.role
    })
})


module.exports = router