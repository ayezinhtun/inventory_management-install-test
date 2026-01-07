import { useEffect, useState } from "react";
import CardComponent from "../components/card/crad";
import { CirclePlus, Delete, Download, Edit, Eye, ListFilter, MapPin, Package, Pen, Search, Trash2 } from "lucide-react"
import Pagination from "../components/pagination/pagination";
import { Checkbox, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { Dropdown, DropdownItem } from "flowbite-react";
import EditRegionModal from "../components/region/editregion";
import { Link } from 'react-router-dom'
import { fetchInventory, deleteInventory } from "../context/InventoryContext";
import { getWarehouse } from "../context/WarehouseContext";
import { fetchRack } from "../context/RackContext";
import { exportToCSV } from "../utils/exportUtils";
import AddCustomer from "../components/Inventory/addCustomer";

export default function Inventory() {

    const [inventorys, setInventorys] = useState([]);

    // for search in the input search
    const [searchItem, setSearchItem] = useState("");

    //for fetch warehouse
    const [warehouses, setWarehouses] = useState([]);

    //for fetch rack
    const [racks, setRacks] = useState([])

    // for filter
    const [showFilter, setShowFilter] = useState(false);
    const [nameFilter, setNameFilter] = useState("");
    const [statusFilter, setstatusFilter] = useState("");
    const [warehouseFilter, setWarehouseFilter] = useState("");
    const [rackFilter, setRackFilter] = useState("");


    //for show edit form modal
    const [showEditModal, setShowEditModal] = useState(false);

    const [loading, setLoading] = useState(false);

    // for show add customer form modal
    const [showModal, setShowModal] = useState(false);

    const [selectedInventoryId, setSelectedInventoryId] = useState(null);

    //for fetch warehouses
    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const data = await getWarehouse();
            setWarehouses(data);
        } catch (error) {
            console.log('Errror fetching Warehouses:', error);
        } finally {
            setLoading(false);
        }
    }

    //for fetch racks
    const RackData = async () => {
        setLoading(true);
        try {
            const data = await fetchRack();
            setRacks(data);
        } catch (error) {
            console.log('Errror fetching racks:', error);
        } finally {
            setLoading(false);
        }
    }

    const InventoryData = async () => {
        setLoading(true);
        try {
            const data = await fetchInventory();
            setInventorys(data);
        } catch (error) {
            console.log('Error in fetch Inventory', error);
        } finally {
            setLoading(false);
        }
    }

    // for delete inventory
    const handleDelete = async (id) => {
        const isConfirmed = window.confirm("Are you sure to delete this Inventory?");

        if (!isConfirmed) return;

        try {
            await deleteInventory(id);
            InventoryData();
        } catch (error) {
            alert('Failed to delete Inventory');
        }
    }

    // this is for search and filter
    const filteredInventorys = inventorys.filter(inventory =>
        
        inventory.name.toLowerCase().includes(searchItem.toLowerCase()) &&

        (nameFilter === "" || inventory.name === nameFilter) &&

        (statusFilter === "" || inventory.status === statusFilter) &&

        (warehouseFilter === "" || inventory.warehouses?.name === warehouseFilter) &&

        (rackFilter === "" || inventory.racks?.name === rackFilter)

    )

    // this is for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentInventorys = filteredInventorys.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(filteredInventorys.length / itemsPerPage);


    const handleExportCSV = () => {
        const data = inventorys.map(i => ({
            Name: i.name,
            Warehouse: i.warehouses?.name || '',
            Rack: i.racks?.name || '',
            Status: i.status,
            "Serial No": i.serial_no,
            Type: i.type,
            Model: i.model,
            Vendor: i.vendor,
            "Start Unit": i.start_unit,
            Height: i.height,
            Color: i.color,
            Notes: i.notes,
            Attributes: Object.entries(i.attributes || {})
                .map(([key, val]) => `${key}: ${val}`)
                .join(",")
        }));

        const headers = ['Name', 'Warehouse', 'Rack', 'Status', 'Serial No', 'Type', 'Model', 'Vendor', 'Start Unit', 'Height', 'Color', 'Notes', 'Attributes'];
        exportToCSV(data, `inventorys-${new Date().toISOString().slice(0, 10)}.csv`, headers);
    }
    useEffect(() => {
        InventoryData();
        fetchWarehouses();
        RackData();

    }, [])

    return (
        <div>
            <h1 className="font-bold mb-5 text-[24px]">Inventory</h1>

            <div className="grid grid-cols-3 gap-10 mb-5">
                <CardComponent title="Total Inventory" count={inventorys.length} icon={Package} />
            </div>

            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-auto">
                <div className="flex items-center justify-between py-3 border-b border-[#EAECF0] px-5 space-x-4">
                    <div className="flex space-x-3">
                        <div className="flex items-center border border-gray-300 rounded-lg p-2 px-4 w-[300px] focus-within:ring-4 focus-within:ring-primary-300">
                            <Search className="w-5 h-5 text-gray-500 mr-2" />

                            <input type="text" placeholder="Search by name" value={searchItem} onChange={(e) => { setSearchItem(e.target.value); setCurrentPage(1) }} className="flex-1 outline-none border-none focus:border-none focus:ring-0" />
                        </div>

                        <div
                            className={`flex items-center border rounded-lg p-2 px-4  cursor-pointer ${showFilter ? "ring-4 ring-primary-300 outline-none border-none" : "border-gray-300"}
                         text-gray-500`}
                            onClick={() => setShowFilter(prev => !prev)}
                        >
                            <ListFilter className="w-5 h-5 mr-2" />
                            <span>Filter</span>
                        </div>
                    </div>

                    <div className="flex space-x-5">
                        <Link to='/create-inventory'
                            className='flex items-center border rounded-lg p-2 px-4  cursor-pointer text-gray-500 hover:ring-4 hover:ring-primary-300 hover:border-none'
                        >
                            <CirclePlus className="w-5 h-5 mr-2" />
                            <span>Add New Inventory</span>
                        </Link>

                        <button
                            onClick={handleExportCSV}
                            className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 hover:border-none hover:outline-none'
                        >
                            <Download className="w-5 h-5 mr-2" />
                            <span>Export</span>
                        </button>
                    </div>


                </div>

                {showFilter && (
                    <div className="flex items-center justify-between py-3 px-5 border-b border-gray-200">
                        <div className="grid grid-cols-5 gap-2">
                            <div className="flex flex-col space-y-2">
                                <Dropdown label="Filter by Name" className="border border-gray-300 bg-white text-gray700 hover:bg-white" dismissOnClick={true}>
                                    <DropdownItem
                                        onClick={() => {
                                            setNameFilter("");
                                            setCurrentPage(1);
                                        }}
                                    >
                                        All
                                    </DropdownItem>
                                    {Array.from(new Set(inventorys.map(inventory => inventory.name))).map((name, idx) => (
                                        <DropdownItem
                                            key={idx}
                                            onClick={() => {
                                                setNameFilter(name);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            {name}
                                        </DropdownItem>
                                    ))}

                                </Dropdown>


                            </div>

                            <div className="flex flex-col space-y-2">
                                <Dropdown label="Filter by Status" className="border border-gray-300 bg-white text-gray700 hover:bg-white" dismissOnClick={true}>
                                    <DropdownItem
                                        onClick={() => {
                                            setstatusFilter("");
                                            setCurrentPage(1);
                                        }}
                                    >
                                        All
                                    </DropdownItem>
                                    {Array.from(new Set(inventorys.map(inventory => inventory.status))).map((status, idx) => (
                                        <DropdownItem
                                            key={idx}
                                            onClick={() => {
                                                setstatusFilter(status);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            {status}
                                        </DropdownItem>
                                    ))}

                                </Dropdown>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <Dropdown label="Filter by Warehouse" className="border border-gray-300 bg-white text-gray700 hover:bg-white" dismissOnClick={true}>
                                    <DropdownItem
                                        onClick={() => {
                                            setNameFilter("");
                                            setCurrentPage(1);
                                        }}
                                    >
                                        All
                                    </DropdownItem>
                                    {Array.from(new Set(warehouses.map(warehouse => warehouse.name))).map((name, idx) => (
                                        <DropdownItem
                                            key={idx}
                                            onClick={() => {
                                                setWarehouseFilter(name);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            {name}
                                        </DropdownItem>
                                    ))}

                                </Dropdown>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <Dropdown label="Filter by Rack" className="border border-gray-300 bg-white text-gray700 hover:bg-white" dismissOnClick={true}>
                                    <DropdownItem
                                        onClick={() => {
                                            setNameFilter("");
                                            setCurrentPage(1);
                                        }}
                                    >
                                        All
                                    </DropdownItem>
                                    {Array.from(new Set(racks.map(r => r.name))).map((name, idx) => (
                                        <DropdownItem
                                            key={idx}
                                            onClick={() => {
                                                setRackFilter(name);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            {name}
                                        </DropdownItem>
                                    ))}

                                </Dropdown>
                            </div>


                        </div>


                        <button
                            onClick={() => { setNameFilter(""); setstatusFilter(""); setWarehouseFilter(""); setRackFilter(""); setCurrentPage(1); }}
                            className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 hover:border-none hover:outline-none'
                        >
                            <span>Reset Filters</span>
                        </button>

                    </div>

                )}

                <div className="overflow-x-auto rounded-lg">
                    <Table hoverable>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell className="p-4">
                                    <Checkbox />
                                </TableHeadCell>
                                <TableHeadCell>Name</TableHeadCell>
                                <TableHeadCell>Serial Number</TableHeadCell>
                                <TableHeadCell>Warehouse</TableHeadCell>
                                <TableHeadCell>Rack</TableHeadCell>
                                <TableHeadCell>Status</TableHeadCell>

                                <TableHeadCell colSpan={3}>
                                    <span>Action</span>
                                </TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody className="divide-y divide-gray-200">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-5">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentInventorys.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center"
                                        >
                                            No Inventory found
                                        </TableCell>
                                    </TableRow>
                                ) : (

                                    currentInventorys.map((inventory, id) => {
                                        return (
                                            <TableRow key={inventory.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                                <TableCell className="p-4">
                                                    <Checkbox />
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                    {inventory.name}
                                                </TableCell>
                                                <TableCell>{inventory.serial_no}</TableCell>
                                                <TableCell>{inventory.warehouses?.name}</TableCell>
                                                <TableCell>{inventory.racks?.name}</TableCell>
                                                <TableCell>{inventory.status}</TableCell>
                                                <TableCell className="flex items-center space-x-3">
                                                    <Link to={`/edit-inventory/${inventory.id}`}><Pen className="text-[#26599F]" /></Link>
                                                    <Link to={`/inventory-detail/${inventory.id}`}><Eye className="text-[#8B5CF6]" /></Link>
                                                    <Trash2 className="text-red-500" onClick={() => handleDelete(inventory.id)} />
                                                    <button
                                                        onClick={() => {
                                                            setSelectedInventoryId(inventory.id)
                                                            setShowModal(true)
                                                        }}
                                                        className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 hover:border-none hover:outline-none'
                                                    >
                                                        <span>Sell To Customer</span>
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })

                                )
                            )}

                        </TableBody>
                    </Table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>



            {showModal &&
                <AddCustomer onClose={() => setShowModal(false)} inventoryId={selectedInventoryId} onAdd={InventoryData}/>
            }

            {showEditModal &&
                <EditRegionModal onClose={() => setShowEditModal(false)} />
            }
        </div>
    )
}