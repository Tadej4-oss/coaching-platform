const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const app = express()
const pool = require("./src/db")
const path = require("path")
const PORT = 5000

const authRoutes = require("./routes/auth.routes")
const chatRoutes = require("./routes/chat.routes")
const utilRoutes = require("./utils/auth.utils")
const userRoutes = require("./routes/users.routes")
const programsRoutes = require("./routes/programs.routes")
const clientRoutes = require("./routes/client.routes")
const workoutRoutes = require("./routes/workouts.routes")
const progressRoutes = require("./routes/progress.routes")


app.use(
    express.json(), 
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:4173"
        ],
        credentials: true
    }),
    cookieParser()
)

// Make files inside backend/uploads publicly available.
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use("/chatroom", chatRoutes)
app.use("/programs", programsRoutes)
app.use("/auth", authRoutes)
app.use("/utils", utilRoutes)
app.use("/users", userRoutes)
app.use("/client", clientRoutes)
app.use("/workouts", workoutRoutes)
app.use("/progress", progressRoutes)

app.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() AS current_time");

        res.json({
            success: true,
            time: result.rows[0].current_time,
            message: "backend works"
        });

    } catch (error) {
        console.error(error);
        
        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
});

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})