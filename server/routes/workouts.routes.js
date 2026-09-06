const express = require("express")
const router = express.Router()
const pool = require("../src/db")
const authenticateToken = require("../middleware/auth.middleware")
require("dotenv").config()

router.get("/getProgramData/:id", authenticateToken, async (req, res) => {
    console.log(req.params)

    const result = await pool.query(`
        SELECT *
        FROM program_weeks
        WHERE program_id = $1
        ORDER BY week_number ASC;
    `, [req.params.id])

    res.json({
        program_weeks: result.rows
    })
})

router.get("/getWeekDays/:id", authenticateToken, async (req, res) => {
    const result = await pool.query(`
        SELECT *
        FROM workout_days
        WHERE program_week_id = $1
        ORDER BY day_number ASC;
    `, [req.params.id])

    res.json({
        week_days: result.rows
    })
})

router.patch("/updateDayDescription/:id/:description", authenticateToken, async (req, res) => {
    await pool.query(`
        UPDATE workout_days
            SET
            description = $1
        WHERE id = $2
    `, [req.params.description, req.params.id])

    res.json({
        message: "workslololo"
    })
})

router.get("/searchExercise/:exercise", async (req, res) => {
    console.log(req.params.exercise)

    const url = `https://api.exerciseapi.dev/v1/exercises?q=bench%20press&limit=10`;

    const options = {
      method: 'GET',
      headers: {
        'X-API-Key': process.env.VITE_X_API_KEY
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      res.json({
        data
      })
    } catch (error) {
      console.error(error);
    }

})
module.exports = router
