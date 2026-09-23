import { useState, useEffect } from "react"
import "./accountSettings.css"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../../config/api"

export default function AccountSettings(){
    const [username, setUsername] = useState<string>("")
    const [bio, setBio] = useState<string>("")
    const [displayName, setDisplayName] = useState<string>("")

    const nav = useNavigate()

    useEffect(() => {
            async function getMe() {
                try {
                    const response = await fetch(`${API_URL}/utils/me`, {
                        credentials: "include"
                    })
    
                    if(response.status === 401){
                        const refresh = await fetch(`${API_URL}/utils/refresh`, {
                            credentials: "include"
                        })
    
                        if(!refresh.ok){
                            console.log("profile /refresh faild", refresh.status)
                            return nav("/login")
                        }
    
                        const retryResponse = await fetch(`${API_URL}/utils/me`, {
                            credentials: "include"
                        })
    
                        if(!retryResponse.ok){
                            console.log("profile /me faild after /refresh", refresh.status)
                            return nav("/login")
                        }
    
                        const data = await refresh.json()
                        console.log(data)
                        setUsername(data.username)
                        setBio(data.bio)
                        setDisplayName(data.display_name)
                        return
                    }
    
                    const data = await response.json()
                    console.log(data)
                    setUsername(data.username)
                    setBio(data.bio)
                    setDisplayName(data.display_name)
    
                } catch (err) {
                    console.error("AUTH ERROR:", err)
                }
            }
    
            getMe()
        },[])


    async function changeUsername() {
        try {
            const response = await fetch(`${API_URL}/users/changeUsername`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-type" : "application/json"
                },
                body: JSON.stringify({
                    username
                })
            })
            const data = await response.json()
            console.log(data)
            setUsername(data.username)

        } catch (err) {
            console.log(err)
        }
    }

    async function saveInfo() {
        try {
            const response = await fetch(`${API_URL}/users/saveAccountInfo`,{
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-type" : "application/json"
                },
                body: JSON.stringify({
                    bio,
                    displayName
                })
            })

            const data = await response.json()
            console.log(data)
            setDisplayName(data.displayName)
            setBio(data.bio)

        } catch (err) {
            console.error("AUTH ERROR:", err)
        }
    }

    
    return(<>
    <div className="settings-page">
        <h1 className="x-button" onClick={() => {nav("/home")}}>✕</h1>
        <div className="settings-card">

        <h1>Account Settings</h1>
        <p className="settings-subtitle">
            Manage your account information.
        </p>


        <section className="settings-section">

            <h2>Account Information</h2>

            <div className="input-group">
                <label>Username</label>
                <input type="text" value={username} onChange={(e) =>{setUsername(e.target.value)}}/>
                <button onClick={changeUsername}>Save</button>
            </div>

            <div className="input-group">
                <label>Email</label>
                <input type="text" disabled value={"test@gmail.com"}/>
            </div>

        </section>

        {/* PROFILE */}

        <section className="settings-section">

            <h2>Profile</h2>

            <div className="input-group">
                <label>Display Name</label>
                <input value={displayName} onChange={(e) => {setDisplayName(e.target.value)}}/>
            </div>

            <div className="input-group">
                <label>Bio</label>
                <textarea value={bio} onChange={(e) => {setBio(e.target.value)}} />
            </div>

            <div className="input-group">
                <label>Role</label>
                <input type="text" disabled value="Coach" />
            </div>

            <button onClick={saveInfo}>Save Profile</button>

        </section>

    </div>
</div>
    </>)
}