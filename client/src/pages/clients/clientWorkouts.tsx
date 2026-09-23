import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "./clientWorkouts.css"

export default function ClientWorkouts(){
    const {weeknumber, programid} = useParams()
    const [workoutDay, setWorkoutDay] = useState<any[]>([])
    const [exercises, setExercises] = useState<any[]>([])

    const nav = useNavigate()

    useEffect(() => {
        getWorkoutDays()
    },[])

    async function getWorkoutDays() {
        const response = await fetch(`http://localhost:5000/client/getWorkoutDays/${weeknumber}/${programid}`, {
            credentials: "include"
        })

        const data = await response.json()
        setWorkoutDay(data.workout_days)
        console.log(data)
    }

    async function pullExercises(id: number) {
        const response = await fetch(`http://localhost:5000/client/getExercises/${id}`, {
            credentials: "include"
        })

        const data = await response.json()
        setExercises(data.exercises)
        console.log(data)
    }

    return(
    <>
        <input style = {{display: "none"}}type="checkbox" id = "exercises-dropdown"/>
        <h1 style={{textAlign: "center"}}>Client Workouts</h1>
        <label className = "back-arrow" onClick={() => {nav("/home")}}> 
            <h1>↩</h1>
        </label>
        <div className="workout-days-card">
            {workoutDay?.map((day) => (
                <label htmlFor="exercises-dropdown">
                    <div className="current-day-ex" onClick={() =>{pullExercises(day.id)}}>
                        <h3>{day.name}</h3>
                        <p>{day.description}</p>
                    </div>
                </label>
            ))}
        </div>


        {/* ex dropdown sidemenu */}
        <div className="exercises-card">
            <label className = "back-arrow" htmlFor="exercises-dropdown"> 
                <h1>↩</h1>
            </label>
            {exercises?.map((ex) => (
                <div className="indiv-exercise">
                    <h3 className="ex-name">{ex.name}</h3>
                    <p className="ex-descriptione">{ex.description}</p>
                    <div>
                        <p className="ex-sets">sets: {ex.sets}</p>
                        <p className="ex-reps">reps: {ex.reps}</p>
                    </div>
                    <video
                        className="exercsie-video"      
                        src={ex.video_url}
                        autoPlay
                        loop
                        muted
                        playsInline  
                    />
                </div>
            ))}
        </div>

    </>)
}