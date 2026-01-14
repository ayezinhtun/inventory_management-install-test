import { use, useEffect, useState } from "react";
import CardComponent from "../components/card/crad";
import { CirclePlus, Contact, Delete, Download, Edit, ListFilter, MapPin, Package, Pen, Search, Trash2, UsersRound } from "lucide-react"
import { Checkbox, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { getCustomerInventory, restoreSale } from "../context/CustomerInventory";
import Pagination from "../components/pagination/pagination";
import EditCustomerInventory from "../components/Inventory/editCustomerInventory";
import { Dropdown, DropdownItem } from "flowbite-react";
import { exportToCSV } from "../utils/exportUtils";


export default function CustomerInventory() {

    const [customerInventory, setCustomerInventory] = useState([]);

    const [loading, setLoading] = useState(true);

    const [searchItem, setSearchItem] = useState("");

    const [showFilter, setShowFilter] = useState(false);

    const [nameFilter, setNameFilter] = useState("");

    const [restoreLoading, setRestoreLoading] = useState(false);

    const [selectedCustomerInventory, setSelectedCustomerInventory] = useState([]);

    const [showEditModal, setShowEditModal] = useState(false);

    const filteredInventorys = customerInventory.filter(c =>
        c.customers?.contact_person.toLowerCase().includes(searchItem.toLowerCase()) &&

        (nameFilter === "" || c.customers?.contact_person === nameFilter)
    )

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentInventorys = filteredInventorys.slice(indexOfFirst, indexOfLast);


    const totalPages = Math.ceil(filteredInventorys.length / itemsPerPage);

    const fetchInventorys = async () => {
        setLoading(true);

        try {
            const data = await getCustomerInventory();
            setCustomerInventory(data);
        } catch (error) {
            console.log('Error fetching Inventorys:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleRestore = async (sale) => {
        const confirm = window.confirm(`Restore inventory "${sale.inventorys.name}" from customer "${sale.customers.contact_person}"? `);
        if (!confirm) return;

        setRestoreLoading(true);

        try {
            await restoreSale(sale.id, sale.inventory_id, sale.quantity);
            alert("Inventory restored successfully");
            fetchInventorys();
        } catch (error) {
            alert("Failed to restore Inventory:" + error.message);
        } finally {
            setRestoreLoading(false);
        }
    }

    const handleEdit = (i) => {
        setSelectedCustomerInventory(i);
        setShowEditModal(true)
    }

    const handleExportCSV = () => {
        const data = customerInventory.map(i => ({
            'Customer Name': i.customers?.contact_person, 
            'Company Name': i.customers?.company_name, 
            'Inventory Name': i.inventorys?.name, 
            'Serial No': i.inventorys.serial_no, 
            'Inventory Type': i.inventorys?.type, 
            'Quantity': i.quantity, 
            'Notes': i.notes
        }));

        const headers = ['Customer Name', 'Company Name', 'Inventory Name', 'Serial No', 'Inventory Type', 'Quantity', 'Notes'];
        exportToCSV(data, `customerinventorys-${new Date().toISOString().slice(0, 10)}.csv`, headers);

    }
    useEffect(() => {
        fetchInventorys();
    }, [])

    return (
        <div>
            <h1 className="font-bold mb-5 text-[24px]">Inventorys</h1>

            <div className="grid grid-cols-3 gap-10 mb-5">
                <CardComponent title="Total Inventory" count={customerInventory.length} icon={Package} color="bg-blue-100" iconColor="text-blue-600"/>
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

                        <button
                            onClick={handleExportCSV}
                            className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 transition'
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
                                    {Array.from(new Set(customerInventory.map(c => c.customers?.contact_person))).map((name, idx) => (
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
                        </div>


                        <button
                            onClick={() => { setNameFilter(""); setCurrentPage(1); }}
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
                                <TableHeadCell>Customer Name</TableHeadCell>
                                <TableHeadCell>Company Name</TableHeadCell>
                                <TableHeadCell>Inventory Name</TableHeadCell>
                                <TableHeadCell>Serial No</TableHeadCell>
                                <TableHeadCell>Inventory Type</TableHeadCell>
                                <TableHeadCell>Quantity</TableHeadCell>
                                <TableHeadCell>Notes</TableHeadCell>

                                <TableHeadCell colSpan={2}>
                                    <span>Action</span>
                                </TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody className="divide-y divide-gray-200">
                            {loading ? (
                                <TableRow >
                                    <TableCell colSpan={8} className="text-center py-5">
                                        <div>
                                            <Spinner size="xl" color="info" aria-label="Loading..." />
                                        </div>
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
                                    currentInventorys.map((i) => {
                                        return (
                                            <TableRow key={i.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                                <TableCell className="p-4">
                                                    <Checkbox />
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                    {i.customers?.contact_person}
                                                </TableCell>
                                                <TableCell>{i.customers?.company_name}</TableCell>
                                                <TableCell>{i.inventorys.name}</TableCell>
                                                <TableCell>{i.inventorys.serial_no}</TableCell>
                                                <TableCell>{i.inventorys.type}</TableCell>
                                                <TableCell>{i.quantity}</TableCell>
                                                <TableCell>{i.notes}</TableCell>


                                                <TableCell className="flex items-center space-x-3">
                                                    <Pen className="text-[#26599F] hover:text-blue-700" onClick={() => handleEdit(i)} />
                                                    {/* <Trash2 className="text-red-500 hover:text-red-700 cursor-pointer" /> */}
                                                    <button
                                                        onClick={() => handleRestore(i)}
                                                        className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 transition'
                                                    >
                                                        {restoreLoading && (
                                                            <div className="fixed inset-0 flex justify-center items-center ">
                                                                <Spinner
                                                                    aria-level="Loading..."
                                                                    size="xl"
                                                                    color="info"
                                                                />
                                                            </div>
                                                        )}
                                                        {restoreLoading ? "Restoring..." : "Restore"}
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

                {showEditModal && selectedCustomerInventory && (
                    <EditCustomerInventory
                        customerinventory={selectedCustomerInventory}
                        onClose={() => setShowEditModal(false)}
                        onUpdate={fetchInventorys}
                    />
                )}

            </div>

        </div >
    )
}