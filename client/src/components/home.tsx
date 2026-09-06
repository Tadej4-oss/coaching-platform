import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import ClientHome from "./clientHome"
import CoachHome from "./coachHome"
import "./styles/home.css"
import { refreshToken } from "../components/middleware/auth.ts"

export default function Home(){
    const [role, setRole] = useState("client")
    const nav = useNavigate()

    useEffect(() => {
        async function getMe() {
            try {
                const response = await fetch("http://localhost:5000/utils/me", {
                    credentials: "include"
                })
            
                if(response.status === 401){
                    const refresh = await refreshToken()
                
                
                    if(!refresh.ok){
                        console.log("no token send to login")
                        return nav("/login")
                    }
                
                    const retryResponse = await fetch("http://localhost:5000/utils/me", {
                    credentials: "include"
                    })
                
                    if(!retryResponse.ok){
                        console.log("Retry /me failed:", retryResponse.status)
                        return nav("/login")
                    }
                
                    const data = await retryResponse.json()
                    console.log("RETRY RES DATA:", data)
                    setRole(data.user.role)
                    return
                
                }
            
                const data = await response.json()
                console.log("reset try RES DATA:", data)
                setRole(data.user.role)
            
            } catch (err) {
                console.error("AUTH ERROR:", err)
            }
        }
        getMe()
    },[])


    async function handleLogout(){
        const response = await fetch("http://localhost:5000/auth/logout", {
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


    return(
        <>

        {role === "client" && 
        <>
            <ClientHome />
        </>}
        {role === "coach" && 
        <>
            <CoachHome />
        </>}

        <div className="dev-btn-div">
            <button onClick={() => {handleLogout()}}>Logout</button>
        </div>
        </>
    )
}