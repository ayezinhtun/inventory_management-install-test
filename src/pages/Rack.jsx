import { CirclePlus, Download } from "lucide-react"
import RackComponent from "../components/rack/rack"
import { useEffect, useState } from "react"
import AddRack from "../components/rack/addrack";
import { deleteRack, fetchRack } from "../context/RackContext";
import EditRack from "../components/rack/editRack";
import { getWarehouse } from "../context/WarehouseContext";
import { exportToCSV } from "../utils/exportUtils";
import { fetchInventory } from '../context/InventoryContext';
import { Spinner } from "flowbite-react";

export default function Rack() {

    const [showAddModal, setShowAddModal] = useState(false);

    const [loading, setLoading] = useState(false);

    const [racks, setRacks] = useState([]);

    //for fetch warehouse
    const [warehouses, setWarehouses] = useState([]);

    //for edit
    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedRack, setSelectedRack] = useState(null);

    const [inventorys, setInventorys] = useState([]);


    //for fetch data from racks 
    const rackData = async () => {
        setLoading(true);
        try {
            const data = await fetchRack();
            setRacks(data);
        } catch (error) {
            console.log('Error in fetch rack', error);
        } finally {
            setLoading(false);
        }
    };

    // for fetch warehouse to show in the dropdown
    const fetchWarehouse = async () => {
        const data = await getWarehouse();

        setWarehouses(data);
    }

    //for fetch Inventory 
    const InventoryData = async () => {
        const data = await fetchInventory();
        setInventorys(data);
    }

    //for delete racks
    const handleDelete = async (id) => {
        const isConfirmed = window.confirm("Are you sure to delete this rack?");

        if (!isConfirmed) return;

        try {
            await deleteRack(id);
            rackData();
        } catch (error) {
            alert('Failed to delete rack');
        }
    }

    //for edit racks
    const handleEdit = (rack) => {
        setSelectedRack(rack);
        setShowEditModal(true);
    }

    //for export 
    const handleExportCSV = () => {
        const data = racks.map(r => ({
            Name: r.name,
            Size_U: r.size_u,
            Type: r.type,
            Status: r.status,
            Notes: r.notes,
            Warehouse: r.warehouses?.name || '',
            Region: r.warehouses?.regions?.name || ''
        }));

        const headers = ['Name', 'Size_U', 'Type', 'Status', 'Notes', 'Warehouse', 'Region'];
        exportToCSV(data, `racks-${new Date().toISOString().slice(0, 10)}.csv`, headers);
    }

    useEffect(() => {
        rackData();
        fetchWarehouse();
        InventoryData();
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

                    <button
                        onClick={handleExportCSV}
                        className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 hover:border-none hover:outline-none'
                    >
                        <Download className="w-5 h-5 mr-2" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-3 flex justify-center items-center">
                        <Spinner size="xl" color="info" aria-label="Loading..." />
                    </div>
                ) : (
                    racks.length === 0 ? (
                        <div className="col-span-3 text-center text-gray-500 py-10">
                            No racks found
                        </div>
                    ) : (

                        racks.map((rack) => (
                            <RackComponent key={rack.id} rack={rack} inventorys={inventorys} onDelete={handleDelete} onEdit={handleEdit} />
                        ))
                    )
                )}

            </div>

            {showAddModal &&
                <AddRack onClose={() => setShowAddModal(false)} warehouse={warehouses} onAdd={rackData} />
            }

            {showEditModal && selectedRack && (
                <EditRack rack={selectedRack} warehouse={warehouses} onClose={() => setShowEditModal(false)} onUpdate={rackData} />
            )
            }

        </div>
    )
}