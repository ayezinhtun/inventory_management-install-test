import { useEffect, useState } from "react";
import { X, ImagePlus, MoveLeft } from "lucide-react";
import { Button } from "flowbite-react";
import { Link } from "react-router-dom";
import { getWarehouse } from "../../context/WarehouseContext";
import { getRegion } from "../../context/RegionContext";
import { supabase } from "../../../supabase/supabase-client";

export default function CreatePart() {
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [warehouses, setWarehouses] = useState([]);

    const [regions, setRegions] = useState([]);

    const [form, setForm] = useState({
        type: "",
        name: "",
        serial_no: "",
        model: "",
        vendor: "",
        quantity: 1,
        color: "#10b981",
        notes: "",
        attributes: {},
        region_id: "",
        warehouse_id: ""
    });

    const [attributeFields, setAttributeFields] = useState([]);

    // Default attributes by type
    const typeAttributes = {
        ram: ["capacity", "speed", "form_factor"],
        cpu: ["cores", "threads", "frequency", "socket"],
        ssd: ["capacity", "interface", "form_factor"],
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAttrChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [name]: value,
            },
        }));
    };

    const addCustomAttribute = () => {
        const attrName = prompt("Enter attribute name:");
        if (!attrName) return;
        setAttributeFields((prev) => [...prev, attrName]);
        setForm((prev) => ({
            ...prev,
            attributes: { ...prev.attributes, [attrName]: "" },
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            alert("Only JPG/PNG allowed!");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("File must be under 5MB!");
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const renderAttributes = () => {
        const defaults = typeAttributes[form.type] || [];
        return (
            <div className="flex flex-col gap-2">
                <Button
                    type="button"
                    onClick={addCustomAttribute}
                    className="bg-[#26599F] text-white w-3xs mb-2"
                >
                    + Add Custom Attribute
                </Button>

                <div className="grid grid-cols-3 gap-4 w-full">
                    {[...defaults, ...attributeFields].map((attr) => (
                        <div key={attr}>
                            <label className="block text-sm font-medium mb-1">{attr}</label>
                            <input
                                type="text"
                                name={attr}
                                value={form.attributes[attr] || ""}
                                onChange={handleAttrChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simple validation
        if (!form.type || !form.name || !form.model || !form.vendor) {
            alert("Please fill in required fields!");
            return;
        }

        // For demo, just log the form
        console.log("Form submitted:", form);
        alert("Component added (UI demo only)");

        // Reset form
        setForm({
            type: "",
            name: "",
            serial_no: "",
            model: "",
            vendor: "",
            quantity: 1,
            notes: "",
            attributes: {},
            region_id: "",
            warehouse_id: "",
        });
        setImageFile(null);
        setImagePreview(null);
        setAttributeFields([]);
    };

    useEffect(() => {
        const loadRegion = async () => {
            const data = await getRegion();
            setRegions(data || []);
        };
        loadRegion();
    }, []);

    useEffect(() => {
        const loadWh = async () => {
            if (!form.region_id) {
                setWarehouses([]);
                setForm((prev) => ({ ...prev, warehouse_id: "" }));
                return;
            }

            const { data, error } = await supabase
                .from('warehouses')
                .select("id, name, region_id")
                .eq("region_id", form.region_id)
                .order("name");

            if (error) {
                console.error(error);
                setWarehouses([]);
            } else {
                setWarehouses(data || []);
            }
        };
        loadWh();
    }, [form.region_id]); // <-- run when region_id changes


    return (
        <div className="p-6">
            <form onSubmit={handleSubmit}>
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link
                            to="/inventory"
                            className="p-2 hover:bg-gray-100 rounded-sm flex items-center me-2"
                        >
                            <MoveLeft />
                        </Link>
                        <h1 className="font-bold text-[24px]">Add Component</h1>
                    </div>
                    <Button type="submit" className="bg-[#26599F] text-lg">
                        Add Component
                    </Button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Image Upload */}
                    <div className="col-span-3">
                        {!imagePreview ? (
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#26599F] hover:bg-gray-50">
                                <ImagePlus className="w-12 h-12 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Upload Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                        ) : (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    className="w-full h-40 object-cover rounded-lg"
                                    alt=""
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setImageFile(null);
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="col-span-9 grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Type *</label>
                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg"
                            >
                                <option value="">Select Type</option>
                                <option value="ram">RAM</option>
                                <option value="cpu">CPU</option>
                                <option value="ssd">SSD</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Serial No</label>
                            <input
                                type="text"
                                name="serial_no"
                                value={form.serial_no}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Region <span className="text-red-500">*</span></label>
                            <select name="region_id" id="" value={form.region_id} onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            >
                                <option value="">
                                    No Region
                                </option>
                                {regions.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Warehouse <span className="text-red-500">*</span></label>
                            <select name="warehouse_id" id="" value={form.warehouse_id} onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            >
                                <option value="">
                                    No Warehouse
                                </option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Model *</label>
                            <input
                                type="text"
                                name="model"
                                value={form.model}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Vendor *</label>
                            <input
                                type="text"
                                name="vendor"
                                value={form.vendor}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Quantity *</label>
                            <input
                                type="number"
                                min={1}
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div className="col-span-3">
                            <label className="block text-sm font-medium mb-1">Notes</label>
                            <textarea
                                name="notes"
                                rows={3}
                                value={form.notes}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg"
                            />
                        </div>

                        {form.type && (
                            <div className="col-span-3 mt-2 border border-gray-200 p-4 rounded">
                                <label className="block mb-2 font-medium">
                                    {form.type.toUpperCase()} Specifications
                                </label>
                                {renderAttributes()}
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
