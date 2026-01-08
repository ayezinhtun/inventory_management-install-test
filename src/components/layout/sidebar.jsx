import { Archive, Box, ChevronDown, ChevronUp, Clock, Home, Layers, LayoutDashboard, MapPin, Package, User, UsersRound } from 'lucide-react';
import logo from '../../assets/logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function SidebarComponent() {
    const location = useLocation();
    const navigate = useNavigate();
    const [inventoryOpen, setInventoryOpen] = useState(false);

    const links = [
        { id: 1, name: 'Dashboard', path: '/', icon: <LayoutDashboard className='h-5 w-5 mr-2' /> },
        {
            id: 2, name: 'Inventory', path: '/inventory', icon: <Package className='h-5 w-5 mr-2' />,
            subLinks: [
                { id: '2-1', name: 'Add Inventory', path: '/inventory/create-inventory' },
                { id: '2-2', name: 'Add Component', path: '/inventory/add-part' },
            ]
        },
        { id: 3, name: 'Region', path: '/region', icon: <MapPin className='h-5 w-5 mr-2' /> },
        { id: 4, name: 'Warehouse', path: '/warehouse', icon: <Home className='h-5 w-5 mr-2' /> },
        { id: 5, name: 'Rack', path: '/rack', icon: <Layers className='h-5 w-5 mr-2' /> },
        { id: 6, name: 'Customers', path: '/customer', icon: <UsersRound className='h-5 w-5 mr-2' /> },
        { id: 7, name: 'Users', path: '/user', icon: <User className='h-5 w-5 mr-2' /> },
        { id: 8, name: 'Audit Log', path: '/audit', icon: <Clock className='h-5 w-5 mr-2' /> },
    ];

    // Open Inventory if current path is under /inventory
    useEffect(() => {
        if (location.pathname.startsWith('/inventory')) {
            setInventoryOpen(true);
        }
    }, [location.pathname]);

    return (
        <div className='w-64 bg-white shadow-xl h-full fixed left-0 top-0 z-40 flex flex-col'>
            <Link to='/' className='p-4 flex-col items-center space-x-3'>
                <img src={logo} alt="logo" className='h-15 mb-1' />
                <div>
                    <h1 className='font-bold text-gray-900 text-[20px]'>Inventory Management</h1>
                </div>
            </Link>

            <nav className='flex-1 p-4 space-y-2 overflow-y-auto'>
                {links.map((link) => {
                    const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');

                    if (link.subLinks) {
                        return (
                            <div key={link.id}>
                                {/* Inventory main link */}
                                <div
                                    onClick={() => navigate(link.path)}
                                    className={`cursor-pointer flex items-center justify-between px-3 py-3 rounded-xl border border-none font-bold hover:bg-[#F9F5FF] hover:border-[#F9F5FF] transition hover:text-[#26599F] ${isActive ? "bg-[#F9F5FF] text-[#26599F]" : ""}`}
                                >
                                    <div className='flex items-center'>
                                        {link.icon}
                                        <span>{link.name}</span>
                                    </div>
                                    <span
                                        className='cursor-pointer'
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setInventoryOpen(!inventoryOpen); 
                                        }}
                                    >
                                        {inventoryOpen ? <ChevronDown/> : <ChevronUp/>}
                                    </span>
                                </div>

                                {/* Sub-links */}
                                {inventoryOpen && (
                                    <div className='ml-6 mt-1 flex flex-col space-y-1'>
                                        {link.subLinks.map((sub) => (
                                            <Link
                                                key={sub.id}
                                                to={sub.path}
                                                className={`px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-[#F0EBFF] hover:text-[#26599F] ${location.pathname === sub.path ? 'bg-[#F0EBFF] text-[#26599F]' : ''}`}
                                            >
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    }

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
    );
}
