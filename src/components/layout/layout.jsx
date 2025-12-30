// import Sidebar from "./sidebar";
import Header from "./header";
import { Outlet } from "react-router-dom";
import SidebarComponent from "./sidebar";


export default function Layout() {
    return (
        <div className="flex h-screen bg-white">
            <SidebarComponent/>

            <div className="flex-1 ml-64 flex flex-col min-w-0">
                <Header/>

                <main className="p-6 flex-1 overflow-x-auto overflow-y-auto min-w-0">
                    <Outlet/>
                </main>

            </div>

        </div>
    )
}