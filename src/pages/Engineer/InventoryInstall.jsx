import { Button, Spinner, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell } from "flowbite-react";
import { MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";


export default function InventoryInstallRequest() {
    return (
        <div>
            <form action="">
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-sm flex items-center me-2"><MoveLeft /></Link>
                        <h1 className="font-bold text-[24px]">Create Inventory Request</h1>
                    </div>
                    <Button
                        type="submit"
                        className="bg-[#26599F] text-lg"
                    >
                        Create Request
                    </Button>
                </div>
                <div className="grid grid-cols-12 gap-8">

                    <div className="col-span-8">
                        <div className="grid grid-cols-2 gap-2 gap-y-2">
                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Device Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Device01"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Destination Region <span className="text-red-500">*</span></label>
                                <select name="region_id" id=""
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                >
                                    <option value="">
                                        No Region
                                    </option>

                                </select>
                            </div>

                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Destination Warehouse <span className="text-red-500">*</span></label>
                                <select name="warehouse_id" id=""
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                >
                                    <option value="">
                                        No Warehouse
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Destination Rack <span className="text-red-500">*</span></label>
                                <select name="warehouse_id" id=""
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                >
                                    <option value="">
                                        No Rack
                                    </option>
                                </select>
                            </div>

                         
                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Destination Start Unit</label>
                                <input
                                    name="start_unit"
                                    type="number"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900">
                                   Destination Height (U)
                                </label>
                                <input
                                    name="height"
                                    type="number"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                                />
                            </div>
                        </div>

                        <div className="mt-2">
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-8">
                                    <div>
                                        <label className="block mb-2 text-gray-900 text-sm font-medium">
                                            Note
                                        </label>
                                        <textarea
                                            name="notes"
                                            placeholder="Description"
                                            rows={3}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-4">
                        <div className="overflow-x-auto shadow-sm">
                            <Table hoverable className="bg-gray-200 rounded-md">
                                <TableHead>
                                    <TableRow>
                                        <TableHeadCell colSpan={2} className="bg-gray-200">Current Information</TableHeadCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody className="divide-y">
                                    <TableRow className="bg-white border-bottom border-gray-300  border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            Device Name
                                        </TableCell>
                                        <TableCell>Server001</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            Region
                                        </TableCell>
                                        <TableCell>YGN</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            Warehouse
                                        </TableCell>
                                        <TableCell>TDC</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            Rack
                                        </TableCell>
                                        <TableCell>Rack A</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            Start Unit
                                        </TableCell>
                                        <TableCell>2U</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            Height
                                        </TableCell>
                                        <TableCell>5</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            Serial No
                                        </TableCell>
                                        <TableCell>serial001</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            Type
                                        </TableCell>
                                        <TableCell>Server</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            Model
                                        </TableCell>
                                        <TableCell>model001</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            Vendor
                                        </TableCell>
                                        <TableCell>vendor001</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            Color
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-block w-20 h-7 rounded">
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    )
}