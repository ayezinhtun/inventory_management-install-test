import { CircleX, Cross, Warehouse, X } from "lucide-react";
import { Button } from "flowbite-react";
import { useState } from "react";
import { updateRack } from "../../context/RackContext";
import { supabase } from "../../../supabase/supabase-client";

export default function EditRack({ onClose, rack, warehouse, onUpdate }) {

    const [form, setForm] = useState({
        name: rack.name || '',
        size_u: rack.size_u || '',
        type: rack.type || '',
        status: rack.status || '',
        color: rack.color || '',
        notes: rack.notes || '',
        warehouse_id: rack.warehouse_id || ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm({ ...form, [name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            //fetch devices in this rack
            const { data: occupiedDevices } = await supabase
                .from("inventorys")
                .select("start_unit, height")
                .eq("rack_id", rack.id)

            const highestUsedUnit = occupiedDevices.length
                ? Math.max(...occupiedDevices.map(d => d.start_unit + d.height - 1))
                : 0;

            if (form.size_u < highestUsedUnit) {
                alert(
                    `Cannot reduce rack size. The highest occupied unit is ${highestUsedUnit}U.`
                );
                return;
            }

            await updateRack(rack.id, form);
            alert('Rack Updated Success!');
            onUpdate();
            onClose();
        } catch (error) {
            console.log('Error in update rack', error);
            alert('Failed to update rack')
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">

            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

            <div className="relative z-10 bg-white backdrop-blur-md w-[700px] rounded-lg shadow-xl rounded-md">
                <div className="flex items-center justify-between p-4 rounded-t-md border-b border-gray-200">
                    <h1 className="text-xl font-bold">Edit Rack</h1>
                    <X onClick={onClose} className="w-6 h-6 text-gray-600 cursor-pointer hover:text-red-500" />
                </div>
                <form className="p-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Rack Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Rack01"
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Warehouse <span className="text-red-500">*</span></label>
                            <select name="warehouse_id" value={form.warehouse_id} onChange={handleChange} id=""
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            >
                                <option value="">Select Warehouse</option>
                                {warehouse.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name} | {w.regions?.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Size (U) <span className="text-red-500">*</span></label>
                            <select name="size_u" value={form.size_u} onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            >
                                <option value="22">22U</option>
                                <option value="42">42U</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Type <span className="text-red-500">*</span></label>
                            <select name="type" value={form.type} onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            >
                                <option value="mixed">Mixed</option>
                                <option value="network">Network</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Status <span className="text-red-500">*</span></label>
                            <select name="status" value={form.status} onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Color</label>
                            <input
                                name="color"
                                value={form.color}
                                onChange={handleChange}
                                type="color"
                                className="p-2 h-11.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            />
                        </div>
                    </div>


                    <div className="mb-4">
                        <label htmlFor="" className="block mb-2 text-gray-900 text-sm font-medium">Note</label>
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Description"
                            rows={3}
                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#26599F] text-lg"
                    >
                        Edit
                    </Button>
                </form>
            </div>

        </div>
    )
}