import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import ClientHome from "./clientHome.tsx"
import CoachHome from "./coachHome.tsx"
import "./home.css"
import { refreshToken } from "../../middleware/auth.ts"

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
                    return
                
                }
            
                const data = await response.json()
                console.log("reset try RES DATA:", data)
                
            
            } catch (err) {
                console.error("AUTH ERROR:", err)
            }
        }
        getMe()
        getRole()
    },[])


    async function getRole(){
        const response = await fetch("http://localhost:5000/auth/getRole", {
            credentials: "include",
        })

        const data = await response.json()
        setRole(data.role)
        console.log(data)
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
        </>
    )
}