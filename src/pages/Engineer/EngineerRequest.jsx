import { useEffect, useState } from "react";
import CardComponent from "../../components/card/crad";
import { CirclePlus, ClipboardList, Clock, Delete, Download, Edit, ListFilter, MapPin, Pen, Search, ShoppingBag, Trash2 } from "lucide-react"
import { Checkbox, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { useNavigate } from "react-router-dom";


export default function EngineerRequests() {
    const navigate = useNavigate();
    return (
        <div>
            <h1 className="font-bold mb-5 text-[24px]">My Requests</h1>

            <div className="grid grid-cols-3 gap-10 mb-5">
                <CardComponent title="Total Requests" count='10' icon={ClipboardList} color="bg-blue-100" iconColor="text-blue-600"/>
                <CardComponent title="Pending Requests" count='5' icon={Clock} color="bg-yellow-100" iconColor="text-yellow-600"/>
                <CardComponent title="Purchase Requests" count='5' icon={ShoppingBag} color="bg-green-10" iconColor="text-green-600"/>
            </div>

            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-auto">
                <div className="flex items-center justify-between py-3 border-b border-[#EAECF0] px-5 space-x-4">
                    <div className="flex space-x-3">
                        <div className="flex items-center border border-gray-300 rounded-lg p-2 px-4 w-[300px] focus-within:ring-4 focus-within:ring-primary-300">
                            <Search className="w-5 h-5 text-gray-500 mr-2" />

                            <input type="text" placeholder="Search by name" onChange={(e) => { setSearchItem(e.target.value); setCurrentPage(1) }} className="flex-1 outline-none border-none focus:border-none focus:ring-0" />
                        </div>

                        <div
                            className='flex items-center border rounded-lg p-2 px-4  cursor-pointer '
                        >
                            <ListFilter className="w-5 h-5 mr-2" />
                            <span>Filter</span>
                        </div>
                    </div>

                    <div className="flex space-x-5">
                        <button
                            onClick={() => navigate("/request-inventory")}
                            className='flex items-center border rounded-lg p-2 px-4  cursor-pointer text-gray-500 hover:ring-4 hover:ring-primary-300 hover:border-none'
                        >
                            <CirclePlus className="w-5 h-5 mr-2" />
                            <span>Add New Request</span>
                        </button>

                        <button
                            className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 transition'
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
                                    {Array.from(new Set(regions.map(r => r.name))).map((name, idx) => (
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

                )} */}

                <div className="overflow-x-auto rounded-lg">
                    <Table hoverable>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell className="p-4">
                                    <Checkbox />
                                </TableHeadCell>
                                <TableHeadCell>Name</TableHeadCell>
                                <TableHeadCell>Description</TableHeadCell>

                                <TableHeadCell colSpan={2}>
                                    <span>Action</span>
                                </TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody className="divide-y divide-gray-200">
                            <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                <TableCell className="p-4">
                                    <Checkbox />
                                </TableCell>
                                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                    Yangon
                                </TableCell>
                                <TableCell>Testing</TableCell>
                                <TableCell className="flex items-center space-x-3">
                                    <Pen className="text-[#26599F] hover:text-blue-700" />
                                    <Trash2 className="text-red-500 hover:text-red-700 cursor-pointer" />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>


            </div>
        </div>
    )
}