import { useEffect, useState } from "react";
import CardComponent from "../components/card/crad";
import { CirclePlus, Delete, Download, Edit, Home, ListFilter, MapPin, Pen, Search, Trash2 } from "lucide-react"
import Pagination from "../components/pagination/pagination";
import { Checkbox, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { Dropdown, DropdownItem } from "flowbite-react";
import AddWarehouse from "../components/warehouse/addWarehouse";
import EditWarehouse from "../components/warehouse/editWarehouse";
import { deleteWarehouse, getWarehouse } from "../context/WarehouseContext";
import { getRegion } from "../context/RegionContext";
import { exportToCSV } from "../utils/exportUtils";

export default function Warehouse() {

    const [warehouses, setWarehouses] = useState([]);

    const [regions, setRegions] = useState([]);

    const [loading, setLoading] = useState(true);

    // for search in the input search
    const [searchItem, setSearchItem] = useState("");

    // for filter
    const [showFilter, setShowFilter] = useState(false);
    const [nameFilter, setNameFilter] = useState("");

    const [regionFilter, setRegionFilter] = useState("");

    // for show add form modal
    const [showModal, setShowModal] = useState(false);

    //for show edit form modal
    const [showEditModal, setShowEditModal] = useState(false);

    //for edit
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);

    // this is for search and filter
    const filteredWarehouses = warehouses.filter(warehouse =>
        warehouse.name.toLowerCase().includes(searchItem.toLowerCase()) &&

        (nameFilter === "" || warehouse.name === nameFilter) &&

        (regionFilter === "" || warehouse.regions?.name === regionFilter)
    )

    // this is for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentWarehouses = filteredWarehouses.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(filteredWarehouses.length / itemsPerPage);


    //for fetch region
    const fetchRegions = async () => {

        try {
            const data = await getRegion();
            setRegions(data);
        } catch (error) {
            console.log('Error fetching Regions:', error);
        }
    }

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


    //for delete warehouses
    const handleDelete = async (id) => {
        const isConfirmed = window.confirm("Are you sure to delete this Warehouse?");

        if (!isConfirmed) return;

        try {
            await deleteWarehouse(id);
            fetchWarehouses();
        } catch (error) {
            console.log('Error in delete warehouse', error)
            alert('Failed to delete Warehouse');
        }
    }


    // handle edit
    const handleEdit = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setShowEditModal(true);
    }

    const handleExportCSV = () => {
        const data = warehouses.map(w => ({
            Name: w.name,
            Region: w.regions?.name || '',
            Description: w.description
        }));

        const headers = ['Name','Region', 'Description'];
        exportToCSV(data, `warehouses-${new Date().toISOString().slice(0, 10)}.csv`, headers);
    }

    useEffect(() => {
        fetchWarehouses();
        fetchRegions();
    }, [])

    return (
        <div>
            <h1 className="font-bold mb-5 text-[24px]">Warehouses</h1>

            <div className="grid grid-cols-3 gap-10 mb-5">
                <CardComponent title="Total Warehouses" count={warehouses.length} icon={Home} />
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
                        <div
                            className='flex items-center border rounded-lg p-2 px-4  cursor-pointer text-gray-500 hover:ring-4 hover:ring-primary-300 hover:border-none'
                            onClick={() => setShowModal(true)}
                        >
                            <CirclePlus className="w-5 h-5 mr-2" />
                            <span>Add New Warehouse</span>
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
                                    {Array.from(new Set(warehouses.map(w => w.name))).map((name, idx) => (
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
                                <Dropdown label="Filter by Region" className="border border-gray-300 bg-white text-gray700 hover:bg-white" dismissOnClick={true}>
                                    <DropdownItem
                                        onClick={() => {
                                            setNameFilter("");
                                            setCurrentPage(1);
                                        }}
                                    >
                                        All
                                    </DropdownItem>
                                    {Array.from(new Set(regions.map(r => r.name))).map((name, idx) => (
                                        <DropdownItem
                                            key={idx}
                                            onClick={() => {
                                                setRegionFilter(name);
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
                            onClick={() => { setNameFilter(""); setRegionFilter(""); setCurrentPage(1); }}
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
                                <TableHeadCell>Region Name</TableHeadCell>
                                <TableHeadCell>Description</TableHeadCell>

                                <TableHeadCell colSpan={2}>
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
                                currentWarehouses.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center"
                                        >
                                            No Warehouse found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentWarehouses.map((warehouse, index) => {
                                        return (
                                            <TableRow key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                                <TableCell className="p-4">
                                                    <Checkbox />
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                    {warehouse.name}
                                                </TableCell>
                                                <TableCell>{warehouse.regions?.name}</TableCell>
                                                <TableCell>{warehouse.description}</TableCell>
                                                <TableCell className="flex items-center space-x-3">
                                                    <Pen className="text-[#26599F] hover:text-blue-600" onClick={() => handleEdit(warehouse)} />
                                                    <Trash2 className="text-red-600 hover:text-red-500" onClick={() => handleDelete(warehouse.id)} />
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })

                                )

                            )

                            }


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
                <AddWarehouse onClose={() => setShowModal(false)} region={regions} onAdd={fetchWarehouses} />
            }

            {showEditModal &&
                <EditWarehouse warehouse={selectedWarehouse} region={regions} onClose={() => setShowEditModal(false)} onUpdate={fetchWarehouses} />
            }
        </div>
    )
}