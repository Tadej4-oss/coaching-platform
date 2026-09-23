import "./programs.css"
import { refreshToken } from "../../middleware/auth"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import type { Program, ProgramWeeks, Client } from "../../types/client"


export default function Programs(){
    const [programs, setPrograms] = useState<Program[]>([])
    const [programWeeks, setProgramWeeks] = useState<ProgramWeeks[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [programId, setProgramId] = useState<number>(0)
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
        setClients(data.clients)
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

    async function addPorgramToClient(id: number) {
        const response = await fetch(`http://localhost:5000/programs/addClientProgram/${id}/${programId}`, {
            method: "POST",
            credentials: "include",
        })

        const data = await response.json()
        console.log(data)
    }

    return(
    <>
    <input style = {{display: "none"}}type="checkbox" id = "program-dropdown" />
    <input style = {{display: "none"}}type="checkbox" id = "add-program-dropdown" />
    <label className = "back-arrow" onClick={() => {nav("/home")}}> 
        <h1>↩</h1>
    </label>

    <div className="programs-div">
        {programs?.map((prog) => (
            <>
            <label htmlFor="program-dropdown">
                <div className="programs-card" onClick={() => {pullProgramData(prog.id)}} key = {prog?.id}>
                    <h2>{prog?.name}</h2>
                    <p>{prog?.description}</p>
                    <h3>{prog?.goal}</h3>
                    <p>{prog?.duration_weeks}</p>
                    <p>{prog?.difficulty}</p>
                </div>
            </label>
            <label htmlFor="add-program-dropdown" onClick={() => {setProgramId(prog.id)}}>
                <p className = "add-program-btn"> Add Program To Client</p>
            </label>
            </>
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

    {/* add program dropdownm */}
    <div className="add-program-to-client-div">
        <label className = "back-arrow" htmlFor="add-program-dropdown"> 
            <h1>↩</h1>
        </label>
        {clients?.map((client) => (
            <div className = "add-to-client" key = {client.id}>
                <p>{client.email}</p>
                <button onClick={() => {addPorgramToClient(client.id)}}>Add</button>
            </div>
        ))}
    </div>
    </>
    )
}