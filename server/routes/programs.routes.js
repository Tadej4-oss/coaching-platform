const express = require("express")
const router = express.Router()
const pool = require("../src/db")
const authenticateToken = require("../middleware/auth.middleware")

router.get("/getPrograms", authenticateToken, async(req, res) => {
    //1.0 get programs belongign to this coach
    const programData = await pool.query(`
        SELECT * FROM programs WHERE coach_id = $1
    `,[req.user.id])

    //1.0 get * from user where client belongs to coach belongign to this coach
    const clients = await pool.query(`
        SELECT u.*
            FROM users u
            JOIN coach_client_rel ccr ON ccr.client_id = u.id
            WHERE ccr.coach_id = $1;
    `, [req.user.id])


    res.json({
        programs: programData.rows,
        clients: clients.rows
    })
})

router.post("/addClientProgram/:client_id/:program_id", authenticateToken, async (req, res) => {
    //1.0 check if program exists
    const checkProgram = await pool.query(`
        SELECT * FROM client_programs WHERE client_id = $1 AND program_id = $2
    `, [req.params.client_id, req.params.program_id])

    //2.0 if not exists insert
    if(checkProgram.rows.length === 0){
        const addProgram = await pool.query(`
        INSERT INTO client_programs(
            client_id,
            program_id
        ) VALUES ($1, $2)
        `,[req.params.client_id, req.params.program_id ])

        return res.json({
        message: "inserted into DB"
    })
    }

    res.json({
        message: "allready in db"
    })
})




module.exports = router