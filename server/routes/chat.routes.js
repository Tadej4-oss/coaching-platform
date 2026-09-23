const express = require("express")
const router = express.Router()
const authenticateToken = require("../middleware/auth.middleware")
const pool = require("../src/db")

router.get("/getconvo/:id", authenticateToken, async (req, res) => {
    //1.0 get room id from params
    const room = req.params.id

    //2.0 get convo from messages in usernaame in email from users also order by
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

    //3.0 posli convo to frontend
    res.json({
        chat: convo.rows
    })
})

router.get("/getRoomid/:id", authenticateToken, async (req, res) => {
    //1.0 get coach in client zato da ves kjr room poslat
    const coach = req.user.id
    const client = req.params.id

    //2.0 najdi ta room in db
    const roomId = await pool.query(`
        SELECT id FROM conversations WHERE coach_id = $1 AND client_id = $2
    `, [coach, client])

    //2.1 če ga ni ga naredi
    if(roomId.rows.length === 0){
        const createRoom = await pool.query(`
            INSERT INTO conversations (
                coach_id,
                client_id
            ) VALUES ($1, $2) RETURNING id;
        `, [coach, client])


        //2.2 posli romm id
        return res.json({
            success: true,
            room: createRoom.rows[0].id
        })
    }

    //3 posli romm id
    res.json({
        success: true,
        room: roomId.rows[0].id
    })
})

router.post("/createmessage", authenticateToken, async (req, res) => {
    //1.0 INSERT into messages
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

    //2.0 send success
    res.json({
        success: true
    })

})

router.get("/pullclient/:id", authenticateToken, async (req, res) => {
    //1.0 messageroom za coacha je drgacn k za client. tko da tle isotcasno pullas id od current userja in data 
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