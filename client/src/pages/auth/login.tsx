import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import "./login.css"
import { API_URL } from "../../config/api"

export default function Login() {
    const nav = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string>("")

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-type" : "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            })

            const data = await response.json()
            console.log(data)
            if(data.success){
                nav(data.redirect)
            }
            setError(data.error)
        } catch (err) {
            console.log(err)
        } finally {
            
        }
    }

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">

                <h1>Login</h1>

                <label>Email</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label>Password</label>
                <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button>Login</button>

                <button type="button" onClick={() => nav("/register")}>
                    Create an Account
                </button>
                <p>{error}</p>

            </form>
        </div>
    )
}