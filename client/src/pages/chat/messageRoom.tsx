import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import type { Message, Client } from "../../types/client"
import { refreshToken } from "../../middleware/auth"
import "./messageRoom.css"
import { API_URL } from "../../config/api"

export default function Client(){
    const { roomid } = useParams()
    const nav = useNavigate()

    const [programs, setPrograms] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState<string>("")
    const [messages, setMessages] = useState<Message[]>([])
    const [user, setUser] = useState<Client>({
            email: "",
            username: "",
            id: 0,
            role: "",
            profile_image_url: "",
            bio: ""
    })
    const [client, setClient] = useState<Client>({
        email: "",
        username: "",
        id: 0,
        role: "",
        profile_image_url: "",
        bio: ""
    })

    useEffect(() => {
        getMe()
        pullConvo()
        pullClient()
        pullPrograms()
    }, [])

    async function getMe() {
            const response = await fetch(`${API_URL}/utils/me`, {
                credentials: "include"
            })
    
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
            setUser(data.user)
            return console.log("refreshed token")
            
    
            }
    
            const data = await response.json()
            setUser(data.user)
            console.log("accesstokentoken")
    }
    async function createNewMsg() {
        const response = await fetch(`${API_URL}/chatroom/createmessage`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-type" : "application/json"
            },
            body: JSON.stringify({
                newMessage,
                roomid
            })
        })

        const data = await response.json()
        setMessages([...messages, {
            content: newMessage,
            sender_id: user.id,
            username: user.username,
            email: user.email
        }])

        setNewMessage("")
        console.log(data)
    }
    async function pullConvo(){
        const response = await fetch(`${API_URL}/chatroom/getconvo/${roomid}`, {
            credentials: "include"
        })
        const data = await response.json()
        setMessages(data.chat)
        console.log(data)
    }
    async function pullClient() {
        const response = await fetch(`${API_URL}/chatroom/pullclient/${roomid}`, {
            credentials: "include"
        })

        const data = await response.json()
        setClient(data.client)
        console.log(data)
    }
    async function pullPrograms() {
        const response = await fetch(`${API_URL}/programs/getPrograms`, {
            credentials: "include"
        })

        const data = await response.json()
        setPrograms(data.programs)
        console.log(data)
    }
    async function addProgram(id: number) {
        const response = await fetch(`${API_URL}/programs/addClientProgram/${client.id}/${id}`, {
            method: "POST",
            credentials: "include"
        })

        const data = await response.json()
        console.log(data)
    }

    return(
        <>
        <h1 className="x-button" onClick={() => {nav("/home")}}>✕</h1>
        {user.role === "coach" && (
            <>
                <input style={{ display: "none" }} type="checkbox" id="chat-sidemenu"/>
                <input style={{ display: "none" }} type="checkbox" id="add-program-sidemenu"/>
                
                <div className="client-profile-card">
                
                    <img className="client-profile-img" src={`${API_URL}${client?.profile_image_url}`} alt="Client profile"/>
                
                    <div className="client-profile-info">
                        <h1 className="client-profile-name"> {client?.username || client?.email} </h1>
                        <p className="client-profile-email"> {client?.email} </p>
                        <p className="client-profile-bio"> {client?.bio || "No bio added yet."}</p>
                    </div>
                
                    <div className="client-profile-actions">
                        <label htmlFor="chat-sidemenu" className="message-client-btn">
                            Message Client
                        </label>
                        <label htmlFor="add-program-sidemenu" className="edit-programs-btn">
                            Edit Programs 
                        </label>
                    </div>
                
                </div>
    </>
)}



        {/* chatr room sidemenu */}
       <div className={user.role === "coach" ? "sidemenu-chat-div" : "chat-div"}>

            {user.role === "coach" && (
                <div className="chat-topbar">
        
                    <label htmlFor="chat-sidemenu" className="chat-back-btn" > ↩ </label>        
                    <h1 className="chat-title"> Chat Room </h1>
    
                </div>
            )}

        
            {user.role !== "coach" && (
                <h1 className="chat-title"> Chat Room </h1>
            )}

        
            <p className="chat-room-id"> Room ID: {roomid} </p>
        
        
            <div className="chat-messages">
        
                {messages?.map((message, i) => (
                    <div className={message.sender_id === user.id ? "sender" : "reciever"} key={i}>

                        <p className="chat-message-sender"> {message.email} </p>
                        <p className="chat-message-content"> {message.content} </p>
                        
                    </div>
                ))}

            </div>
            
            
            <div className="chat-input-area">
            
                <input className="chat-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Write a message..."
                />
                <button className="chat-send-btn" onClick={createNewMsg} > Send</button>
            
            </div>
            
        </div>

        {/* add programs sidemenu */}
        <div className="add-programs-div">
                <div className="add-programs-header">
                    <label htmlFor="add-program-sidemenu" className="chat-back-btn"> ↩ </label>
                    <h2>Add Program</h2>
                </div> 

                <div className="add-programs-list">
                    {programs?.map((prog) => (
                        
                        <div className="indiv-program-div" key = {prog.id}> 

                            <h3>{prog.description}</h3>
                            <button className="assign-program-btn" onClick={() => {addProgram(prog.id)}}> Add Program To Client</button>
                            <button className="edit-program-btn" onClick = {() => {nav("/programs")}}>Edit Programs</button>

                        </div>
                        
                    ))}
                </div>
        </div>
        </>
    )
}