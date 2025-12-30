import { useState } from "react"
import ProfileTab from "../components/accountsettings/ProfileTab";
import PasswordTab from "../components/accountsettings/PasswordTab";
import { User, Lock } from "lucide-react";

export default function AccountSetting() {
    const [tab, setTab] = useState("profile");

    return (
        <div>
            <h2 className="font-bold mb-5 text-[24px] ">Account Settings</h2>
            <div className="min-h-screen flex justify-center">
                <div className="w-full max-w-6xl flex gap-6 items-start">
                    <div className="w-64 bg-white border border-gray-200 rounded-sm shadow-lg py-5">
                        <button
                            onClick={() => setTab("profile")}
                            className={`w-full text-left flex items-center px-4 py-2 rounded mb-2 ${tab === "profile"
                                ? "text-[#26599F]"
                                : "hover:text-[#26599F]"
                                }`}
                        >
                            <User className="me-2"/>
                            Profile Settings
                        </button>

                        <button
                            onClick={() => setTab("password")}
                            className={`w-full text-left flex items-center px-4 py-2 rounded ${tab === "password"
                                ? "text-[#26599F]"
                                : "hover:text-[#26599F]"
                                }`}
                        >
                            <Lock className="me-2"/>
                            Change Password
                        </button>

                    </div>
                    <div className="flex-1 rounded-lg bg-white border border-gray-200 shadow-lg p-8">
                        {tab === "profile" ? <ProfileTab /> : <PasswordTab />}
                    </div>

                </div>

            </div>
        </div>

    )
}