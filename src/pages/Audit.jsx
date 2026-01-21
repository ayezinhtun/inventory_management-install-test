import { useState } from "react";
import CardComponent from "../components/card/crad";
import { CirclePlus, Delete, Download, Edit, ListFilter, MapPin, Pen, Search, Trash2 } from "lucide-react"
import Pagination from "../components/pagination/pagination";
import { Checkbox, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { Dropdown, DropdownItem } from "flowbite-react";
import EditRegionModal from "../components/region/editregion";
import AddCustomer from "../components/customer/addCustomer";


export default function Audit() {

    const audits = [
        { name: "Aye Aye", email: "aye@gamil.com", action: "Update", date: Date.now() },
        { name: "Aye Aye", email: "aye@gamil.com", action: "Update", date: Date.now() },
    ];

    // for search in the input search
    const [searchItem, setSearchItem] = useState("");

    // for filter
    const [showFilter, setShowFilter] = useState(false);
    const [nameFilter, setNameFilter] = useState("");

    // for show add form modal
    const [showModal, setShowModal] = useState(false);

    //for show edit form modal
    const [showEditModal, setShowEditModal] = useState(false);


    // this is for search and filter
    const filteredAudits = audits.filter(audit =>
        audit.name.toLowerCase().includes(searchItem.toLowerCase()) &&

        (nameFilter === "" || audit.name === nameFilter)
    )

    const currentAudits = filteredAudits;


    return (
        <div>

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
                            className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 transition'
                        >
                            <Download className="w-5 h-5 mr-2" />
                            <span>Export</span>
                        </div>
                    </div>


                </div>

                {showFilter && (
                    <div className="grid grid-cols-5 gap-4 py-3 px-5 border-b border-gray-200">
                        <div className="flex flex-col space-y-2">
                            <label className="text-gray-700 font-medium">Name:</label>

                            <Dropdown label="Filter by Name" className="border border-gray-300 bg-white text-gray700 hover:bg-white" dismissOnClick={false}>
                                <DropdownItem
                                    onClick={() => {
                                        setNameFilter("");
                                        setCurrentPage(1);
                                    }}
                                >
                                    All
                                </DropdownItem>
                                {Array.from(new Set(audits.map(r => r.name))).map((name, idx) => (
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
                                <TableHeadCell>Email</TableHeadCell>
                                <TableHeadCell>Action</TableHeadCell>
                                <TableHeadCell>Date</TableHeadCell>

                                <TableHeadCell>
                                    <span>Action</span>
                                </TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody className="divide-y divide-gray-200">
                            {currentAudits.map((audit, index) => {
                                return (
                                    <TableRow key={index} className="bg-white">
                                        <TableCell className="p-4">
                                            <Checkbox />
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                            {audit.name}
                                        </TableCell>
                                        <TableCell>{audit.email}</TableCell>
                                        <TableCell>{audit.action}</TableCell>
                                        <TableCell>{new Date(audit.date).toLocaleString()}</TableCell>

                                        <TableCell className="flex items-center space-x-3">
                                            <Trash2 className="text-red-500 hover:text-red-700 cursor-pointer" />
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>


            </div>

            {showModal &&
                <AddCustomer onClose={() => setShowModal(false)} />
            }

            {showEditModal &&
                <EditRegionModal onClose={() => setShowEditModal(false)} />
            }
        </div>
    )
}