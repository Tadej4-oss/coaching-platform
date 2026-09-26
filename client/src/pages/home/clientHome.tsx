import { useEffect, useState } from "react"
import {  useNavigate } from "react-router-dom"
import { refreshToken } from "../../middleware/auth.ts"
import "./clientHome.css"
import type { Client } from "../../types/client.ts"
import { API_URL } from "../../config/api"

export default function ClientHome(){
    const [serverError, setServerError]  = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [personalRecords, setPersonalRecords] = useState<any[]>([])
    const [roomid, setRoomid] = useState<number>(0)
    const [programWeeks, setProgramWeeks] = useState<any[]>([])
    const [programs, setPrograms] = useState<any[]>([])
    const [currentProgram, setCurrentProgram] = useState<number>(14)
    const [coach, setCoach] = useState<any>()
    const [client, setClient] = useState<Client>({
        email: "",
        username: "",
        id: 0,
        role: "",
        profile_image_url: "",
        bio: ""
    })

    const nav = useNavigate()

    useEffect(() => {
        getMe()
        pullData()
    },[])

    async function pullData() {
        const response = await fetch(`${API_URL}/client/pullData`, {
            credentials: "include"
        })

        const data = await response.json()
        setCoach(data.coach)
        setRoomid(data.room.id)
        setProgramWeeks(data.programs_weeks)
        setPrograms(data.programs)
        setPersonalRecords(data.client_prs)

        console.log(data)
    }

    async function handleLogout(){
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-type" : "application/json"
            }
        })

        if(response.status === 201){
            nav("/login")
        }
    }

    async function getMe() {
        try {
            const response = await fetch(`${API_URL}/utils/me`, {
                credentials: "include"
            })

            if (response.status >= 500) {
                setServerError(true);
                return;
            }

            if(response.status === 401){
                const refresh = await refreshToken()

                if(!refresh.ok){
                    return nav("/login")
                }

                const retryResponse = await fetch(`${API_URL}/utils/me`, {
                    credentials: "include"
                })
            
                if(!retryResponse.ok){
                    nav("/login")
                }

            const data = await retryResponse.json()
            setClient(data.user)
            return console.log("refreshed token")
            

            }

            const data = await response.json()
            setClient(data.user)
            console.log("accesstokentoken")
            
        } catch (error) {
            setServerError(true)
        }
        finally{
            setLoading(false)
        }
    }


    if (loading) {
        return <h1>Connecting to server...</h1>;
    }

    if (serverError) {
        return (
            <div className="server-error">
                <h1>Server unavailable</h1>
                <p>Unable to connect to the server.</p>

                <button onClick={() => window.location.reload()}>
                    Try Again
                </button>
            </div>
        );
    }


    return(<>
        <input id ="profile-sidemenu" type = "checkbox" style={{display: "none"}}/>
        <label htmlFor = "profile-sidemenu" id = "profile-sidemenu-overlay" />
        <input style = {{display: "none"}} type="checkbox" id = "client-workouts-sidemenu" />

        <div className="coach-headers-div">
            <p>LOGO</p>
            <p>Notification</p>
            <label htmlFor="profile-sidemenu">
                <p >Profile</p>
            </label>
        </div>


        
        <div className="client-welcome-div">
            <p>Good Afternoon, {client?.username || "Client"}</p>
            <label htmlFor="client-workouts-sidemenu">
                <span className="show-weeks-btn">Current Program</span>
            </label>
            <div className="select-prog-div">
                <p>12 week strenght</p>
                <select defaultValue= "" onChange={(e) => setCurrentProgram(Number(e.target.value))}>
                    <option value="" disabled>•••</option>
                    {programs?.map((prog) => (
                        <>
                        <option value = {prog.id}>{prog.name}</option>
                        </>
                    ))}
                </select>
            </div>
        </div>

        <div className="personal-records">
            <h3>PERSONAL RECORDS</h3>
        
            <div className="pr-list">
                <div className="pr-row">
                    <p>{personalRecords[0]?.name || "Squat"}</p>
                    <span>{personalRecords[0]?.weight || "160 kg"}</span>
                    <span>{personalRecords[0]?.reps ? `x${personalRecords[0].reps}` : "x1"}</span>
                </div>
        
                <div className="pr-row">
                    <p>{personalRecords[1]?.name || "Bench"}</p>
                    <span>{personalRecords[1]?.weight || "110 kg"}</span>
                    <span>{personalRecords[1]?.reps ? `x${personalRecords[1].reps}` : "x1"}</span> 
                </div>
        
                <div className="pr-row">
                    <p>{personalRecords[2]?.name || "DeadLift"}</p>
                    <span>{personalRecords[2]?.weight || "190 kg"}</span>
                    <span>{personalRecords[2]?.reps ? `x${personalRecords[2].reps}` : "x1"}</span>
                </div>
            </div>
        
            <button onClick = {() => {nav(`/home/${client.id}/progress`)}}className="view-progress-btn">
                View Progress
            </button>
        </div>
        



        <div className="client-coach-div">
            <h3>YOUR COACH</h3>
            <p>{coach?.username ? coach?.username : "Coach"}</p>
            <p>Specification</p>
            <button onClick={() => {nav(`/chatroom/${roomid}`)}}>Message</button>
        </div>
    


        {/* week.map sidmenu */}
        <div className="workout-weeks-card">
            <label className = "back-arrow" htmlFor="client-workouts-sidemenu"> 
                <h1>↩</h1>
            </label>
            {programWeeks?.map((program) => (
                <>
                    {program.program_id === currentProgram ? 
                    (
                    <div className = "indiv-week" onClick={() => {nav(`/home/workouts/${program.week_number}/${currentProgram}`)}}>
                        <p>{program.name}</p>
                        <span>✔</span>
                    </div>
                    ) : 
                    (
                    <>

                    </>
                    )}
                </>
            ))}
        </div>

        {/* profile sidememenu div */}

        <div className="profile-sidemenu-div">
            <label htmlFor="profile-sidemenu">
                <h1>✕</h1>
            </label>
            <p className="sidemenu-profile-name">Client</p>
            <hr className="profile-sidemenu-hr" />
            <div className="menu-items">
                <p onClick={() => {nav("/profile")}}>My Profile</p>
                <p onClick={() => {nav("/accountSettings")}}>Account Settings</p>
                <p onClick={() => {nav("/changePassword")}}>Change Password</p>
                <p>Notifications</p>
                <p className="logout" onClick = {handleLogout}>Logout</p>
            </div>
        </div>
    </>)
}