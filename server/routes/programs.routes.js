const express = require("express")
const router = express.Router()
const pool = require("../src/db")
const authenticateToken = require("../middleware/auth.middleware")

router.get("/getPrograms", authenticateToken, async(req, res) => {
    const programData = await pool.query(`
        SELECT * FROM programs WHERE coach_id = $1
    `,[req.user.id])


    res.json({
        message: "WORKS LOLOLO",
        programs: programData.rows
    })
})

router.get("/addExerciseToProgram", authenticateToken, async (req, res) => {
    console.log(req.body)


    res.json({
        message: "add ex route works"
    })
})

router.patch("/addProgram/:id/:program_id", authenticateToken, async (req, res) => {
    console.log(req.params)

    const checkProgram = await pool.query(`
        SELECT * FROM client_programs WHERE client_id = $1 AND program_id = $2
    `,[
        req.params.id,
        req.params.program_id
    ])

    if(checkProgram.rows.length > 0){
        console.log("program allready added to client")
        return res.json({
            message: "program allready added to client"
        })
    }

    await pool.query(`
        INSERT INTO client_programs (
            client_id,
            program_id
        ) VALUES (
            $1, $2 
        )
    `, [
        req.params.id,
        req.params.program_id
    ])



    res.json({
        message: "new program added"
    })
})




module.exports = router