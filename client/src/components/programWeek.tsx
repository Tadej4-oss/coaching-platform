import { useNavigate, useParams } from "react-router-dom"
import type { WorkoutDay } from "../types/client"
import { useEffect, useState } from "react"
import "./styles/programWeek.css"

export default function ProgramWeek(){
    const [days, setDays] = useState<WorkoutDay[]>([])
    const [dayId, setDayId] = useState<number>(0)
    const [description, setDescription] = useState<string>("")
    const [searchExercise, setSearchExercise] = useState<string>("")

    const nav = useNavigate()
    const { weekid } = useParams()

    useEffect(() => {
        async function pullWeek() {
            const response = await fetch(`http://localhost:5000/workouts/getWeekDays/${weekid}`, {
                credentials: "include"
            })

            const data = await response.json()
            setDays(data.week_days)
            console.log(data)
        }
        pullWeek()
    },[])

    async function updateWorkoutDescription() {
        const response = await fetch(`http://localhost:5000/workouts/updateDayDescription/${dayId}/${description}`, {
            method: "PATCH",
            credentials: "include"
        })

        const data = await response.json()
        console.log(data)
        setDescription("")
    }

    async function getExercise() {
         const response = await fetch(`http://localhost:5000/workouts/searchExercise/${searchExercise}`, {
            method: "GET",
            credentials: "include"
        })

        const data = await response.json()
        console.log(data)
    }

    return(
        <>
        <input style = {{display: "none"}}type = "checkbox" id = "indiv-day-label" />
        <label className = "back-arrow"onClick={() => {nav("/programs")}}> 
            <h1>↩</h1>
        </label>

        <div className="workout-day-div">
            <h1>week: {weekid}</h1>
            {days?.map((day) => (
                <label htmlFor="indiv-day-label" onClick={() => {setDayId(day.id)}}>
                    <div className="workout-day-card"  key = {day.id}>
                        <p>{day.name}</p>
                        <p>{day.description}</p>
                    </div>
                </label>
            ))}
        </div>

        {/* sidemenu */}

        <div className="indiv-day-sidemenu">
             <label className = "back-arrow" htmlFor="indiv-day-label"> 
                <h1>↩</h1>
            </label>
            <input placeholder = "e.g: Push, Pull" value={description} onChange={(e) => {setDescription(e.target.value)}}/>
            <button onClick={updateWorkoutDescription} >change description</button>

            <div>
                <h3>Search Ex:</h3>
                <input value = {searchExercise} onChange={(e) => {setSearchExercise(e.target.value)}}/>
                <button onClick={getExercise}>Search</button>
            </div>

            <div>
                <h3>Resoults</h3>
            </div>
        </div>
        </>
    )
}