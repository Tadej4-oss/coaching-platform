import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import type { Exercises } from "../../types/client"
import "./indivDayExercises.css"
import { API_URL } from "../../config/api"

export default function IndivDayExercises(){
    const [exercises, setExercises] = useState<Exercises[]>([])

    const nav = useNavigate()
    const { weekid, dayid } = useParams()

    useEffect(() =>{
        async function getExercises(){
            const response = await fetch(`${API_URL}/workouts/pullExercises/${dayid}`, {
                credentials: "include"
            })

            const data = await response.json()
            setExercises(data.exercises)
            console.log(data.exercises)
        }

        getExercises()
    },[])

    async function removeExercise(id: number, index: number) {
        const response = await fetch(`${API_URL}/workouts/removeExercise/${id}/${dayid}`, {
            method: "DELETE",
            credentials: "include"
        })

        const data = await response.json()
        console.log(data)
        setExercises(exercises.filter((_, i) => i !== index));
    }

    return(
        <>
            <div className="exercise-day-page">

                <label className="back-arrow" onClick={() => nav(`/programs/workouts/${weekid}`)}>
                    <h1>↩</h1>
                </label>

                <h1 style = {{textAlign: "center"}} className="exercise-day-title">Current Exercises</h1>

                <div className="exercise-day-list">
                    {exercises?.map((ex, i) => (
                        <div className="exercise-day-card" key={ex.name}>

                            <div className="exercise-day-name">
                                <h2>{ex.name}</h2>
                                <div className="ex-sets-reps">
                                    <p>sets: {ex.sets}</p>
                                    <p>reps: {ex.reps}</p>
                                </div>
                            </div>

                            <div className="exercise-day-description">
                                <p>{ex.description}</p>
                            </div>

                            <video
                                className="exercise-day-video"
                                src={ex.video_url}
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                            
                            <button onClick={() => {removeExercise(ex.id, i)}}>Remove Exercise</button>
                            
                        </div>
                        
                    ))}
                </div>
                
            </div>
        </>
    )
}