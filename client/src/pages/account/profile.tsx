import { useEffect, useState } from "react"
import type { Coach } from "../../types/client"
import { useNavigate } from "react-router-dom"
import "./profle.css"
import { API_URL } from "../../config/api"


export default function MyProfile(){
    const [coach, setCoach] = useState<Coach | null>(null)
    const [bio, setBio] = useState<string>("")

    const nav = useNavigate()

    useEffect(() => {
        //validate suer
        async function getMe() {
            try {
                //check accesstoken
                const response = await fetch(`${API_URL}/utils/me`, {
                    credentials: "include"
                })

                //if accestoken false send to refresh
                if(response.status === 401){
                    const refresh = await fetch(`${API_URL}/utils/refresh`, {
                        credentials: "include"
                    })

                    //ce je refresh false ni refresh tokena therefore user not validated send to login
                    if(!refresh.ok){
                        console.log("profile /refresh faild", refresh.status)
                        return nav("/login")
                    }

                    //ce je refreshtoken ti issua nou accestoken za revalidajata
                    const retryResponse = await fetch(`${API_URL}/utils/me`, {
                        credentials: "include"
                    })

                    //ce je error ni accestoken ni refreshtoken pol nazaj na login
                    if(!retryResponse.ok){
                        console.log("profile /me faild after /refresh", refresh.status)
                        return nav("/login")
                    }

                    //ce je accestoken in refresh now issuan pol set data
                    const data = await retryResponse.json()
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

                //ce je accesstoken insta set data
                const data = await response.json()
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

    //add bio
    async function addBio() {
        try {
            const resposne = await fetch(`${API_URL}/users/addBio`, {
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