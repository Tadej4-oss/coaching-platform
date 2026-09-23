import { useState} from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import "./register.css"

export default function Register() {
    const nav = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [error, setError] = useState("") 
    const [message, setMessage] = useState("")

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

    
        if (password !== confirmPassword) {
            return setError("Passwords Must Match")
        }

        try {
           const response = await fetch("http://localhost:5000/auth/register", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
           })


           const data = await response.json()
           if(data.success){
            setMessage(data.message)
            return
           }

           console.log(data)
           console.log(data.success)
           console.log(data.errors[0].message)
           setError(data.errors[0].message)


           
        } catch (err) {
            
        } finally {
            
        }
    }

    return (
        <>
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">

                <h1>Create Account</h1>

                <p>{error}</p>

                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <label>Confirm Password</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button>Create Account</button>

                <h3>{message}</h3>

                <button
                    type="button"
                    onClick={() => nav("/login")}
                >
                    Already have an account?
                </button>

            </form>
        </div>
        </>
    )
}