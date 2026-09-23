import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./role.css"
import { API_URL } from "../../config/api"

export default function Role(){
    const [role, setRole] = useState<string>("")
    const [open, setOpen] = useState<boolean>(false)

    const nav = useNavigate()

    async function addRole() {
        const response = await fetch(`${API_URL}/users/addRole/${role}`, {
                method: "PATCH",
                credentials: "include",
              
            })

            const data = await response.json()
            console.log(data)
            if(data.success){
                nav(data.redirect)
            }
    }
    return(
    <>
    <h1 style={{textAlign: "center"}}>Chose Role</h1>
    <div className="chose-role">
        <button onClick = {() => {setRole("coach"), setOpen(true)}}>Coach</button>
        <button onClick = {() => {setRole("client"), setOpen(true)}}>Client</button>
    </div>

    {/* CONFIRM ROLE DROPDOWN */}
    {open ? 
    <>
    <div className={`role-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)}>
         <div className={`confirm-role ${open ? "open" : ""}`} onClick={(e) => e.stopPropagation()} >  
            {
            // e.stopPropagation() stops the click event from bubbling up to parent elements.
            // Normally, clicking this element would also trigger any onClick handlers on its
            // parent elements. This makes sure only this element's click action is executed.
            }
            <div className="role-handle"></div>

            <h2>Confirm Role</h2>
            <p>You will register as</p>

            <h3>{role}</h3>

            <button onClick={addRole}> Confirm </button>
            <button className="cancel-role-btn" onClick={() => setOpen(false)}> Cancel </button>
        </div>
    </div>
    </> : <></>}
    </>
    )
}