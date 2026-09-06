
import { useNavigate } from "react-router-dom"
import { refreshToken } from "./middleware/auth"
import { useEffect, useState } from "react"
import type { programForm } from "../types/client"
import "./styles/addPrograms.css"


export default function AddProgram(){
    const [form, setForm] = useState<programForm>({
        name: "",
        description: "",
        goal: "",
        difficulty: "",
        duration: 0,
        daysPerWeek: 0
    })
    const nav = useNavigate()

    useEffect(() => {
        handleAuth()
    },[])

    function changeForm(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>){
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value,
        }));
    }

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

    async function submitNewProgram(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        try {
            const response = await fetch("http://localhost:5000/users/createProgram", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-type" : "application/json"
                },
                body: JSON.stringify({
                    program: form
                })
            })

            const data = await response.json()
            console.log(data)

        } catch (err) {
            console.error("AUTH ERROR:", err)
        }
    }

    return(<>
    <h1 className="x-button" onClick={() => {nav("/home")}}>✕</h1>
        <div className="create-program-div">
            <form onSubmit = {submitNewProgram}className="create-program-form">
                <h1>Create New Program</h1>
                <div className="new-program-inputs">
                    <h2>Program Name</h2>
                    <input 
                        name = "name"
                        value = {form?.name}
                        onChange={changeForm}
                        placeholder="12 Week Strength"
                        autoComplete="off"
                    />

                    <h2>Description</h2>
                    <input 
                        name = "description"
                        value = {form?.description}
                        onChange={changeForm}
                        placeholder="Strength-focused plan for intermediate lifters"
                        autoComplete="off"
                    />

                    <h2>Goal</h2>

                    <select
                        name="goal"
                        value={form?.goal}
                        onChange={changeForm}
                    >
                        <option value="">Select goal</option>
                        <option value="strength">Strength</option>
                        <option value="hypertrophy">Hypertrophy</option>
                        <option value="endurance">Endurance</option>
                    </select>

                    <h2>Difficulty</h2>
                    <select 
                        name = "difficulty"
                        value = {form?.difficulty}
                        onChange={changeForm}
                    >
                        <option value="">Select Difficulty</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advance">Advance</option>
                        <option value="Expert">Expert</option>

                    </select>

                    <h2>Duration</h2>
                    <input 
                        name = "duration"
                        value = {form?.duration}
                        onChange={changeForm}
                        placeholder="12 weeks"
                        type="number"
                    />

                    <h2>Days Per Week</h2>
                    <input 
                        name = "daysPerWeek"
                        value = {form?.daysPerWeek}
                        onChange={changeForm}
                        placeholder="4"
                        type="number"
                    />

                </div>
                <button type="submit">Create Program</button>
            </form>
        </div>

    </>)
}