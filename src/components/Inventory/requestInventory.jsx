import { CircleX, Cross, Warehouse, X } from "lucide-react";
import { FloatingLabel, Textarea, Button, Spinner } from "flowbite-react";
import { ImagePlus, MoveLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabase/supabase-client";
import { createInventoryRequest } from "../../context/InventoryReqeustContext";
import { useUserProfiles } from "../../context/UserProfileContext";

export default function RequestInventory() {
    const [form, setForm] = useState({
        item_name: "",
        quantity: 1,
        notes: ""
    })

    const { profile } = useUserProfiles();

    const [imagePreview, setImagePreview] = useState(null);

    const [imageFile, setImageFile] = useState(null);

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

    // upload image to supabase storage
    const uploadImage = async () => {
        if (!imageFile) return null;

        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage
            .from("inventory-images")
            .upload(fileName, imageFile);

        if (error) throw error;

        const { publicUrl, error: urlError } = supabase.storage
            .from("inventory-images")
            .getPublicUrl(fileName);

        if (urlError) throw urlError;

        return publicUrl;
    };


    // submit form 
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const image_url = await uploadImage();

            await createInventoryRequest({
                requester_id: profile.id,
                item_name: form.item_name,
                quantity: parseInt(form.quantity),
                notes: form.notes,
                image_url: image_url || null,
            });

            alert("Request submitted successfully");
            setForm({ item_name: "", quantity: 1, notes: "" });
            setImageFile(null);
            setImagePreview(null);
        } catch (err) {
            console.error(err);
            alert("Error:" + err.message);
        } finally {
            setLoading(false);
        }
    }


    return (
        <div>
            <form action="" onSubmit={handleSubmit}>
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/request/engineer" className="p-2 hover:bg-gray-100 rounded-sm flex items-center me-2"><MoveLeft /></Link>
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
                                    name="item_name"
                                    value={form.item_name}
                                    onChange={handleChange}
                                    placeholder="Device01"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Quantity <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    min={1}
                                    required
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
                                            value={form.notes}
                                            rows={3}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                                            onChange={handleChange}
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