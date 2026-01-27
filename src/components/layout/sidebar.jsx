import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    MapPin,
    Home,
    Layers,
    UsersRound,
    User,
    Clock,
    ChevronDown,
    ChevronUp,
    ClipboardList,
    Send,
    ListChecks,
    Wrench,
    PackagePlus,
    ClipboardCheck,
    UserCheck,
    Truck,
    Repeat,
} from "lucide-react";
import logo from "../../assets/logo.png";
import { useUserProfiles } from "../../context/UserProfileContext";
import { Spinner } from "flowbite-react";

export default function SidebarComponent() {
    const location = useLocation();
    const navigate = useNavigate();
    const { profile, profileLoading } = useUserProfiles();
    // Dynamic state for all menus with subLinks
    const [openMenus, setOpenMenus] = useState({});

    const links = [
        { id: 1, name: "Dashboard", path: "/", icon: <LayoutDashboard className="h-5 w-5 mr-2" /> },
        {
            id: 2,
            name: "Inventory",
            path: "/inventory",
            icon: <Package className="h-5 w-5 mr-2" />,
            subLinks: [
                { id: "2-1", name: "Add Inventory", path: "/inventory/create-inventory" },
                { id: "2-2", name: "Add Component", path: "/inventory/add-part" },
            ],
        },
        { id: 3, name: "Region", path: "/region", icon: <MapPin className="h-5 w-5 mr-2" /> },
        { id: 4, name: "Warehouse", path: "/warehouse", icon: <Home className="h-5 w-5 mr-2" /> },
        { id: 5, name: "Rack", path: "/rack", icon: <Layers className="h-5 w-5 mr-2" /> },
        { id: 6, name: "Reserved Stock", path: "/reserved-stocks", icon: <Layers className="h-5 w-5 mr-2" />, roles: ["admin"] },

        {
            id: 7,
            name: "Customers",
            path: "/customer",
            icon: <UsersRound className="h-5 w-5 mr-2" />,
            roles: ["admin"],
            subLinks: [{ id: "6-1", name: "Inventory", path: "/customer/inventory" }],
        },
        { id: 8, name: "Inventory Requests", path: "/request/admin", icon: <Send className="h-5 w-5 mr-2" />, roles: ["admin", "PM"] },
        { id: 9, name: "Inventory Requests", path: "/request/engineer", icon: <ListChecks className="h-5 w-5 mr-2" />, roles: ["engineer"] },

        {
            id: 10,
            name: "Install Requests",
            path: "/install-requests",
            icon: <PackagePlus className="h-5 w-5 mr-2" />,
            roles: ["engineer"],
            subLinks: [
                { id: "9-1", name: "Inventory Install", path: "/install-requests/inventory" },
                { id: "9-2", name: "Component Install", path: "/install-requests/component" },
            ],
        },

        {
            id: 11,
            name: "Relocation Requests",
            path: "/relocation-requests/myrelocationrequest",
            icon: <Repeat className="h-5 w-5 mr-2" />,
            roles: ["engineer"],
            subLinks: [
                { id: "10-1", name: "Component Relocation", path: "/relocation-requests/component" },
            ],
        },

        { id: 12, name: "Install PM", path: "/install-request/pm", icon: <ClipboardCheck className="h-5 w-5 mr-2" />, roles: ["PM"] },
        { id: 13, name: "Install Admin", path: '/install-request/admin', icon: <ClipboardCheck className="h-5 w-5 mr-2" />, roles: ["admin"] },
        { id: 14, name: "Physical Install", path: '/install-request/physical', icon: <ClipboardCheck className="h-5 w-5 mr-2" />, roles: ["admin"] },

        { id: 15, name: "Relocation PM", path: '/relocation-requests/pmrelocationrequest', icon: <MapPin className="h-5 w-5 mr-2" />, roles: ["PM"] },
        { id: 16, name: "Relocation Admin", path: '/relocation-requests/adminrelocationrequest', icon: <MapPin className="h-5 w-5 mr-2" />, roles: ["admin"] },
        { id: 17, name: "Physical Relocation", path: '/relocation-requests/physicalrelocationrequest', icon: <MapPin className="h-5 w-5 mr-2" />, roles: ["admin"] },


        { id: 18, name: "Users", path: "/user", icon: <User className="h-5 w-5 mr-2" />, roles: ["admin"] },
        { id: 19, name: "Audit Log", path: "/audit", icon: <Clock className="h-5 w-5 mr-2" /> },
    ];

    // Open the menu if current path starts with its path
    useEffect(() => {
        const newOpenMenus = {};
        links.forEach((link) => {
            if (link.subLinks && location.pathname.startsWith(link.path)) {
                newOpenMenus[link.id] = true;
            }
        });
        setOpenMenus(newOpenMenus);
    }, [location.pathname]);

    const toggleMenu = (id) => {
        setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    if (profileLoading) {
        return <div>
            <Spinner size="xl" color="info" aria-label="Loading..." />
        </div>
    }

    const filteredLinks = links.filter((link) => {
        if (!link.roles) return true;


        if (!profile?.role) return false;

        return link.roles.includes(profile.role);
    })

    return (
        <div className="bg-white w-64 shadow-xl h-full fixed left-0 top-0 z-40 flex flex-col">
            {/* Logo */}
            <Link to="/" className="p-4 flex flex-col items-center space-x-3">
                <img src={logo} alt="logo" className="h-15 mb-1" />
                <h1 className="font-bold text-gray-900 text-[20px]">Inventory Management</h1>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {filteredLinks.map((link) => {
                    const isActive =
                        location.pathname === link.path || location.pathname.startsWith(link.path + "/");

                    if (link.subLinks) {
                        const isOpen = openMenus[link.id];

                        return (
                            <div key={link.id}>
                                <div
                                    onClick={() => navigate(link.path)}
                                    className={`cursor-pointer flex items-center justify-between px-3 py-3 rounded-xl border-none font-medium hover:bg-[#F9F5FF] hover:text-[#26599F] transition ${isActive ? "bg-[#F9F5FF] text-[#26599F]" : ""
                                        }`}
                                >
                                    <div className="flex items-center">
                                        {link.icon}
                                        <span>{link.name}</span>
                                    </div>
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleMenu(link.id);
                                        }}
                                    >
                                        {isOpen ? <ChevronDown /> : <ChevronUp />}
                                    </span>
                                </div>

                                {isOpen && (
                                    <div className="ml-6 flex flex-col">
                                        {link.subLinks.map((sub) => (
                                            <Link
                                                key={sub.id}
                                                to={sub.path}
                                                className={`px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-[#F0EBFF] hover:text-[#26599F] ${location.pathname === sub.path ? "bg-[#F0EBFF] text-[#26599F]" : ""
                                                    }`}
                                            >
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={link.id}
                            to={link.path}
                            className={`flex items-center px-3 py-3 rounded-xl border-none hover:bg-[#F9F5FF] hover:text-[#26599F] transition ${isActive ? "bg-[#F9F5FF] text-[#26599F]" : ""
                                }`}
                        >
                            {link.icon}
                            <span>{link.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
