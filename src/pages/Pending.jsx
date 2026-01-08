import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut as LogOutIcon } from "lucide-react";

export default function Pending() {
    const { logOut } = useAuth(); // function to log out
    const navigate = useNavigate();

    const handleLogout = async () => {
        // setOpen(false); // remove if not needed
        await logOut();
        navigate("/login"); // redirect to login page
    };

    return (
        <div className='min-h-screen flex items-center justify-center'>
            <div className='bg-[#EDECEC] rounded-sm shadow-sm p-12 w-full max-w-lg flex items-center justify-center'>

                <div className='flex flex-col justify-center items-center px-10'>
                    <div>
                        <h1 className="text-2xl text-center font-bold mb-4">You need to be assigned by an admin to access the dashboard</h1>
                    </div>
                    <div>
                        <button
                            onClick={handleLogout}

                            className='flex items-center border gap-2 rounded-lg p-2 px-4 cursor-pointer text-white bg-red-500 hover:bg-red-600 hover:border-none hover:outline-none'
                        >
                            <LogOutIcon className="h-5 w-5 text-white" />
                            <span className="text-[20px]">Logout</span>
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}
