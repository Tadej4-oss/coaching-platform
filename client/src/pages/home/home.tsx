import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import ClientHome from "./clientHome.tsx"
import CoachHome from "./coachHome.tsx"
import "./home.css"
import { refreshToken } from "../../middleware/auth.ts"
import { API_URL } from "../../config/api"

export default function Home(){
    const [serverError, setServerError]  = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [role, setRole] = useState()
    const nav = useNavigate()

    useEffect(() => {
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
                        console.log("no token send to login")
                        return nav("/login")
                    }
                
                    const retryResponse = await fetch(`${API_URL}/utils/me`, {
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
                setServerError(true)
            }
            finally{
                setLoading(false)
            }
        }
        getMe()
        getRole()
    },[])


    async function getRole(){
        const response = await fetch(`${API_URL}/auth/getRole`, {
            credentials: "include",
        })

        const data = await response.json()
        setRole(data.role)
        console.log(data)
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