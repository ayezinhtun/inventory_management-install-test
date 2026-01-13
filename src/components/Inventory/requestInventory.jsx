import { CircleX, Cross, Warehouse, X } from "lucide-react";
import { FloatingLabel, Textarea, Button, Spinner } from "flowbite-react";
import { ImagePlus, MoveLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabase/supabase-client";
import { useNavigate } from "react-router-dom";


export default function RequestInventory() {

    const navigate = useNavigate();

    const [imagePreview, setImagePreview] = useState(null);

    const [imageFile, setImageFile] = useState(null);
    
    const [attributeFields, setAttributeFields] = useState([]);

    const [error, setError] = useState(null);

    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // to validate type
        const validateType = ["image/jpeg", "image/png", "image/jpg"];

        if (!validateType.includes(file.type)) {
            alert("File extention is not allowed!");
            setImagePreview(null);
            e.target.value(null);
            setImageFile(null);
            return;
        }


        // to validate file size 
        const validateFilesize = 5 * 1024 * 1024;

        if (file.size > validateFilesize) {
            alert("Only under 5MB are allowed!");
            setImagePreview(null);
            e.target.value(null);
            setImageFile(null);
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleAttrChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [name]: value
            }
        }))
    };

    // Add custom Attribute dynamically
    const addCustomAttribute = () => {
        const attrName = prompt("Enter attribute name:");
        if (!attrName) return;
        setAttributeFields(prev => [...prev, attrName]);
        setForm(prev => ({
            ...prev,
            attributes: { ...prev.attributes, [attrName]: "" }
        }));
    };

    // default attribtutes by type
    const typeAttributes = {
        server: ["cpu", "ram", "storage"],
        switch: ["ports", "speed"],
        router: ["ip", "routing_protocol"]
    };


    const renderAttributes = () => {
        const typeKey = (form.type || "").toLowerCase();
        const defaults = typeAttributes[typeKey] || [];

        return (
            <div className="flex flex-col gap-2"> {/* stack vertically with gap */}
                {/* Add button always on top */}
                <div className="grid grid-cols-3">
                    <Button
                        type="button"
                        onClick={addCustomAttribute}
                        className="bg-[#26599F] text-lg w-3xs mb-2"
                    >
                        + Add Custom Attribute
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full">
                    {/* All attribute inputs below */}
                    {[...defaults, ...attributeFields].map((attr) => (
                        <div key={attr} className="mb-2">
                            <label className="block text-sm font-medium mb-1">
                                {attr.toUpperCase()}
                            </label>
                            <input
                                type="text"
                                name={attr}
                                onChange={handleAttrChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };





    return (
        <div>
            <form action="">
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center">
                        <h1 className="font-bold text-[24px]">Request Inventory</h1>
                    </div>
                    <Button
                        type="submit"
                        className="bg-[#26599F] text-lg"
                        disabled={loading}
                    >
                        {loading && (
                            <div className="fixed inset-0 flex justify-center items-center ">
                                <Spinner
                                    aria-level="Loading..."
                                    size="xl"
                                    color="info"
                                />
                            </div>
                        )}
                        {loading ? "Saving..." : "Request"}
                    </Button>
                </div>
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
                                            setImageFile(null)
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
                                    name="name"
                                    onChange={handleChange}
                                    placeholder="Device01"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Quantity <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="quantity"
                                    onChange={handleChange}
                                    placeholder="1"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                />
                            </div>

                        </div>

                        <div className="mt-2">
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-8">
                                    <div>
                                        <label className="block mb-2 text-gray-900 text-sm font-medium">
                                            Notes
                                        </label>
                                        <textarea
                                            name="notes"
                                            placeholder="Notes"
                                            rows={3}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* {form.type && (
                            <div className="mt-2">
                                <label className="block mb-2 text-gray-900 text-sm font-medium">
                                    {form.type.toUpperCase()} Specification
                                </label>
                                <div className="border border-gray-200 px-2 py-4 rounded">
                                    <div>
                                        {renderAttributes()}
                                    </div>
                                </div>
                            </div>
                        )} */}
                    </div>

                </div>
            </form>
        </div>
    )
}