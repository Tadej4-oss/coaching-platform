const express = require("express")
const router = express.Router()
const pool = require("../src/db")
const authenticateToken = require("../middleware/auth.middleware")

router.post("/addProgress", authenticateToken, async (req, res) => {
    //1.0 destructure data from body
    const  {weight, currentExercise, reps } = req.body

    //2.0 get exercise
    const exerciseId = await pool.query(`
        SELECT id FROM exercises WHERE name = $1
    `, [currentExercise])

    //3.0 if no exercises je frontend neki narobe
    if(exerciseId.rows.length === 0){
        return res.json({
            message: "error status (no id in ex)"
        })
    }

    //4.0 INSERT PROGRESS
    await pool.query(`
        INSERT INTO client_progress (
            client_id,
            exercise_id,
            weight,
            reps,
            name
        ) VALUES ($1, $2, $3, $4, $5)
    `, [req.user.id, exerciseId.rows[0].id, weight, reps, currentExercise])

    res.json({
        success: true
    })
})

router.get("/pullData", authenticateToken, async (req, res) => {
    //1.0 get ex chose from in frontend
    const exercises = await pool.query(`
        SELECT name FROM exercises
    `)

    //2.0 get data za progress.map
    const clientProgress = await pool.query(`
        SELECT * FROM client_progress WHERE client_id = $1 ORDER BY created_at DESC;
    `, [req.user.id])
   
    //3.0 send both data
    res.json({
        exercises: exercises.rows,
        client_pr: clientProgress.rows
    })
})

module.exports = router