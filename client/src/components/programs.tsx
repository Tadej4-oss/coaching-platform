import "./styles/programs.css"
import { refreshToken } from "./middleware/auth"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import type { Program, ProgramWeeks } from "../types/client"


export default function Programs(){
    const [programs, setPrograms] = useState<Program[]>([])
    const [programWeeks, setProgramWeeks] = useState<ProgramWeeks[]>([])
    const nav = useNavigate()

    useEffect(() => {
        handleAuth()
        pullData()
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

    async function pullData(){
        const response = await fetch("http://localhost:5000/programs/getPrograms", {
            credentials: "include"
        })

        const data = await response.json()
        setPrograms(data.programs)
        console.log(data)
    }

    async function pullProgramData(id: number) {
        const response = await fetch(`http://localhost:5000/workouts/getProgramData/${id}`, {
            credentials: "include"
        })

        const data = await response.json()
        setProgramWeeks(data.program_weeks)
        console.log(data)
    }

    return(
    <>
    <input style = {{display: "none"}}type="checkbox" id = "program-dropdown" />
    <label className = "back-arrow" onClick={() => {nav("/home")}}> 
        <h1>↩</h1>
    </label>

    <div className="programs-div">
        {programs?.map((prog) => (
            <label htmlFor="program-dropdown">
                <div className="programs-card" onClick={() => {pullProgramData(prog.id)}} key = {prog?.id}>
                    <h2>{prog?.name}</h2>
                    <p>{prog?.description}</p>
                    <h3>{prog?.goal}</h3>
                    <p>{prog?.duration_weeks}</p>
                    <p>{prog?.difficulty}</p>
                </div>
            </label>
        ))}
    </div>

    {/* program dropdownm */}
    <div className="program-weeks-dropdown">
        <label className = "back-arrow" htmlFor="program-dropdown"> 
            <h1>↩</h1>
        </label>
        {programWeeks?.map((week) => (
            <>
            <div className="week-card" key = {week?.id}>
                <h2 onClick={() => {nav(`/programs/workouts/${week.id}`)}}>{week.name}</h2>
            </div>
            </>
        ))}
    </div> 
    </>
    )
}