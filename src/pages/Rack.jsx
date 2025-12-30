import { CirclePlus, Download } from "lucide-react"
import RackComponent from "../components/rack/rack"
import { useState } from "react"
import AddRack from "../components/rack/addrack";

export default function Rack() {

    const [showAddModal, setShowAddModal] = useState(false);

    return (

        <div>
            <div className="flex justify-end mb-5">
                <div className="flex space-x-5">
                    <div
                        className='flex items-center border rounded-lg p-2 px-4  cursor-pointer text-gray-500 hover:ring-4 hover:ring-primary-300 hover:border-none'
                        onClick={() => setShowAddModal(true)}
                    >
                        <CirclePlus className="w-5 h-5 mr-2" />
                        <span>Add New Rack</span>
                    </div>

                    <div
                        className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 hover:border-none hover:outline-none'
                    >
                        <Download className="w-5 h-5 mr-2" />
                        <span>Export</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <RackComponent backgroundColor="#51ae7a" title="Rack01" />
                <RackComponent backgroundColor="#329fcd" title="Rack02" />
                <RackComponent backgroundColor="#CD6032" title="Rack03" />

            </div>

            {showAddModal &&
                <AddRack onClose={() => setShowAddModal(false)}/>
            }
        </div>
    )
}