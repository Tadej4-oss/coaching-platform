const express = require("express")
const router = express.Router()
const pool = require("../src/db")
const authenticateToken = require("../middleware/auth.middleware")

router.get("/getdata", authenticateToken, async (req, res) => {
    console.log(req.user)


    res.json({
        message: "getdata for client works"
    })
})

router.get("/pullData", authenticateToken, async (req, res) => {
    //console.log(req.user)

    const getCoach = await pool.query(`
        SELECT username, email, users.id FROM users JOIN coach_client_rel ON coach_client_rel.coach_id = users.id WHERE coach_client_rel.client_id = $1
    `, [req.user.id])

    const roomId = await pool.query(`
        SELECT id FROM conversations WHERE coach_id = $1 AND client_id = $2
    `, [getCoach.rows[0].id, req.user.id])

    const programs = await pool.query(`
        SELECT p.*
        FROM programs p
            JOIN client_programs cp
            ON cp.program_id = p.id
        WHERE cp.client_id = $1;
    `,[req.user.id])

    if(roomId.rows.length === 0){
        const createRoom = await pool.query(`
            INSERT INTO conversations (
                coach_id,
                client_id
            ) VALUES ($1, $2) RETURNING id;
        `, [getCoach.rows[0].id, req.user.id])

        return res.json({
            message: "get coach",
            coach: getCoach.rows[0],
            room: createRoom.rows[0],
            programs: programs.rows[0]
        })
    }


    res.json({
        message: "get coach",
        coach: getCoach.rows[0],
        room: roomId.rows[0],
        programs: programs.rows[0]
    })
})

module.exports = router;