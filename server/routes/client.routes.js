const express = require("express")
const router = express.Router()
const pool = require("../src/db")
const authenticateToken = require("../middleware/auth.middleware")

router.get("/pullData", authenticateToken, async (req, res) => {
    //console.log(req.user)

    const getCoach = await pool.query(`
        SELECT username, email, users.id FROM users JOIN coach_client_rel ON coach_client_rel.coach_id = users.id WHERE coach_client_rel.client_id = $1
    `, [req.user.id])

    const roomId = await pool.query(`
        SELECT id FROM conversations WHERE coach_id = $1 AND client_id = $2
    `, [getCoach.rows[0].id, req.user.id])

    const personalRecords = await pool.query(`
        SELECT * FROM client_progress WHERE client_id = $1 ORDER BY created_at DESC;
    `, [req.user.id])

    const programs = await pool.query(`
        SELECT p.*
        FROM programs p
        JOIN client_programs cp
            ON cp.program_id = p.id
        WHERE cp.client_id = $1;
    `,[req.user.id])

    const programWeeks = await pool.query(`
        SELECT
            pw.*
        FROM client_programs cp

        JOIN program_weeks pw
            ON pw.program_id = cp.program_id

        WHERE cp.client_id = $1

        ORDER BY pw.program_id, pw.week_number;
    `, [req.user.id])


    if(roomId.rows.length === 0){
        const createRoom = await pool.query(`
            INSERT INTO conversations (
                coach_id,
                client_id
            ) VALUES ($1, $2) RETURNING id;
        `, [getCoach.rows[0].id, req.user.id])

        return res.json({
            room: createRoom.rows[0],
            coach: getCoach.rows[0],
            client_prs: personalRecords.rows
        })
    }


    res.json({
        room: roomId.rows[0],
        programs_weeks: programWeeks.rows,
        coach: getCoach.rows[0],
        programs: programs.rows,
        client_prs: personalRecords.rows
    })
})

router.get("/getWorkoutDays/:week_id/:program_id", authenticateToken, async (req, res) => {
    //1.0 variable destructuring 
    const { week_id, program_id } = req.params;

    //2.0 get workout days za indiviudual day 
    const result = await pool.query(`
        SELECT wd.*
        FROM workout_days wd
        JOIN program_weeks pw
            ON wd.program_week_id = pw.id
        WHERE pw.program_id = $1
        AND pw.week_number = $2
        ORDER BY wd.day_number
    `, [program_id, week_id]);


    //3.0 send data to frontend
    res.json({
        workout_days: result.rows,
    })
})

router.get("/getExercises/:day_id", authenticateToken, async (req, res) => {
    //1.0 get exercise for a specific day
    const exercises = await pool.query(`
        SELECT
            e.*,
            wde.sets,
            wde.reps
        FROM workout_day_exercises wde

        JOIN exercises e
            ON e.id = wde.exercise_id

        WHERE wde.workout_day_id = $1;
    `, [req.params.day_id])

    //2.0 send to frontend
    res.json({
        exercises: exercises.rows
    })
})

module.exports = router;