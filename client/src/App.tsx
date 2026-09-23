import './App.css'
import { Route, Routes, Navigate} from 'react-router-dom'
import Register from './pages/auth/register'
import Login from './pages/auth/login'
import Home from './pages/home/home'
import MyProfile from './pages/account/profile'
import AccountSettings from './pages/account/accountSettings'
import ChangePassword from './pages/account/changePassword'
import CreateExercise from './pages/exercises/createExercise'
import AddClient from './pages/clients/addClient'
import AddProgram from './pages/programs/addProgram'
import Programs from './pages/programs/programs'
import Client from './pages/chat/messageRoom'
import ProgramWeek from './pages/programs/programWeek'
import IndivDayExercises from './pages/programs/indivDayExercises'
import ClientWorkouts from './pages/clients/clientWorkouts'
import Progress from './pages/clients/progress'
import Role from './pages/role/role'


function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path = "/profile" element = {<MyProfile />} />
      <Route path = "/accountSettings" element = {<AccountSettings />} />
      <Route path = "/home" element = {<Home />} />
      <Route path = "/login" element = {<Login />} />
      <Route path = "/register" element = {<Register />} />
      <Route path = "/changePassword" element = {<ChangePassword />} />
      <Route path = "/addClient" element = {<AddClient />} />
      <Route path = "/createExercise" element = {<CreateExercise />} />
      <Route path = "/addProgram" element = {<AddProgram />} />
      <Route path = "/programs" element = {<Programs />} />
      <Route path = "/programs/workouts/:weekid" element = {<ProgramWeek />} />
      <Route path = "/chatroom/:roomid" element = {<Client />} />
      <Route path = "/programs/workouts/:weekid/exercises/:dayid" element = {<IndivDayExercises />} />
      <Route path = "/home/workouts/:weeknumber/:programid" element = {<ClientWorkouts />} />
      <Route path = "/home/:clientid/progress" element = {<Progress />} />
      <Route path = "/choseRole" element = {<Role />} />
    </Routes>
    </>
  )
}

export default App
