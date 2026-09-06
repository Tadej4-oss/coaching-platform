import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { passwordForm } from "../types/client"
import "./styles/changePassword.css"

export default function ChangePassword(){
    const [error, setError] = useState<string>("")
    const [form, setForm] = useState<passwordForm>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })


    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value,
        }));


    }
  
    const nav = useNavigate()

    useEffect(() => {
        getMe()
    })

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
                    return nav("/login")
                }

                const retryResponse = await fetch("http://localhost:5000/utils/me", {
                    credentials: "include"
                })

                if(!retryResponse.ok){
                    return nav("/login")
                }

                const data = await refresh.json()
                return console.log(data)
            }

            const data = await response.json()
            console.log(data)

        } catch (err) {
            console.error("AUTH ERROR:", err)
        }
    }

    async function submitForm(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if(form.newPassword !== form.confirmPassword){
            return setError("Password does not match")
        }

        try {
           const response = await fetch("http://localhost:5000/users/changePassword", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-type" : "application/json"
            },
            body: JSON.stringify({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword
            })
           }) 

           const data = await response.json()
           console.log(data.message)

        } catch (err) {
            console.error("AUTH ERROR:", err)
        }
        finally{
            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            })
        }
    }

    return(<>
    <div className="change-password-box">
        <h1 className="x-button" onClick={() => {nav("/home")}}>✕</h1>
        <form className = "change-password-form" onSubmit={submitForm}>
            <h1>Change Password</h1>

            <label>Enter Current Password:</label>
            <input type = "password" name = "currentPassword" value={form.currentPassword} onChange={handleChange}/>

            <label>Enter New Psw:</label>
            <input type = "password"name = "newPassword" value={form.newPassword} onChange={handleChange}/>
            <label>Confirm New Psw:</label>
            <input type = "password" name = "confirmPassword" value={form.confirmPassword} onChange={handleChange}/>

            <button>Change Password</button>
        </form>
        <p className="change-password-error">{error}</p>
    </div>

    </>)
}