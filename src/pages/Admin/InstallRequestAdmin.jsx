import { useEffect, useState } from "react";
import { CheckCircle, CirclePlus, ClipboardList, Clock, Delete, Download, Edit, ListFilter, MapPin, Pen, Search, ShoppingBag, Trash2, XCircle } from "lucide-react"
import { Checkbox, Dropdown, DropdownItem, Modal, ModalBody, ModalHeader, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import CardComponent from "../../components/card/crad";
import { data } from "react-router-dom";
import { getInstallRequests, updateInstallRequestStatus } from "../../context/InstallRequest";
import { useUserProfiles } from '../../context/UserProfileContext';

export default function InstallRequestAdmin() {

    const { profile } = useUserProfiles();

    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);

        try {
            const data = await getInstallRequests('pm_approved');
            setRequests(data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusChange = async (id, status) => {
        if (!profile?.id) {
            alert("PM not logged in!");
            return;
        };

        const isConfirmed = window.confirm('Are you sure want to Approve');
        if (!isConfirmed) return;

        try {

            console.log("Updating installation request:", id, "with status:", status, "by user:", profile.id);

            //call your supabase function
            await updateInstallRequestStatus(id, status, profile.id);

            // update the local state
            setRequests(prev => prev.map(req =>
                req.id === id ? { ...req, status } : req
            ));


            alert(`Request Approve successfully!`);

            // reload form server
            fetchRequests();
        } catch (err) {
            console.error('Failed to update status', err);
            alert("Failed to update request status. Please try again");
        }
    }

    const totalCount = requests.length;
    const PendingCount = requests.filter(r => r.status === 'pm_approve_pending').length;

    return (
        <div>
            <h1 className="font-bold mb-5 text-[24px]">Engineer's Requests</h1>

            <div className="grid grid-cols-3 gap-y-5 gap-10 mb-5">
                <CardComponent title="Total Requests" count={totalCount} icon={ClipboardList} color="bg-blue-100" iconColor="text-blue-600" />
                <CardComponent title="Pending Requests" count={PendingCount} icon={Clock} color="bg-yellow-100" iconColor="text-yellow-600" />
            </div>

            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-auto">
                <div className="flex items-center justify-between py-3 border-b border-[#EAECF0] px-5 space-x-4">
                    <div className="flex space-x-3">
                        <div className="flex items-center border border-gray-300 rounded-lg p-2 px-4 w-[300px] focus-within:ring-4 focus-within:ring-primary-300">
                            <Search className="w-5 h-5 text-gray-500 mr-2" />

                            <input type="text" placeholder="Search by name" className="flex-1 outline-none border-none focus:border-none focus:ring-0" />
                        </div>

                        <div
                            className='flex items-center border rounded-lg p-2 px-4  cursor-pointer'
                        >
                            <ListFilter className="w-5 h-5 mr-2" />
                            <span>Filter</span>
                        </div>
                    </div>

                    <div className="flex space-x-5">
                        <button
                            className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition'
                        >
                            <Download className="w-5 h-5 mr-2" />
                            <span>Export</span>
                        </button>
                    </div>


                </div>

                {/* {showFilter && (
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

                )} */}


                <div className="overflow-x-auto rounded-lg">
                    <Table hoverable>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell className="p-4">
                                    <Checkbox />
                                </TableHeadCell>
                                <TableHeadCell>Item</TableHeadCell>
                                <TableHeadCell>Qty</TableHeadCell>
                                <TableHeadCell>Status</TableHeadCell>
                                <TableHeadCell>Requester</TableHeadCell>
                                <TableHeadCell>Destination Server</TableHeadCell>
                                <TableHeadCell>Destination Region</TableHeadCell>
                                <TableHeadCell>Destination Warehouse</TableHeadCell>
                                <TableHeadCell>Destination Rack</TableHeadCell>
                                <TableHeadCell>Note</TableHeadCell>

                                <TableHeadCell>
                                    <span>Action</span>
                                </TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody className="divide-y divide-gray-200">
                            {requests.map((request => {
                                return (
                                    <TableRow key={request.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                        <TableCell className="p-4">
                                            <Checkbox />
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            {request.component.name}
                                        </TableCell>
                                        <TableCell>{request.quantity}</TableCell>
                                        <TableCell>
                                            {request.status}
                                        </TableCell>

                                        <TableCell>{request.requester.name}</TableCell>
                                        <TableCell>{request.server?.name || ''}</TableCell>
                                        <TableCell>{request.region?.name || ''}</TableCell>
                                        <TableCell>{request.warehouse?.name || ''}</TableCell>
                                        <TableCell>{request.rack?.name || ''}</TableCell>
                                        <TableCell>{request.notes}</TableCell>

                                        <TableCell className="flex item-center space-x-3">
                                            <button
                                                onClick={() => {
                                                    if (!profile?.id) return alert("Admin Not Logged in yet!")
                                                    handleStatusChange(request.id, "admin_approved")
                                                }}
                                                className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 transition'
                                            >
                                                <span>Apporve</span>
                                            </button>

                                            <button
                                                onClick={() => handleStatusChange(request.id, "rejected")}
                                                className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-rose-500 hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 transition'
                                            >
                                                <span>Reject</span>
                                            </button>

                                        </TableCell>
                                    </TableRow>
                                )
                            }))}


                        </TableBody>
                    </Table>
                </div>

            </div>


        </div>
    )
}


