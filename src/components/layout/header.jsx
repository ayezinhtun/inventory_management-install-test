import { Bell, CircleUserRound, LogOut, Settings } from 'lucide-react';
import { useState, useRef, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUserProfiles } from '../../context/UserProfileContext';
import { Spinner } from 'flowbite-react';
import { supabase } from '../../../supabase/supabase-client';
import { getAuditRowsForUI } from '../../context/AuditContext';

export default function Header() {
    const { profile } = useUserProfiles();

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const { logOut } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);

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
        setLoggingOut(true);

        try {
            await logOut();
            navigate('./login');
        } catch (err) {
            console.error(err);
            setLoggingOut(false);
        }
    }


    const [unreadCount, setUnreadCount] = useState(0);

    const loadUnreadCount = async () => {
        try {
            // 1) Get recent audit events for install + relocation (IDs only)
            const [install, relocation] = await Promise.all([
                getAuditRowsForUI({ limit: 150, table: "installation_requests" }),
                getAuditRowsForUI({ limit: 150, table: "relocation_requests" }),
            ]);
            const all = [...(install || []), ...(relocation || [])];
            const allIds = all.map(r => r.id);
            if (!profile?.id) {
                setUnreadCount(allIds.length);
                return;
            }

            // 2) Reads by this user
            let readIds = new Set();
            if (allIds.length > 0) {
                const { data: reads, error } = await supabase
                    .from("notification_reads")
                    .select("audit_id")
                    .eq("user_id", profile.id)
                    .in("audit_id", allIds);
                if (!error && Array.isArray(reads)) {
                    readIds = new Set(reads.map(r => r.audit_id));
                }
            }

            // 3) Compute unread
            const unread = allIds.filter(id => !readIds.has(id)).length;
            setUnreadCount(unread);
        } catch (e) {
            console.error("Failed to load unread count", e);
        }
    };

    // Initial load + reload when profile resolves
    useEffect(() => {
        loadUnreadCount();
    }, [profile?.id]);

    

    // Realtime: update when a new audit row is inserted (new notification)
    useEffect(() => {
        const channel = supabase
            .channel("badge-audit-realtime")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "audit_logs" },
                (payload) => {
                    const t = (payload?.new?.table_name || "").toLowerCase();
                    if (t === "installation_requests" || t === "relocation_requests") {
                        loadUnreadCount();
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // Realtime: update when this user marks as read
    useEffect(() => {
        if (!profile?.id) return;
        const channel = supabase
            .channel("badge-reads-realtime")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "notification_reads" },
                (payload) => {
                    // only care about current user's reads
                    if (payload?.new?.user_id === profile.id) {
                        loadUnreadCount();
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [profile?.id]);

    return (
        <header className="bg-white shadow px-6 py-5 flex items-center justify-end sticky top-0 z-30">
            {loggingOut && (
                <div className="fixed inset-0 bg-white bg-opacity-70 flex justify-center items-center z-50">
                    <Spinner size="xl" color="info" aria-label="Logging out..." />
                </div>
            )}
            <div className="flex items-center gap-2">
                <Link to='/notification'>
                    <button type="button" className="relative flex">
                        <Bell
                            className={`me-3 font-bold ${location.pathname === '/notification' ? 'text-[#26599F]' : 'text-gray-600 hover:text-[#26599F]'}`}
                            size={28}
                        />
                        <span className="sr-only">Notifications</span>
                        {unreadCount > 0 && (
                            <span
                                className="absolute -top-3 -right-1 inline-flex items-center justify-center
                 rounded-full bg-red-600 text-white text-xs min-w-[18px] h-[18px] px-1"
                            >
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
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