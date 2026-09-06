const express = require("express")
const router = express.Router()
const authenticateToken = require("../middleware/auth.middleware")
const pool = require("../src/db")

router.get("/getconvo/:id", authenticateToken, async (req, res) => {
    const room = req.params.id

    const convo = await pool.query(`
        SELECT 
            messages.content,
            messages.sender_id,
            users.username,
            users.email
        FROM messages
        JOIN users ON users.id = messages.sender_id
        WHERE messages.conversation_id = $1
        ORDER BY messages.created_at ASC;
    `, [room])

    res.json({
        chat: convo.rows
    })
})

router.get("/getRoomid/:id", authenticateToken, async (req, res) => {
    const coach = req.user.id
    const client = req.params.id

    const roomId = await pool.query(`
        SELECT id FROM conversations WHERE coach_id = $1 AND client_id = $2
    `, [coach, client])

    if(roomId.rows.length === 0){
        const createRoom = await pool.query(`
            INSERT INTO conversations (
                coach_id,
                client_id
            ) VALUES ($1, $2) RETURNING id;
        `, [coach, client])


        return res.json({
            success: true,
            room: createRoom.rows[0].id
        })
    }
   
    console.log(roomId.rows[0])

    res.json({
        success: true,
        room: roomId.rows[0].id
    })
})

router.post("/createmessage", authenticateToken, async (req, res) => {
    console.log("sender id:", req.user.id)
    console.log("room id:", req.body.roomid)
    console.log("content:", req.body.newMessage)

    const createMessag = await pool.query(`
        INSERT INTO messages (
            conversation_id,
            sender_id,
            content
        ) VALUES($1, $2, $3)
    `, [
        req.body.roomid,
        req.user.id,
        req.body.newMessage
    ])

    res.json({
        message: "route works"
    })

})

router.get("/pullclient/:id", authenticateToken, async (req, res) => {
    const user = await pool.query(`
        SELECT client_id FROM conversations WHERE id = $1 AND coach_id = $2
    `, [req.params.id, req.user.id])

    const userdata = await pool.query(`
        SELECT * FROM users WHERE id = $1
    `, [user.rows[0].client_id])


    res.json({
        success: true,
        client: userdata.rows[0],
    })
})

module.exports = router