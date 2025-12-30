import { CircleX, Cross, X } from "lucide-react";
import { FloatingLabel, Textarea, Button } from "flowbite-react";
import { ImagePlus } from "lucide-react";

export default function AddInventory({ onClose }) {

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 ">

            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

            <div className="relative z-10 bg-white backdrop-blur-md w-[700px] max-h-[90vh] rounded-lg shadow-xl rounded-md overflow-y-auto">
                <div className="flex items-center justify-between p-4 rounded-t-md border-b border-gray-200">
                    <h1 className="text-xl font-bold">Add Inventory</h1>
                    <CircleX onClick={onClose} className="w-6 h-6 text-gray-600 cursor-pointer hover:text-red-500" />
                </div>
                <form className="p-6">

                    <div className="mb-4">
                        <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Device Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            placeholder="Device01"
                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                        />
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Status <span className="text-red-500">*</span></label>
                            <select name="" id=""
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            >
                                <option value="">Active</option>
                                <option value="">Inactive</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Color</label>
                            <input
                                type="color"
                                className="w-full p-0 h-11.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            />
                        </div>

                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Type <span className="text-red-500">*</span></label>
                            <select name="" id=""
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            >
                                <option value="">Server</option>
                                <option value="">Switch</option>
                                <option value="">Router</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Model <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="Model01"
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Vendor <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="Vendor01"
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Serial No </label>
                            <input
                                type="text"
                                placeholder="Serial01"
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Start Unit <span className="text-red-500">*</span></label>
                            <select name="" id=""
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            >
                                <option value="">22U</option>
                                <option value="">36U</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Height (U) <span className="text-red-500">*</span></label>
                            <input
                                type="number"

                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            />
                        </div>
                    </div>


                    <div className="mb-4">
                        <label className="block mb-2 text-gray-900 text-sm font-medium">
                            Image
                        </label>

                        <label
                            htmlFor="imageUpload"
                            className="flex flex-col items-center justify-center w-full h-30 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition hover:border-[#26599F] hover:bg-gray-50"
                        >
                            <ImagePlus className="w-12 h-12 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Upload Image</span>

                            <input
                                id="imageUpload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                            />
                        </label>
                    </div>


                    <div className="mb-4">
                        <label htmlFor="" className="block mb-2 text-gray-900 text-sm font-medium">Note</label>
                        <textarea
                            placeholder="Description"
                            rows={3}
                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="" className="block mb-2 text-gray-900 text-sm font-medium">Server Sepecification <span className="text-red-500">*</span></label>

                        <div className="border border-gray-200 p-2 rounded">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">CPU <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">RAM <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Storage <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#26599F] text-lg"
                    >
                        Add
                    </Button>
                </form>
            </div>

        </div>
    )
}