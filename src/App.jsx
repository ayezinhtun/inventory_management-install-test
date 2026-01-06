import { Route, Routes } from "react-router-dom"
import Login from '../src/components/auth/Login'
import Signup from '../src/components/auth/Signup'
import Layout from "./components/layout/layout"
import Dashboard from "./pages/Dashboard"
import AccountSetting from "./pages/AccountSetting"
import Region from "./pages/Region"
import Warehouse from "./pages/Warehouse"
import Rack from "./pages/Rack"
import Inventory from "./pages/Inventory"
import Customer from "./pages/Customer"
import UserMangement from "./pages/UserManagement"
import Audit from "./pages/Audit"
import InventoryDetail from "./components/Inventory/inventoryDetial"
import CreateInventory from "./components/Inventory/createInventory"
import EditInventory from "./components/Inventory/editInventory"
import Notification from "./pages/Notification"
import ProtectedRoute from "./routes/ProtectedRoute"


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />


      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/setting" element={<AccountSetting />} />
          <Route path="/region" element={<Region />} />
          <Route path="/warehouse" element={<Warehouse />} />
          <Route path="/rack" element={<Rack />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/user" element={<UserMangement />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/inventory-detail/:id" element={<InventoryDetail />} />
          <Route path="/create-inventory" element={<CreateInventory />} />
          <Route path="/edit-inventory/:id" element={<EditInventory />} />
          <Route path="/notification" element={<Notification />} />
        </Route>
      </Route>
    </Routes>
  )

}

export default App
