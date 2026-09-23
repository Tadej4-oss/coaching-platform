import { useEffect, useState } from "react"
import "./coachHome.css"
import type { Client, Coach } from "../../types/client"
import { useNavigate } from "react-router-dom"

export default function CoachHome(){
    //decleare variables
    const [clients, setClients] = useState<Client[]>([])
    const [coach, setCoach] = useState<Coach | null>(null)
    const [programs, setPrograms] = useState<number>(0)

    //for routes (react-router)
    const nav = useNavigate()

    //pull data on render
    useEffect(() => {
        async function pullData(){
            const response = await fetch("http://localhost:5000/utils/getCoachData", {
                credentials: "include"
            })

            const data = await response.json()
            setCoach(data.coach)
            setClients(data.client)
            setPrograms(data.programs.length)
        }

        pullData()
    },[])

    //logouts
    async function handleLogout(){
         await fetch("http://localhost:5000/auth/logout", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-type" : "application/json"
            }
        })

        
        nav("/login")
        
    }

    //get room id
    async function getRoomId(id: number){
        const response = await fetch(`http://localhost:5000/chatroom/getRoomid/${id}`, {
            credentials: "include"
        })

        const data = await response.json()
        if(data.success){
            nav(`/chatroom/${data.room}`)
        }
    }
    
    return(
        <>
            <input id ="profile-sidemenu" type = "checkbox" style={{display: "none"}}/>
            <label htmlFor = "profile-sidemenu" id = "profile-sidemenu-overlay" />

            <div className="coach-headers-div">
                <p>LOGO</p>
                <p>Notification</p>
                <label htmlFor="profile-sidemenu">
                    <p >Profile</p>
                </label>
            </div>
             
    

            <div className="welcome-div">
                <p>Good afternoon, {coach?.username} 👋</p>
                <p>Clients: {clients.length}</p>
                <p onClick={() => {nav("/programs")}}>Programs: {programs}</p>
                <p>Today's Sessions: x</p>
                
                
            </div>

            <div className="recent-activity-div">
                <p>Recent Activity</p>
                <p>✓ John completed Leg Day</p>
                <p>✓ Sarah set a new Bench PR</p>
                <p>✓ Mike missed yesterday's workout</p>
            </div>

            <div className="your-clients-header">
                <p>Your Clients</p>
                <p>Client List</p>
            </div>

            <div className="your-clients-div">
                {clients ? 
                <>
                    {clients?.map((client, index) => {
                        return(
                        <div onClick = {() =>{getRoomId(client.id)}} key = {client.id} className="scroll-clients-div">
                            <p className = "client-profile-card-username" >{client.username || `Client${index}`}</p>
                            <img className = "client-profile-card-pfp" src={`http://localhost:5000${client.profile_image_url}`} alt = "profile picture"></img>
                            <p className = "client-profile-card-email">{client.email}</p>
                            <p className = "client-profile-card-bio">{client.bio ||"No bio yet"}</p>
                        </div>
                        )
                    })}
                </> : 
                <>
                    <h1>No client, try Adding clients</h1>
                </>}
            </div>

            <div className="quick-action-div">
                <h3>Quick Actions</h3>
                <p onClick={() =>{nav("/addProgram")}}>+ New Program</p>
                <p onClick={() =>{nav("/addClient")}}>+ Add Client</p>
                <p onClick={() =>{nav("/createExercise")}}>+ Add Exercise</p>
            </div>

            {/* profile sidememenu div */}

            <div className="profile-sidemenu-div">
                <label htmlFor="profile-sidemenu">
                    <h1>✕</h1>
                </label>

                <p className="sidemenu-profile-name">{coach?.username}</p>
                <hr className="profile-sidemenu-hr" />

                <div className="menu-items">
                    <p onClick={() => {nav("/profile")}}>My Profile</p>
                    <p onClick={() => {nav("/accountSettings")}}>Account Settings</p>
                    <p onClick={() => {nav("/changePassword")}}>Change Password</p>
                    <p>Notifications</p>
                    <p className="logout" onClick={() => {handleLogout()}}>Logout</p>
                </div>
            </div>
        </>)
}