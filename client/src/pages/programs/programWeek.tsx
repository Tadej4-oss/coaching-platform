import { useNavigate, useParams } from "react-router-dom"
import type { WorkoutDay, Exercises } from "../../types/client"
import { useEffect, useState } from "react"
import "./programWeek.css"

export default function ProgramWeek(){
    const [days, setDays] = useState<WorkoutDay[]>([])
    const [dayId, setDayId] = useState<number>(0)
    const [description, setDescription] = useState<string>("")
    const [searchExercise, setSearchExercise] = useState<string>("")
    const [exercises, setExercises] = useState<Exercises[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    const [popupOpen, setPopupOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<any>(null);

    const [sets, setSets] = useState("");
    const [reps, setReps] = useState("");

    const nav = useNavigate()
    const { weekid } = useParams()

    useEffect(() => {
        async function pullWeek() {
            const response = await fetch(`http://localhost:5000/workouts/getWeekDays/${weekid}`, {
                credentials: "include"
            })

            const data = await response.json()
            setDays(data.week_days)
            console.log(data)
        }
        pullWeek()
    },[])

    async function updateWorkoutDescription() {
        const response = await fetch(`http://localhost:5000/workouts/updateDayDescription/${dayId}/${description}`, {
            method: "PATCH",
            credentials: "include"
        })

        const data = await response.json()
        console.log(data)
        setDescription("")
    }

    async function searchForExercise() {
        try {
            setLoading(true)
            const response = await fetch(`http://localhost:5000/workouts/searchExercise/${searchExercise}}`, {
                method: "GET",
                credentials: "include"
            })

            const data = await response.json()
            setExercises(data.data.data)
             setSearchExercise("")
            console.log(data)

        } catch (error) {
            console.error(error);
            setLoading(false)
        }
        finally{
            setLoading(false)
            setSearchExercise("")
        }
       
    }

    async function confirmExercise() {
       const response = await fetch(`http://localhost:5000/workouts/addExercise`, {
           method: "POST",
           credentials: "include",
           headers: {
               "Content-type" : "application/json"
           },
           body: JSON.stringify({
                name: selectedExercise.name,
                description: selectedExercise.overview,
                muscle_group: selectedExercise.primaryMuscles[0],
                equipment: selectedExercise.equipment,
                video_url: selectedExercise.videos[0].url,
                sets,
                reps,
                dayId
           })
       })
    
       const data = await response.json()
       console.log(data)
       setPopupOpen(false);
    }

    function addExercise(ex: any) {
        setSelectedExercise(ex);
        setPopupOpen(true);
    }



    return(
        <>
        <input style = {{display: "none"}}type = "checkbox" id = "indiv-day-label" />
        <label className = "back-arrow"onClick={() => {nav("/programs")}}> 
            <h1>↩</h1>
        </label>

        <div className="workout-day-div">
            <h1>week: {weekid}</h1>
            {days?.map((day) => (
                <label htmlFor="indiv-day-label" onClick={() => {setDayId(day.id)}}>
                    <div className="workout-day-card"  key = {day.id}>
                        <p>{day.name}</p>
                        <p>{day.description}</p>
                    </div>
                </label>
            ))}
        </div>

        {/* sidemenu */}

        <div className="indiv-day-sidemenu">
            <label onClick={() => {setExercises([])}} className = "back-arrow" htmlFor="indiv-day-label"> 
                <h1>↩</h1>
            </label>

            <div className="change-description-div"> 
                <input placeholder = "e.g: Push, Pull" value={description} onChange={(e) => {setDescription(e.target.value)}}/>
                <button onClick={updateWorkoutDescription} >change description</button>
            </div>

            <div className="search-exercise-div">
                <h3>Search Ex:</h3>
                <input value = {searchExercise} onChange={(e) => {setSearchExercise(e.target.value)}}/>
                <button onClick={searchForExercise}>Search</button>
                <div className="enter-day-div">
                    <label>
                        <button onClick={() => {nav(`/programs/workouts/${weekid}/exercises/${dayId}`)}}>Show Day Exercises</button>
                    </label>
                </div>
            </div>

            <div className="resoult-div">
                <h3 style = {{textAlign: "center"}}>Resoults</h3>
                {loading ? (<div>Loading...</div>) : (
                    <div className="indiv-ex-div" >
                        {exercises?.map((ex) => (
                            <div className="indiv-ex-card" key={ex.name}>
                                <h2>{ex.name}</h2>
                                <p>{ex.overview}</p>
                                <h3>{ex.equipment}</h3>
                                <video className = "video" src={ex.videos[0].url} autoPlay loop muted playsInline/>
                                <button onClick={() => addExercise(ex)}> Add Exercise </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* sets reps sidemenu */}

        <div className={`bottom-menu-overlay ${popupOpen ? "open" : ""}`} onClick={() => setPopupOpen(false)}>

            <div className={`bottom-menu ${popupOpen ? "open" : ""}`} onClick={(e) => e.stopPropagation()}>
                <div className="bottom-menu-handle"></div>

                <h2>Add {selectedExercise?.name}</h2>

                <div className="bottom-menu-input">
                    <label>Sets</label>
                    <input
                        type="number"
                        min="1"
                        value={sets}
                        onChange={(e) => setSets(e.target.value)}
                        placeholder="3"
                    />
                </div>

                <div className="bottom-menu-input">
                    <label>Reps</label>

                    <input
                        type="number"
                        min="1"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        placeholder="10"
                    />
                </div>

                <button className="bottom-menu-confirm" onClick={() => {confirmExercise()}}> Add Exercise </button>
            </div>
        </div>
        
        </>
    )
}