import { useEffect, useState } from "react";
import { CheckCircle, CirclePlus, ClipboardList, Clock, Delete, Download, Edit, ListFilter, MapPin, Pen, Search, ShoppingBag, Trash2, XCircle } from "lucide-react"
import { Checkbox, Dropdown, DropdownItem, Modal, ModalBody, ModalHeader, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import CardComponent from "../../components/card/crad";
import { fetchAllInventoryRequest, updateRequestStatus } from "../../context/InventoryRequestContext";
import Pagination from "../../components/pagination/pagination";
import { exportToCSV } from "../../utils/exportUtils";


export default function AdminInventoryRequest() {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const [searchItem, setSearchItem] = useState("");

    const [showFilter, setShowFilter] = useState(false);
    const [nameFilter, setNameFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // load requests
    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await fetchAllInventoryRequest();
            setRequests(data || []);
        } catch (err) {
            console.error("Failed to load requests", err);
        } finally {
            setLoading(false);
        }
    }

    // update status
    const handleStatusChagne = async (id, status) => {
        const isConfirmed = window.confirm(`Are you sure you want to update this request to "${status}"?`);
        if (!isConfirmed) return;

        try {
            await updateRequestStatus(id, status);

            setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));

            alert(`Request status updated to "${status}" successfully!`);

            loadRequests();
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update request status. Please try again.");
        }
    }

    const filteredRequests = requests.filter(request =>
        request.item_name.toLowerCase().includes(searchItem.toLowerCase()) &&

        (nameFilter === "" || request.item_name === nameFilter) &&

        (statusFilter === "" || request.status === statusFilter)
    )

    const [currentPage, setCurrentPage] = useState(1);
    const itmesPerPage = 3;

    const indexOfLast = currentPage * itmesPerPage;
    const indexOfFirst = indexOfLast - itmesPerPage;
    const currentRegions = filteredRequests.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(filteredRequests.length / itmesPerPage);

    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === "pending").length;
    const purchaseRequests = requests.filter(r => r.status === "purchase").length;
    const rejectedCount = requests.filter(r => r.status === 'rejected').length;
    const availableCount = requests.filter(r => r.status === 'available').length;


    const handleExportCSV = () => {
        const data = requests.map(r => ({
            Name: r.item_name, 
            Requester: r.requester?.name, 
            Quantity: r.quantity, 
            Notes: r.notes, 
            Status: r.status
        }));

        const headers = ['Name', 'Requester', 'Quantity', 'Notes', 'Status'];
        exportToCSV(data, `inventory-requests-${new Date().toISOString().slice(0, 10)}.csv`, headers);
    }
    
    return (
        <div>
            <h1 className="font-bold mb-5 text-[24px]">Engineer's Requests</h1>

            <div className="grid grid-cols-3 gap-y-5 gap-10 mb-5">
                <CardComponent title="Total Requests" count={totalRequests} icon={ClipboardList} color="bg-blue-100" iconColor="text-blue-600" />
                <CardComponent title="Pending Requests" count={pendingRequests} icon={Clock} color="bg-yellow-100" iconColor="text-yellow-600" />
                <CardComponent title="Purchase Requests" count={purchaseRequests} icon={ShoppingBag} color="bg-green-10" iconColor="text-green-600" />
                <CardComponent title="Rejected Requests" count={rejectedCount} icon={XCircle} color="bg-red-100" iconColor="text-red-600" />
                <CardComponent title="Available Requests" count={availableCount} icon={CheckCircle} color="bg-blue-100" iconColor="text-blue-600" />
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
                         text-gray-500`} onClick={() => setShowFilter(prev => !prev)}
                        >
                            <ListFilter className="w-5 h-5 mr-2" />
                            <span>Filter</span>
                        </div>
                    </div>

                    <div className="flex space-x-5">
                        <button
                            onClick={handleExportCSV}
                            className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition'
                        >
                            <Download className="w-5 h-5 mr-2" />
                            <span>Export</span>
                        </button>
                    </div>


                </div>

                {showFilter && (
                    <div className="flex items-center justify-between py-3 px-5 border-b border-gray-200 ">
                        <div className="grid grid-cols-5 gap-2 ">
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
                                    {Array.from(new Set(requests.map(r => r.item_name))).map((name, idx) => (
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
                                            setStatusFilter("");
                                            setCurrentPage(1);
                                        }}
                                    >
                                        All
                                    </DropdownItem>
                                    {Array.from(new Set(requests.map(r => r.status))).map((status, idx) => (
                                        <DropdownItem
                                            key={idx}
                                            onClick={() => {
                                                setStatusFilter(status);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </DropdownItem>
                                    ))}

                                </Dropdown>
                            </div>
                        </div>

                        <button
                            onClick={() => { setNameFilter(""); setStatusFilter(""); setCurrentPage(1); }}
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
                                <TableHeadCell>Image</TableHeadCell>
                                <TableHeadCell>Item</TableHeadCell>
                                <TableHeadCell>Qty</TableHeadCell>
                                <TableHeadCell>Status</TableHeadCell>
                                <TableHeadCell>Requester</TableHeadCell>
                                <TableHeadCell>Note</TableHeadCell>

                                <TableHeadCell>
                                    <span>Action</span>
                                </TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody className="divide-y divide-gray-200">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-5">
                                        <div>
                                            <Spinner size="xl" color="info" aria-label="Loading..." />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRequests.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center"
                                        >
                                            No Request found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRequests.map((r) => (
                                        <TableRow key={r.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                            <TableCell className="p-4">
                                                <Checkbox />
                                            </TableCell>
                                            <TableCell>
                                                {r.image ? (
                                                    <img
                                                        src={`https://frbzprbrsihovjypoftc.supabase.co/storage/v1/object/public/inventory-images/${r.image}`}
                                                        alt={r.item_name}
                                                        className="w-16 h-12 object-cover rounded-md"
                                                        onClick={() => {
                                                            setSelectedImage(`https://frbzprbrsihovjypoftc.supabase.co/storage/v1/object/public/inventory-images/${r.image}`);
                                                            setShowModal(true);
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                                                        No Image
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                {r.item_name}
                                            </TableCell>
                                            <TableCell>{r.quantity}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 rounded
                                                    ${r.status === "pending" && "bg-yellow-100 text-yellow-700"}
                                                    ${r.status === "purchase" && "bg-green-100 text-green-700"}
                                                    ${r.status === "rejected" && "bg-red-100 text-red-700"}
                                                    ${r.status === "available" && "bg-blue-100 text-blue-700"}

                                                `}
                                                >
                                                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                                                </span>
                                            </TableCell>

                                            <TableCell>{r.requester?.name}</TableCell>
                                            <TableCell>{r.notes}</TableCell>

                                            <TableCell className="flex item-center space-x-3">
                                                <button
                                                    onClick={() => handleStatusChagne(r.id, "pending")}
                                                    className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 transition'
                                                >
                                                    <span>Pending</span>
                                                </button>

                                                <button
                                                    onClick={() => handleStatusChagne(r.id, "purchase")}
                                                    className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 transition'
                                                >
                                                    <span>Purchase</span>
                                                </button>

                                                <button
                                                    onClick={() => handleStatusChagne(r.id, "rejected")}
                                                    className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-rose-500 hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 transition'
                                                >
                                                    <span>Reject</span>
                                                </button>

                                                <button
                                                    onClick={() => handleStatusChagne(r.id, "available")}
                                                    className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition'
                                                >
                                                    <span>Available</span>
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))
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

            <Modal
                show={showModal}
                size="3xl"
                popup={true}
                onClose={() => setShowModal(false)}

            >
                <ModalHeader />
                <ModalBody>
                    <img
                        src={selectedImage}
                        alt="Large"
                        className="w-full h-auto object-contain rounded"
                    />
                </ModalBody>
            </Modal>
        </div>
    )
}


