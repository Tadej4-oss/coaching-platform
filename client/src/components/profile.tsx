import { useEffect, useState } from "react"
import type { Coach } from "../types/client"
import { useNavigate } from "react-router-dom"
import "./styles/profle.css"


export default function MyProfile(){
    const [coach, setCoach] = useState<Coach | null>(null)
    const [bio, setBio] = useState<string>("")

    const nav = useNavigate()

    useEffect(() => {
        async function getMe() {
            try {
                const response = await fetch("http://localhost:5000/utils/me", {
                    credentials: "include"
                })

                if(response.status === 401){
                    const refresh = await fetch("http://localhost:5000/utils/refresh", {
                        credentials: "include"
                    })

                    if(!refresh.ok){
                        console.log("profile /refresh faild", refresh.status)
                        return nav("/login")
                    }

                    const retryResponse = await fetch("http://localhost:5000/utils/me", {
                        credentials: "include"
                    })

                    if(!retryResponse.ok){
                        console.log("profile /me faild after /refresh", refresh.status)
                        return nav("/login")
                    }

                    const data = await retryResponse.json()
                    console.log(data)
                    setCoach({
                        id: data.user.id,
                        email: data.user.email,
                        role: data.user.role,
                        photo_url: data.user.photo_url,
                        username: ""
                    })
                    setBio(data.bio)
                    return
                }

                const data = await response.json()
                console.log(data)
                setCoach({
                    id: data.user.id,
                    email: data.user.email,
                    role: data.user.role,
                    photo_url: data.user.photo_url,
                    username: ""
                })
                setBio(data.bio)

            } catch (err) {
                console.error("AUTH ERROR:", err)
            }
        }

        getMe()
    },[])

    async function addBio() {
        try {
            const resposne = await fetch("http://localhost:5000/users/addBio", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-type" : "application/json"
                },
                body: JSON.stringify({
                    bio
                })
            })

            const data = await resposne.json()
            setBio(data.bio)
            console.log(data)

        } catch (err) {
            
        }
    }
    return(
    <>
    <div className="profile-page">
        <div className="profile-card">
            <h1 className="x-button" onClick={() => {nav("/home")}}>✕</h1>
            <div className="profile-header">
                <img
                    className="profile-photo"
                    src={coach?.photo_url}
                    alt="Profile"
                />

                <div>
                    <h1>{coach?.email}</h1>
                    <span className="profile-role">{coach?.role}</span>
                </div>
            </div>

            <div className="profile-info">

                <div className="info-row">
                    <span>Email</span>
                    <p>{coach?.email}</p>
                </div>

                <div className="info-row bio-row">
                    <span>Bio</span>

                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell your clients a little about yourself..."
                    />

                    <button onClick={addBio}>
                        Save Bio
                    </button>
                </div>

                <span style = {{color: "#9ca3af"}}>Specialization</span>
                <div className="spec-row">
                    <p>Powerlifting</p>
                    <button>Change</button>
                </div>

                <div className="info-row">
                    <span>Clients</span>
                    <p>14</p>
                </div>

                <div className="info-row">
                    <span>Member Since</span>
                    <p>xx</p>
                </div>

            </div>

        </div>
    </div>
    </>)
}