import { useEffect, useState } from "react"
import {  useNavigate } from "react-router-dom"
import { refreshToken } from "../components/middleware/auth.ts"
import "./styles/clientHome.css"
import type { Client } from "../types/client.ts"

export default function ClientHome(){
    const [roomid, setRoomid] = useState<number>(0)
    const [programs, setPrograms] = useState<any[]>([])
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
        const response = await fetch("http://localhost:5000/client/pullData", {
            credentials: "include"
        })

        const data = await response.json()
        setCoach(data.coach)
        setRoomid(data.room.id)
        setPrograms(data.programs)

        console.log(data)
    }

    async function getMe() {
        const response = await fetch("http://localhost:5000/utils/me", {
            credentials: "include"
        })

        if(response.status === 401){
            const refresh = await refreshToken()

            if(!refresh.ok){
                return nav("/login")
            }

            const retryResponse = await fetch("http://localhost:5000/utils/me", {
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
    }




    return(<>
        <div className="coach-headers-div">
            <p>LOGO</p>
            <p>Notification</p>
            <p >Profile</p>
        </div>


        <div className="client-welcome-div">
            <p>Good Afternoon, {client?.username || "Client"}</p>
            <p>Current Program</p>
            <p>12 week strenght</p>
        </div>



        <div className="client-coach-div">
            <h3>YOUR COACH</h3>
            <p>{coach?.username}</p>
            <p>Specification</p>
            <button onClick={() => {nav(`/chatroom/${roomid}`)}}>Message</button>
        </div>
        

         <div>
            <button onClick={() => {console.log(client)}}>client</button>
            <button onClick={() => {console.log(coach)}}>coach</button>
            <button onClick={() => {console.log(programs)}}>programs</button>
        </div>
    </>)
}