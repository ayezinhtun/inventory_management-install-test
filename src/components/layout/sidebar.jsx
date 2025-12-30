import { Archive, Box, Clock, Home, Layers, LayoutDashboard, MapPin, Package, User, UserRound, UsersRound } from 'lucide-react';
import logo from '../../assets/logo.png';
import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from "flowbite-react";

import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'flowbite-react';

export default function SidebarComponent() {
    const location = useLocation();


    // define sidebar links
    const links = [
        { id: 1, name: 'Dashboard', path: '/', icon: <LayoutDashboard className='h-5 w-5 mr-2' /> },
        { id: 2, name: 'Inventory', path: '/inventory', icon: <Package className='h-5 w-5 mr-2' /> },
        { id: 3, name: 'Region', path: '/region', icon: <MapPin className='h-5 w-5 mr-2' /> },
        { id: 4, name: 'Warehouse', path: '/warehouse', icon: <Home className='h-5 w-5 mr-2' /> },
        { id: 5, name: 'Rack', path: '/rack', icon: <Layers className='h-5 w-5 mr-2' /> },
        { id: 6, name: 'Customers', path: '/customer', icon: <UsersRound className='h-5 w-5 mr-2' /> },
        { id: 7, name: 'Users', path: '/user', icon: <User className='h-5 w-5 mr-2' /> },
        { id: 8, name: 'Audit Log', path: '/audit', icon: <Clock className='h-5 w-5 mr-2' /> },
    ]

    return (
        <div className='w-64  bg-white shadow-xl h-full fixed left-0 top-0 z-40 flex flex-col'>
            <Link to='/' className='p-4 flex-col items-center space-x-3'>
                <img src={logo} alt="logo" className='h-15 mb-1' />
                <div>
                    <h1 className='font-bold text-gray-900 text-[20px]'>Inventory Management</h1>
                </div>
            </Link>

            <nav className='flex-1 p-4 space-y-2 overflow-y-auto'>
                {links.map((link) => {
                    const isActive = location.pathname === link.path;

                    return (
                        <Link
                            key={link.id}
                            to={link.path}
                            className={`flex items-center px-3 py-3 rounded-xl border border-none font-bold hover:bg-[#F9F5FF] hover:border-[#F9F5FF] transition hover:text-[#26599F] ${isActive ? "bg-[#F9F5FF] border-none text-[#26599F] " : ""}`}
                        >
                            {link.icon}
                            <span>{link.name}</span>
                        </Link>
                    )
                })}

            </nav>

        </div>

    )
}