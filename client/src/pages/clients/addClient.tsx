import { useNavigate } from "react-router-dom"
import { refreshToken } from "../../middleware/auth"
import { useEffect, useState } from "react"
import "./addClient.css"

export default function AddClient(){
    const [clients, setClients] = useState<any[]>([])

    const nav = useNavigate()

    useEffect(() => {
        handleAuth()
        getClients()
    },[])

    async function handleAuth(){
        const resposne = await fetch("http://localhost:5000/utils/me", {
            credentials: "include"
        })

        if(resposne.status === 401){
            const refresh = await refreshToken()

            if(!refresh.ok){
                return nav("/login")
            }
            

            const retryResponse = await fetch("http://localhost:5000/utils/me", {
                credentials: "include"
            })

            if(!retryResponse.ok){
                return nav("/login")
            }

            return console.log("refresh ran new accestoken issued")
        }

        console.log("no refresh ran at all token works")
    }

    async function getClients() {
        const response = await fetch("http://localhost:5000/users/getClients", {
            credentials: "include"
        })

        const data = await response.json()
        console.log(data)
        setClients(data.clients)
    }

    async function addClient(id: number) {
        console.log(clients[id])
        const response = await fetch("http://localhost:5000/users/addClient", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-type" : "application/json"
            },
            body: JSON.stringify({
                client: clients[id]
            })
        })

        const data = await response.json()
        console.log(data)
    }

    return(<>
    <h1 className="x-button" onClick={() => {nav("/home")}}>✕</h1>
    <h1 style={{marginTop: "60px", textAlign: "center"}}>Add Client</h1>
        <div className="add-client">
            {clients?.map((client, i) => (
                <div className="add-client-card">
                    <p>{client?.email}</p>
                    <button onClick={() => {addClient(i)}}>Add Client</button>
                </div>
            ))}
        </div>
    </>)
}