import './App.css'
import { Route, Routes, Navigate} from 'react-router-dom'
import Register from './components/register'
import Login from './components/login'
import Home from './components/home'
import MyProfile from './components/profile'
import AccountSettings from './components/accountSettings'
import ChangePassword from './components/changePassword'
import CreateExercise from './components/createExercise'
import AddClient from './components/addClient'
import AddProgram from './components/addProgram'
import Programs from './components/programs'
import Client from './components/messageRoom'
import ProgramWeek from './components/programWeek'


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
    </Routes>
    </>
  )
}

export default App
