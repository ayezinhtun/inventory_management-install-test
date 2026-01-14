import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useUserProfiles } from "../../context/UserProfileContext";

export default function PasswordTab() {
    const { updatePassword } = useUserProfiles();

    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleUpdatePassword = async () => {
        const result = await updatePassword(currentPassword, newPassword, confirmPassword);

        alert(result.message);

        if (result.success) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
    }
    return (
        <div>
            <h3 className="text-[20px] font-bold mb-6">Change Password</h3>

            <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                    <label htmlFor="" className="text-gray-700 font-bold" >Current Password</label>

                    <div className="relative flex items-center">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-3 border-1 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                </div>

                <div className="flex flex-col space-y-2">
                    <label htmlFor="" className="text-gray-700 font-bold" >New Password</label>
                    <div className="relative flex items-center">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-3 border-1 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col space-y-2">
                    <label htmlFor="" className="text-gray-700 font-bold" >Confirm New Password</label>
                    <div className="relative flex items-center">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-3 border-1 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>


                <div className="col-span-2">
                    <button
                        onClick={handleUpdatePassword}
                        className="bg-[#26599F] hover:bg-blue-900 font-bold text-white px-6 py-3 rounded mt-4"
                    >
                        Update Password
                    </button>
                </div>
            </div>
        </div>
    )
}