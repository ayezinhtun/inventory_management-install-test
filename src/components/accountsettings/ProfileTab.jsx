import { useEffect, useState } from "react";
import { useUserProfiles } from "../../context/UserProfileContext"
import { supabase } from "../../../supabase/supabase-client";

export default function ProfileTab() {
    const { profile, updateProfileName } = useUserProfiles();

    const [name, setName] = useState('');

    useEffect(() => {
        if (profile) setName(profile.name || '');
    }, [profile]);

    const handleSave = async () => {
        await updateProfileName(name);
    }
    return (
        <div>
            <h3 className="text-[20px] font-bold mb-6">Profile Settings</h3>

            <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                    <label htmlFor="" className="text-gray-700 font-bold" >Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-3 border-2 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                    />
                </div>

                <div className="flex flex-col space-y-2">
                    <label htmlFor="" className="text-gray-700 font-bold" >Email</label>
                    <input type="email" value={profile?.email || 'Email'} disabled className="w-full px-3 py-3 border-2 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500" />
                </div>


                <div className="col-span-2">
                    <button
                        onClick={handleSave}
                        className="bg-[#26599F] hover:bg-blue-900 font-bold text-white px-6 py-3 rounded mt-4"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}