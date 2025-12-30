import { CircleX, Cross, X } from "lucide-react";
import { FloatingLabel, Textarea, Button } from "flowbite-react";
import { ImagePlus, MoveLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";


export default function CreateInventory() {

    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // to validate type
        const validateType = ["image/jpeg", "image/png", "image/jpg"];

        if (!validateType.includes(file.type)) {
            alert("File extention is not allowed!");
            setImagePreview(null);
            e.target.value(null);
            return;
        }


        // to validate file size 
        const validateFilesize = 5 * 1024 * 1024;

        if (file.size > validateFilesize) {
            alert("Only under 50MB are allowed!");
            setImagePreview(null);
            e.target.value(null);
            return;
        }

        setImagePreview(URL.createObjectURL(file));
    }

    return (
        <div>
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center">
                    <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-sm flex items-center me-2"><MoveLeft /></Link>
                    <h1 className="font-bold text-[24px]">Add Inventory</h1>
                </div>
                <Button
                    type="submit"
                    className="bg-[#26599F] text-lg"
                >
                    New Inventory
                </Button>
            </div>
            <form action="">
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-3">
                        <div className="relative w-full">
                            {!imagePreview ? (
                                <label
                                    htmlFor="imageUpload"
                                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition hover:border-[#26599F] hover:bg-gray-50"
                                >
                                    <ImagePlus className="w-12 h-12 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Upload Image</span>

                                    <input
                                        id="imageUpload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            ) : (
                                <div className="relative">
                                    <img src={imagePreview} className="w-full h-40 object-cover rounded-lg" alt="" />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                            )}

                        </div>
                    </div>

                    <div className="col-span-9">
                        <div className="grid grid-cols-3 gap-2 gap-y-2">
                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Device Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="Device01"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Status <span className="text-red-500">*</span></label>
                                <select name="" id=""
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                >
                                    <option value="">Active</option>
                                    <option value="">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Serial No </label>
                                <input
                                    type="text"
                                    placeholder="Serial01"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                />
                            </div>


                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Type <span className="text-red-500">*</span></label>
                                <select name="" id=""
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                >
                                    <option value="">Server</option>
                                    <option value="">Switch</option>
                                    <option value="">Router</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Model <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="Model01"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                />
                            </div>


                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Vendor <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="Vendor01"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                />
                            </div>



                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Start Unit <span className="text-red-500">*</span></label>
                                <select name="" id=""
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                >
                                    <option value="">22U</option>
                                    <option value="">36U</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Height (U) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"

                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Color</label>
                                <input
                                    type="color"
                                    className="p-2 h-11.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="mt-2">
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-8">
                                    <div>
                                        <label htmlFor="" className="block mb-2 text-gray-900 text-sm font-medium">Note</label>
                                        <textarea
                                            placeholder="Description"
                                            rows={3}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="mt-2">
                            <label htmlFor="" className="block mb-2 text-gray-900 text-sm font-medium">Server Sepecification <span className="text-red-500">*</span></label>

                            <div className="border border-gray-200 px-2 py-4  rounded">
                                <div className="grid grid-cols-3 gap-4">
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
                    </div>

                </div>
            </form>
        </div>
    )
}