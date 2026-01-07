import { Bell, CircleUserRound, LogOut, Settings } from 'lucide-react';
import { useState, useRef, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUserProfiles } from '../../context/UserProfileContext';

export default function Header() {
    const { profile } = useUserProfiles();

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const { logOut } = useAuth();

    const navigate = useNavigate();


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const closeAndNavigate = (path) => {
        setOpen(false);
        navigate(path);
    };

    const handleLogout = async () => {
        setOpen(false);
        await logOut();
        navigate('./login');
    }

    return (
        <header className="bg-white shadow px-6 py-5 flex items-center justify-end sticky top-0 z-30">
            <div className="flex items-center gap-2">
                <Link to='/notification'>
                    <button type="button" className="relative flex">
                        <Bell
                            className={`me-3 font-bold ${location.pathname === '/notification' ? 'text-[#26599F]' : 'text-gray-600 hover:text-[#26599F]'}`}
                            size={28}
                        />
                        <span className="sr-only">Notifications</span>
                        <div className="absolute inline-flex items-center justify-center w-6 h-6 text-sm font-black text-white bg-red-500 rounded-full rounded-full -top-4 -end-1">20</div>
                    </button>

                </Link>

                <div className='relative' ref={dropdownRef}>
                    <CircleUserRound
                        className={`font-bold ${location.pathname === '/setting' ? 'text-[#26599F]' : 'text-gray-600 hover:text-[#26599F]'}`}
                        size={28}
                        onClick={() => setOpen(!open)}
                    />

                    {open && (
                        <div className='absolute -right-5 mt-4 w-48 border border-gray-200 rounded-lg shadow-lg bg-white z-50'>

                            <div className='flex items-center gap-3 p-3 border-b border-gray-200'>
                                <div className='w-10 h-10 flex-shrink-0 rounded-full bg-[#26599F] flex items-center justify-center text-white font-bold'>
                                    {profile?.name?.charAt(0) || 'U'}
                                </div>
                                <div className='flex flex-col overflow-hidden'>
                                    <p className='font-bold text-gray-800 truncate'>{profile?.name || "Unknown"}</p>
                                    <p className='text-sm text-gray-500 truncate'>{profile?.role || "User"}</p>
                                </div>
                            </div>

                            <div className='flex flex-col py-1'>
                                <button
                                    onClick={() => closeAndNavigate('/setting')}
                                    className='flex items-center gap-2 px-4 py-2 hover:text-[#26599F] text-gray-700 text-left'
                                >
                                    <Settings className='h-4 w-4' /> Settings
                                </button>

                                <button onClick={handleLogout} className='flex items-center gap-2 px-4 py-2 hover:text-red-500 text-gray-700'>
                                    <LogOut className='h-4 w-4' /> Logout

                                </button>

                            </div>

                        </div>
                    )}

                </div>
            </div>
        </header>
    )
}