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
import Pending from "./pages/Pending"
import AdminRoute from "./routes/AdminRoute"
import CreatePart from "./components/Inventory/addPart"
import EditPart from "./components/Inventory/editPart"
import CustomerInventory from "./pages/CustomerInventory"
import RequestInventory from "./components/Inventory/requestInventory"
import EngineerRequests from "./pages/Engineer/EngineerRequest"
import AdminInventoryRequest from "./pages/Admin/InventoryReuest"
import editRequestInventory from "./components/Inventory/editrequestInventory"
import EditRequestInventory from "./components/Inventory/editrequestInventory"
import EngineerInstallRequests from "./pages/Engineer/InstallRequest"
import InventoryInstallRequest from "./pages/Engineer/InventoryInstall"
import ComponentInstallRequest from "./pages/Engineer/ComponentInstall"
import InstallRequestPM from "./pages/PM/InstallRequest"
import InstallRequestAdmin from "./pages/Admin/InstallRequestAdmin"
import PhysicalInstall from "./pages/Admin/PhysicallyRequest"
import ComponentRelocationRequest from "./pages/Engineer/relocation/relocationrequest"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/pending" element={<Pending />} />


      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/setting" element={<AccountSetting />} />
          <Route path="/region" element={<Region />} />
          <Route path="/warehouse" element={<Warehouse />} />
          <Route path="/rack" element={<Rack />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/add-part" element={<CreatePart />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/customer/inventory" element={<CustomerInventory />} />
          <Route element={<AdminRoute />}>
            <Route path="/user" element={<UserMangement />} />
          </Route>
          <Route path="/audit" element={<Audit />} />
          <Route path="/inventory-detail/:id" element={<InventoryDetail />} />
          <Route path="/inventory/create-inventory" element={<CreateInventory />} />
          <Route path="/request-inventory" element={<RequestInventory />} />
          <Route path="/edit-inventory/:id" element={<EditInventory />} />
          <Route path="/edit-part/:id" element={<EditPart />} />
          <Route path="/notification" element={<Notification />} />

          {/* for engineer*/}
          <Route path="/request/engineer" element={<EngineerRequests />} />
          <Route path="/request/edit/:id" element={<EditRequestInventory />} />
          <Route path="/install-requests" element={<EngineerInstallRequests />} />
          <Route path="/install-requests/inventory" element={<InventoryInstallRequest />} />
          <Route path="install-requests/component" element={<ComponentInstallRequest />}></Route>

          <Route path="/relocation-requests/component" element={<ComponentRelocationRequest />} />


          {/*for admin*/}
          <Route path="/request/admin" element={<AdminInventoryRequest />} />
          <Route path="/install-request/admin" element={<InstallRequestAdmin />} />
          <Route path="/install-request/physical" element={<PhysicalInstall />} />


          {/* for pm */}
          <Route path="/install-request/pm" element={<InstallRequestPM />} />

        </Route>
      </Route>
    </Routes>
  )

}

export default App
