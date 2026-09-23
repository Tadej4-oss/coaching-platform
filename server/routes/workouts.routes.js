const express = require("express")
const router = express.Router()
const pool = require("../src/db")
const authenticateToken = require("../middleware/auth.middleware")
require("dotenv").config()

router.get("/getProgramData/:id", authenticateToken, async (req, res) => {
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
        success: true
    })
})

//third party API integration
router.get("/searchExercise/:exercise", async (req, res) => {
    //1.0 define custom query urls (limit 10, ma video)
    const url = `https://api.exerciseapi.dev/v1/exercises?q=${req.params.exercise}&limit=10&hasVideo=true`;;

    //1.1 define options 
    const options = {
      method: 'GET', //obvius
      headers: {
        'X-API-Key': process.env.EXERCISE_API_KEY // auth key, nek "to sm js" safety check
      }
    };

    //2.0 fetch exercise
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

router.post("/addExercise", authenticateToken, async (req, res) => {
    let exId = 0;

    //1.0 poglej ce je ex u db
    const checkExercise = await pool.query(`
        SELECT id FROM exercises WHERE name = $1
    `,[req.body.name])

    //1.1 ce je, set id
    if(checkExercise.rows.length > 0){
        exId = checkExercise.rows[0].id
    }

    //2.0 if not exists insert
    if(checkExercise.rows.length === 0){
        const insertExercise = await pool.query(`
            INSERT INTO exercises (
                coach_id,
                name,
                description,
                muscle_group,
                equipment,
                video_url
            ) VALUES ($1, $2, $3, $4, $5, $6) returning id
        `,[
            req.user.id,
            req.body.name,
            req.body.description,
            req.body.muscle_group,
            req.body.equipment,
            req.body.video_url
        ])

        exId = insertExercise.rows[0].id
    }

    //2.1 če je, check ce je allready in workout_day_ex
    const checkDayEx = await pool.query(`
        SELECT * FROM workout_day_exercises WHERE workout_day_id = $1 AND exercise_id = $2
    `, [req.body.dayId, exId])


    //2.2 if not insert it
    if(checkDayEx.rows.length === 0){
        //insert it
        const insertDayEx = await pool.query(`
            INSERT INTO workout_day_exercises (
                workout_day_id,
                exercise_id,
                sets,
                reps
            ) VALUES ($1, $2, $3, $4) returning id
        `,[
            req.body.dayId,
            exId,
            req.body.sets,
            req.body.reps
        ])
        //2.3 fininsh after insert
        return res.json({
            message: "inserted into workout_day_exercises"
        })

    }

    //3.0 was allready inserted or in db so finish 
    return res.json({
        message: "allready in workout_day_exercises and exercises"
    })


})

router.get("/pullExercises/:dayid", authenticateToken, async (req, res) => {
    //chat query. prompt = (get me all exercises with sets and reps)
    const pullExercises = await pool.query(`
        SELECT 
            e.*,
            wde.sets,
            wde.reps
        FROM exercises e
        JOIN workout_day_exercises wde
            ON e.id = wde.exercise_id
        WHERE wde.workout_day_id = $1;
        `,[req.params.dayid])

    

    res.json({
        exercises: pullExercises.rows
    })
})

router.delete("/removeExercise/:exercise/:day", authenticateToken, async (req, res) => {
   await pool.query(`
       DELETE FROM workout_day_exercises WHERE workout_day_id = $1 AND exercise_id = $2
   `, [req.params.day, req.params.exercise])

    res.json({
        message: "ex removed"
    })
})
module.exports = router
