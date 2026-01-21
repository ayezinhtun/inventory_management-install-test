import { Button, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell } from 'flowbite-react';
import { MoveLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ComponentRelocationRequest() {
    return (
        <div>
            <form>
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-sm flex items-center me-2"><MoveLeft /></Link>
                        <h1 className="font-bold text-[24px]">Create Relocation Request</h1>
                    </div>
                    <Button type="submit" className="bg-[#26599F]">Create Request</Button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-8">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block mb-2">Component Name *</label>
                                <select name="inventory_id" required className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500">
                                    <option value="">Select Component</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2">Destination Device *</label>
                                <select name="server_id" required className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500">
                                    <option value="">Select Server</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2">Quantity</label>
                                <input name="quantity" type="number" min={1} className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500" />
                            </div>
                        </div>

                        <div className="mt-2">
                            <label className="block mb-2">Note</label>
                            <textarea name="notes" rows={3} className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"></textarea>
                        </div>
                    </div>

                    <div className="col-span-4">
                        <Table hoverable>
                            <TableHead>
                                <TableRow>
                                    <TableHeadCell colSpan={2}>Current Component Information</TableHeadCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Attributes</TableCell>
                                    <TableCell>
                                        
                                    </TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                    </div>
                </div>
            </form>


        </div>
    );
}
