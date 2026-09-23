import { useNavigate } from "react-router-dom"
import { refreshToken } from "../../middleware/auth"
import { useEffect, useState} from "react"
import type { Exercises } from "../../types/client"
import "./createExercise.css"


export default function CreateExercise(){
    const [searchExercise, setSearchExercise] = useState<string>("")
    const [exercise, setExercise] = useState<Exercises[]>([])

    const nav = useNavigate()

    useEffect(() => {
        handleAuth()
    },[])

    async function handleAuth(){
        const resposne = await fetch("http://localhost:5000/utils/me", {
            credentials: "include"
        })

        if(resposne.status === 401){
            const refresh = await refreshToken()

            if(!refresh.ok){
                return nav("/login")
            }
            

            const retryResponse = await fetch("http://localhost:5000/utils/me", {
                credentials: "include"
            })

            if(!retryResponse.ok){
                return nav("/login")
            }

            return console.log("refresh ran new accestoken issued")
        }

        console.log("no refresh ran at all token works")
    }

    async function getExercise() {
        const response = await fetch(`https://api.exerciseapi.dev/v1/exercises?q=${encodeURIComponent(searchExercise)}&limit=10&hasVideo=true`,{
            headers: {
                "X-API-KEY": import.meta.env.VITE_X_API_KEY
            }
        });

        const data = await response.json()
        console.log(data.data)
        setExercise(data.data)
       
                
    }
    

    async function addExercise(i: number) {
        const response = await fetch("http://localhost:5000/users/addExercise", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-type" : "Application/json"
            },
            body: JSON.stringify({
                name: exercise[i].name,
                overview: exercise[i].description,
                primaryMuscle: exercise[i].primaryMuscles[0],
                equipment: exercise[i].equipment,
                video: exercise[i].videos[0].url

            })
        })

        const data = await response.json()
        console.log(data)
    }
    return(<>
    <h1 className="x-button" onClick={() => {nav("/home")}}>✕</h1>
        <div className="exercise-input-div">
            <h1>Create Exercise</h1>
            <input value={searchExercise} onChange={(e) => {setSearchExercise(e.target.value)}} placeholder="Search for an exercise..." />
            <button onClick={getExercise}>GET</button>  
        </div>

        
        <div className = "searched-exercise-div" style = {{display: "flex", flexDirection: "column"}}>
            {exercise.map((ex, i) => (
                <div className="exercise-result-card" key={i}>
                    <h2>{`${i + 1}:${ex?.name}`}</h2>
                    <h3>{`Primary Muscles: ${ex?.primaryMuscles}`}</h3>
                    <p>{`Equipment: ${ex?.equipment}`}</p>
                    <p>{ex?.description}</p>
                    <video src = {ex?.videos[0].url} 
                    preload="auto"
                    loop
                    muted
                    autoPlay
                    />
                    <button onClick={() => {addExercise(i)}}>ADD EXERCISE</button>
                </div>
            ))}
        </div>
    </>)
}