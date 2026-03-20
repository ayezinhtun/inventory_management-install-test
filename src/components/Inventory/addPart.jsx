import { useEffect, useState } from "react";
import { X, ImagePlus, MoveLeft } from "lucide-react";
import { Button, Spinner } from "flowbite-react";
import { Link } from "react-router-dom";
import { getWarehouse } from "../../context/WarehouseContext";
import { getRegion } from "../../context/RegionContext";
import { supabase } from "../../../supabase/supabase-client";
import { InventoryCreate } from "../../context/InventoryContext";
import AppToast from "../toast/Toast";
import { getInventoryTypes } from "../../context/TypeContext";

export default function CreatePart() {
    const [toast, setToast] = useState(null);

    const [imagePreview, setImagePreview] = useState(null);

    const [imageFile, setImageFile] = useState(null);

    const [regions, setRegions] = useState([]);

    const [warehouses, setWarehouses] = useState([]);

    const [types, setTypes] = useState([]);

    const [typeSpecs, setTypeSpecs] = useState([]);

    const [existingInventory, setExistingInventory] = useState([]);

    const [showNameDropdown, setShowNameDropdown] = useState(false);

    const [partInventory, setPartInventory] = useState([]);
    const [error, setError] = useState(null);

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        region_id: "",
        warehouse_id: "",
        status: "working",
        serial_no: "",
        type: "",
        model: "",
        vendor: "",
        notes: "",
        attributes: {},
        quantity: 1
    });

    useEffect(() => {
        const loadTypes = async () => {
            try {
                const data = await getInventoryTypes();
                setTypes(data || []);
            } catch (error) {
                console.error('Failed to load types:', error);
            }
        };
        loadTypes();
    }, []);

    useEffect(() => {
        const loadExistingInventoryByType = async () => {
            if (!form.type) {
                setExistingInventory([]);
                return;
            }

            const { data, error } = await supabase
                .from('inventorys')
                .select('id, name, type, region_id, warehouse_id, status, serial_no, model, vendor, notes, attributes, image')
                .eq('type', (form.type || "").toLowerCase())
                .order('name');

            if (error) {
                console.error(error);
                setExistingInventory([]);
                return;
            }

            setExistingInventory(data || []);
        };

        loadExistingInventoryByType();
    }, [form.type]);


    const handleNameSuggestionClick = (inv) => {
        setForm((prev) => ({
            ...prev,
            name: inv?.name || "",
            region_id: inv?.region_id || "",
            warehouse_id: inv?.warehouse_id || "",
            status: inv?.status || "working",
            serial_no: inv?.serial_no || "",
            model: inv?.model || "",
            vendor: inv?.vendor || "",
            notes: inv?.notes || "",
            attributes: inv?.attributes || {},
            quantity: prev.quantity
        }));

        //load image if exists
        if (inv?.image) {
            setImagePreview(`https://mlozugcajyiygdgtzbnk.supabase.co/storage/v1/object/public/inventory-images/${inv.image}`);
        }

        const chosenType = (inv?.type || form.type || "").toLowerCase();
        if (chosenType) {
            const t = types.find((x) => x.name?.toLowerCase() === chosenType);
            setTypeSpecs(t ? (Array.isArray(t.specifications) ? t.specifications : []) : []);
        }

        setShowNameDropdown(false);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({ ...prev, [name]: value }))

        if (name === "name") {
            setShowNameDropdown(value.length > 0);
        }
    }

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



    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // to validate type
        const validateType = ["image/jpeg", "image/png", "image/jpg"];

        if (!validateType.includes(file.type)) {
            setToast({
                type: "error",
                message: "File extention is not allowed!"
            })
            setImagePreview(null);
            e.target.value(null);
            setImageFile(null);
            return;
        }

        // to validate file size 
        const validateFilesize = 5 * 1024 * 1024;

        if (file.size > validateFilesize) {
            setToast({
                type: "error",
                message: "Only under 5MB are allowed!"
            })
            setImagePreview(null);
            e.target.value(null);
            setImageFile(null);
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    const renderAttributes = () => {
        return (
            <div className="grid grid-cols-3 gap-4 w-full">
                {typeSpecs.map((attr, index) => (
                    <div key={index}>
                        <label className="block text-sm font-medium mb-1">
                            {attr.toUpperCase()}
                        </label>
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
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError(null);
        setLoading(true);

        try {
            // Get the selected type to get its name
            const selectedType = types.find(t => t.name === form.type);

            const { data: existing, error: fetchError } = await supabase
                .from("inventorys")
                .select("id, quantity, name, type, model, vendor, attributes, region_id, warehouse_id, serial_no, notes, status")
                .eq("name", (form.name || "").trim())
                .eq("type", (form.type || "").toLowerCase())
                .eq("model", (form.model || "").trim())
                .eq("vendor", (form.vendor || "").trim())
                .eq("region_id", form.region_id || null)
                .eq("warehouse_id", form.warehouse_id || null)
                .eq("serial_no", (form.serial_no || "").trim())
                .eq("notes", (form.notes || "").trim())
                .eq("status", form.status)
                .limit(1)
                .maybeSingle();

            if (fetchError) throw fetchError;

            // If exact match exists (all fields same except quantity), update quantity
            if (existing?.id) {
                const addQty = Number(form.quantity || 1);
                const nextQty = Number(existing.quantity || 0) + addQty;

                const { error: updateError } = await supabase
                    .from("inventorys")
                    .update({ quantity: nextQty })
                    .eq("id", existing.id);

                if (updateError) throw updateError;

                setToast({
                    type: "success",
                    message: "Stock quantity updated successfully."
                });

                // Reset form
                setForm({
                    name: "",
                    region_id: "",
                    warehouse_id: "",
                    status: "working",
                    serial_no: "",
                    type: "",
                    model: "",
                    vendor: "",
                    notes: "",
                    attributes: {},
                    quantity: 1
                });

                setTypeSpecs([]);
                setImagePreview(null);
                setImageFile(null);
                return; 
            }

            // Upload image if provided
            let imageUrl = null;
            if (imageFile) {
                const ext = imageFile.name.split(".").pop();
                const filename = `${crypto.randomUUID()}.${ext}`;
                const path = `inventory/${filename}`;
                const { data, error } = await supabase.storage
                    .from("inventory-images")
                    .upload(path, imageFile, { upsert: false });
                if (error) {
                    setToast({
                        type: "error",
                        message: `Image upload failed: ${error.message}`
                    })
                    return;
                }
                imageUrl = data.path;
            }

            // Submit via your context function
            await InventoryCreate({
                ...form,
                type: form.type.toLowerCase(),
                region_id: form.region_id || null,
                warehouse_id: form.warehouse_id || null,
                notes: form.notes || null,
                image: imageUrl,
            });
            setToast({
                type: "success",
                message: "Component added successfully!"
            })
            setForm({
                name: "",
                region_id: "",
                warehouse_id: "",
                status: "working",
                serial_no: "",
                type: "",
                model: "",
                vendor: "",
                notes: "",
                attributes: {},
                quantity: 1
            });

            setImagePreview(null);
            setImageFile(null);
        } catch (err) {
            console.log(err.message);
            setToast({
                type: "error",
                message: err.message || "Failed to create component"
            });
        } finally {
            setLoading(false)
        }
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
    }, [form.region_id]);

    return (
        <div>
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
                        {loading && (
                            <div className="fixed inset-0 flex justify-center items-center ">
                                <Spinner
                                    aria-level="Loading..."
                                    size="xl"
                                    color="info"
                                />
                            </div>
                        )}
                        {loading ? "Saving..." : "Add Component"}
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
                            <label className="block text-sm font-medium mb-1">Type <span className="text-red-500">*</span></label>
                            <select
                                name="type"
                                value={form.type}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setForm(prev => ({ ...prev, type: value }));

                                    // Load specifications for selected type
                                    const type = types.find(t => t.name.toLowerCase() === value.toLowerCase());
                                    if (type) {
                                        setTypeSpecs(Array.isArray(type.specifications) ? type.specifications : []);
                                    } else {
                                        setTypeSpecs([]);
                                    }
                                }}
                                required
                                className="w-full p-2.5 border border-gray-300 rounded-lg"
                            >
                                <option value="">Select Type</option>
                                {types.map((type) => (
                                    <option key={type.id} value={type.name.toLowerCase()}>
                                        {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="w-full p-2.5 border border-gray-300 rounded-lg"
                                onFocus={() => setShowNameDropdown(form.name.length > 0)}
                                onBlur={() => setTimeout(() => setShowNameDropdown(false), 200)}
                            />

                            {showNameDropdown && (
                                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto">
                                    {existingInventory
                                        .filter((inv) => (inv.name || "").toLowerCase().startsWith((form.name || "").toLowerCase()))
                                        .slice(0, 8)
                                        .map((inv) => (
                                            <div
                                                key={inv.id}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => handleNameSuggestionClick(inv)}
                                            >
                                                {inv.name}
                                            </div>
                                        ))}
                                </div>
                            )}
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
                            <select name="region_id" id="" value={form.region_id} onChange={handleChange} required
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
                            <select name="warehouse_id" id="" value={form.warehouse_id} onChange={handleChange} required
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
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Status <span className="text-red-500">*</span></label>
                            <select name="status" value={form.status} onChange={handleChange} id=""
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            >
                                <option value="working">Working</option>
                                <option value="broken">Broken</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Model <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="model"
                                value={form.model}
                                onChange={handleChange}
                                required
                                className="w-full p-2.5 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Vendor <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="vendor"
                                value={form.vendor}
                                onChange={handleChange}
                                required
                                className="w-full p-2.5 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Quantity <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                min={1}
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                required
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

                        {typeSpecs.length > 0 && (
                            <div className="col-span-3 mt-2 border border-gray-200 p-4 rounded">
                                <label className="block mb-2 font-medium">
                                    Specifications
                                </label>
                                {renderAttributes()}
                            </div>
                        )}
                    </div>
                </div>
            </form>

            {toast && (
                <div className="fixed top-5 right-5 z-50">
                    <AppToast
                        type={toast.type}
                        message={toast.message}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}
        </div>
    );
}