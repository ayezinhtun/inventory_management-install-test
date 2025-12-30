export default function ProfileTab() {
    return (
        <div>
            <h3 className="text-[20px] font-bold mb-6">Profile Settings</h3>

            <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                    <label htmlFor="" className="text-gray-700 font-bold" >Name</label>
                    <input type="text" value="Aye Aye" className="w-full px-3 py-3 border-2 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500" />
                </div>

                <div className="flex flex-col space-y-2">
                    <label htmlFor="" className="text-gray-700 font-bold" >Email</label>
                    <input type="email" value="aye@gmail.com" className="w-full px-3 py-3 border-2 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500" />
                </div>


                <div className="col-span-2">
                    <button className="bg-[#26599F] hover:bg-blue-900 font-bold text-white px-6 py-3 rounded mt-4">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}