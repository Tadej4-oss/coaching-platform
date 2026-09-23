import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./progress.css"


export default function Progress(){
    const [currentExercise, setCurrentExercise] = useState<string>("")
    const [weight, setWeight] = useState<number>(0)
    const [reps, setReps] = useState<number>(0)
    const [exercises, setExercises] = useState<any[]>([])
    const [clientPRs, setClientPRs] = useState<any[]>([])
    
    const nav = useNavigate()

    useEffect(() => {
         async function pullExercises() {
            const response = await fetch("http://localhost:5000/progress/pullData", {
                credentials: "include"
            })
        
            const data = await response.json()
            setExercises(data.exercises)
            setClientPRs(data.client_pr)
            console.log(data)
        }

        pullExercises()
    },[])

    async function addProgress() {
        const response = await fetch("http://localhost:5000/progress/addProgress", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-type" : "application/json"
            },
            body: JSON.stringify({
                weight,
                currentExercise,
                reps
            })

        })

        const data = await response.json()
        setClientPRs(prev => [
            {name: currentExercise, weight, reps },
            ...prev
        ]);
        setReps(0)
        setWeight(0)
        console.log(data)
    }


    return(
        <>
        <label onClick = {() => {nav("/home")}}className = "back-arrow"> 
            <h1>↩</h1>
        </label>
        <h1 style={{textAlign: "center"}}>Client Progress</h1>
        <div className="enter-progress-card">
            <div className="enter-pr-inputs">

                <div className="enter-weight">
                    <p>Enter Weight:</p>
                    <input onChange = {(e) => {setWeight(Number(e.target.value))}} placeholder = "kg" value={weight}/> 
                </div>

                <div className="enter-reps">
                    <p>Enter Reps:</p>
                    <input onChange = {(e) => {setReps(Number(e.target.value))}} placeholder = "reps" value={reps}/>
                </div>

            </div>

            <div className="chose-ex-input">
                <p>Enter Exercise:</p>
                <select defaultValue = "" onChange={(e) => setCurrentExercise(e.target.value)}>
                    <option value= "">•••</option>
                    {exercises?.map((ex) => (
                        
                        <option key = {ex.name}>{ex.name}</option>
                        
                    ))}
                </select>
            </div>

            <button onClick={addProgress}>Add Progress</button>
        </div>
    
        <div className="current-progress-box">
            {clientPRs?.map((ex) => (
                <>
                <div className="indiv-pr">
                    <p>{ex.name}</p>
                    <p>{ex.weight}</p>
                    <p>{ex.reps}</p>
                </div>
                </>
            ))}
        </div>
        </>
    )
}