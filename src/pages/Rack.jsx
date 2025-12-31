import { CirclePlus, Download } from "lucide-react"
import RackComponent from "../components/rack/rack"
import { useEffect, useState } from "react"
import AddRack from "../components/rack/addrack";
import { fetchRack } from "../context/RackContext";

export default function Rack() {

    const [showAddModal, setShowAddModal] = useState(false);


    const [racks, setRacks] = useState([]);

    const rackData = async () => {
        try {
            const data = await fetchRack();
            setRacks(data);
        } catch (error) {
            console.log('Error in fetch rack', error);
        }
    };


    useEffect(() => {
        rackData();
    }, [])

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
                {racks.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-500 py-10">
                        No racks found
                    </div>
                ) : (

                    racks.map((rack) => (
                        <RackComponent key={rack.id} rack={rack} />
                    ))

                )}
            </div>

            {showAddModal &&
                <AddRack onClose={() => setShowAddModal(false)} onAdd={rackData} />
            }

        </div>
    )
}