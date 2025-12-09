import { Route, Routes } from "react-router-dom"
import Login from '../src/components/auth/Login'
import Signup from '../src/components/auth/Signup'


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  )

}

export default App
