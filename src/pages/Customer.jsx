import { useEffect, useState } from "react";
import CardComponent from "../components/card/crad";
import { CirclePlus, Contact, Delete, Download, Edit, ListFilter, MapPin, Pen, Search, Trash2, UsersRound } from "lucide-react"
import Pagination from "../components/pagination/pagination";
import { Checkbox, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { Dropdown, DropdownItem } from "flowbite-react";
import AddCustomer from "../components/customer/addCustomer";
import EditCustomer from "../components/customer/editCustomer";
import { deleteCustomer, getCustomer } from "../context/CustomerContext";
import { exportToCSV } from "../utils/exportUtils";
import AppToast from "../components/toast/Toast";


export default function Customer() {
    const [toast, setToast] = useState(null);

    // for search in the input search
    const [searchItem, setSearchItem] = useState("");

    // for filter
    const [showFilter, setShowFilter] = useState(false);
    const [nameFilter, setNameFilter] = useState("");

    // for show add form modal
    const [showModal, setShowModal] = useState(false);



    // for fetch customer define state
    const [customers, setCustomers] = useState([]);

    const [loading, setLoading] = useState(false);

    //for edit 
    const [selectedCustomer, setSelectedCustomer] = useState([]);

    const [showEditModal, setShowEditModal] = useState(false);

    //for fetch customer
    const fetchCustomer = async () => {
        setLoading(true);
        try {
            const data = await getCustomer();

            setCustomers(data);
        } catch (error) {
            console.error('Error fetching in Customer', error);
        } finally {
            setLoading(false);
        }
    }

    // for delete customer
    const handleDelete = async (id) => {
        const isConfirmed = window.confirm('Are you sure to dlete this customer');


        if (!isConfirmed) return;

        try {
            await deleteCustomer(id);
            fetchCustomer();
        } catch (error) {
            console.error(error);
            setToast({
                type: "error",
                message: "Failed to delete Customer!"
            })
        }
    }


    // for edit
    const handleEdit = (customer) => {
        setSelectedCustomer(customer);
        setShowEditModal(true)
    }

    //for export
    const handleExportCSV = () => {
        const data = customers.map(c => ({
            Name: c.contact_person,
            "Company Name": c.company_name,
            "Contact Email": c.contact_email,
            "Contact Number": c.contact_number,
            "Address": c.address
        }));

        const headers = ['Name', 'Company Name', 'Contact Email', 'Contact Number', 'Address'];
        exportToCSV(data, `customer-${new Date().toISOString().slice(0, 10)}.csv`, headers);
    }


    // this is for search and filter
    const filteredCustomers = customers.filter(customer =>
        customer.contact_person.toLowerCase().includes(searchItem.toLowerCase()) &&

        (nameFilter === "" || customer.contact_person === nameFilter)
    )

    // this is for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);


    useEffect(() => {
        fetchCustomer();
    }, [])

    return (
        <div>
            <h1 className="font-bold mb-5 text-[24px]">Customers</h1>

            <div className="grid grid-cols-3 gap-10 mb-5">
                <CardComponent title="Total Customers" count={customers.length} icon={UsersRound} color="bg-teal-100" iconColor="text-teal-600" />
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
                            <span>Add New Customer</span>
                        </div>

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
                    <div className="grid grid-cols-5 gap-4 py-3 px-5 border-b border-gray-200">
                        <div className="flex flex-col space-y-2">
                            <label className="text-gray-700 font-medium">Name:</label>

                            <Dropdown label="Filter by Name" className="border border-gray-300 bg-white text-gray700 hover:bg-white" dismissOnClick={false}>
                                <DropdownItemft
                                    onClick={() => {
                                        setNameFilter("");
                                        setCurrentPage(1);
                                    }}
                                >
                                    All
                                </DropdownItemft>
                                {Array.from(new Set(customers.map(r => r.contact_person))).map((name, idx) => (
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
                )}

                <div className="overflow-x-auto rounded-lg">
                    <Table hoverable>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell className="p-4">
                                    <Checkbox />
                                </TableHeadCell>
                                <TableHeadCell>Name</TableHeadCell>
                                <TableHeadCell>Company Name</TableHeadCell>
                                <TableHeadCell>Contact Email</TableHeadCell>
                                <TableHeadCell>Contact Nubmer</TableHeadCell>
                                <TableHeadCell>Address</TableHeadCell>

                                <TableHeadCell colSpan={2}>
                                    <span>Action</span>
                                </TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody className="divide-y divide-gray-200">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-5">
                                        <div>
                                            <Spinner size="xl" color="info" aria-label="Loading..." />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (

                                currentCustomers.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center"
                                        >
                                            No Customer found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentCustomers.map((customer, index) => {
                                        return (
                                            <TableRow key={index} className="bg-white">
                                                <TableCell className="p-4">
                                                    <Checkbox />
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                    {customer.contact_person}
                                                </TableCell>
                                                <TableCell>{customer.company_name}</TableCell>
                                                <TableCell>{customer.contact_email}</TableCell>
                                                <TableCell>{customer.contact_number}</TableCell>
                                                <TableCell>{customer.address}</TableCell>

                                                <TableCell className="flex items-center space-x-3">
                                                    <Pen className="text-[#26599F] hover:text-blue-700" onClick={() => handleEdit(customer)} />
                                                    <Trash2 className="text-red-500 hover:text-red-700 cursor-pointer" onClick={() => handleDelete(customer.id)} />
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
                <AddCustomer onClose={() => setShowModal(false)} onAdd={fetchCustomer} setToast={setToast}/>
            }

            {showEditModal && selectedCustomer && (
                <EditCustomer customer={selectedCustomer} onClose={() => setShowEditModal(false)} onUpdate={fetchCustomer} setToast={setToast}/>
            )
            }

            {toast && (
                <div className="fixed top-5 right-5 z-50">
                    <AppToast
                        type={toast.type}
                        message={toast.message}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}
        </div>
    )
}