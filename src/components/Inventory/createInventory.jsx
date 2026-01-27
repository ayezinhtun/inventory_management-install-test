import { CircleX, Cross, Warehouse, X } from "lucide-react";
import { FloatingLabel, Textarea, Button, Spinner } from "flowbite-react";
import { ImagePlus, MoveLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabase/supabase-client";
import { InventoryCreate } from "../../context/InventoryContext";
import { useNavigate } from "react-router-dom";
import { getWarehouse } from "../../context/WarehouseContext";
import { getRegion } from "../../context/RegionContext";
import AppToast from "../toast/Toast";

export default function CreateInventory() {
    const [toast, setToast] = useState(null);

    const navigate = useNavigate();

    const [imagePreview, setImagePreview] = useState(null);

    const [imageFile, setImageFile] = useState(null);

    const [regions, setRegions] = useState([]);

    const [warehouses, setWarehouses] = useState([]);

    const [racks, setRacks] = useState([]);

    const [attributeFields, setAttributeFields] = useState([]);

    const [selectedRack, setSelectedRack] = useState(null);

    const [error, setError] = useState(null);

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        region_id: "",
        warehouse_id: "",
        rack_id: "",
        status: "active",
        serial_no: "",
        type: "",
        model: "",
        vendor: "",
        start_unit: null,
        height: null,
        color: "#10b981",
        notes: "",
        attributes: {},
        quantity: 1
    });

    useEffect(() => {
        const loadRegion = async () => {
            const data = await getRegion();
            setRegions(data || []);
        };
        loadRegion();
    }, []);

    // useEffect(() => {
    //     const loadWh = async () => {
    //         const data = await getWarehouse();
    //         setWarehouses(data || []);
    //     };
    //     loadWh();
    // }, []);

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

    useEffect(() => {
        const loadRacks = async () => {
            if (!form.warehouse_id) {
                setRacks([]);
                setForm((prev) => ({ ...prev, rack_id: "" }));
                return;
            }

            const { data, error } = await supabase
                .from('racks')
                .select("id, name, warehouse_id, size_u")
                .eq("warehouse_id", form.warehouse_id)
                .order("name");

            if (error) {
                console.error(error);
                setRacks([]);
            } else {
                setRacks(data || [])
            }
        };

        loadRacks();
    }, [form.warehouse_id]);


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

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({ ...prev, [name]: value }))

        if (name === "rack_id") {
            setSelectedRack(value || null);
        }
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
        server: {
            max_ram_slots: { type: "number", required: true, min: 1 },
            max_cpu_slots: { type: "number", required: true, min: 1 },
            max_storage_slots: { type: "number", required: true, min: 1 },
        },
        switch: {
            ports: { type: "number", required: true, min: 1 },
            speed: { type: "number", required: true, min: 1 }, // can be Mbps/Gbps
        },
        router: {
            ip: { type: "ip", required: true },
            routing_protocol: { type: "text", required: true },
        }
    };

    const renderAttributes = () => {
        const typeKey = (form.type || "").toLowerCase();
        const defaults = Object.keys(typeAttributes[typeKey] || {});

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


    const handleSubmit = async (e) => {
        e.preventDefault();

        setError(null);

        setLoading(true);

        try {

            const typeKey = form.type.toLowerCase();
            const validations = typeAttributes[typeKey] || {};

            for (const [attr, rules] of Object.entries(validations)) {
                const value = form.attributes[attr];

                if (rules.required && (value === undefined || value === "")) {
                    setToast({
                        type: "error",
                        message: `${attr.toUpperCase()} is required`
                    })
                    setLoading(false);
                    return;
                }

                if (rules.type === "number" && isNaN(Number(value))) {
                    setToast({
                        type: "error",
                        message: `${attr.toUpperCase()} must be a number`
                    })
                    setLoading(false);
                    return;
                }

                if (rules.type === "number" && rules.min && Number(value) < rules.min) {
                    setToast({
                        type: "error",
                        message: `${attr.toUpperCase()} must be at least ${rules.min} `
                    })
                    setLoading(false);
                    return;
                }

                if (rules.type === "ip") {
                    const ipRegex =
                        /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
                    if (!ipRegex.test(value)) {
                        setToast({
                            type: "error",
                            message: `${attr.toUpperCase()} is not a valid IP address`
                        })
                        setLoading(false);
                        return;
                    }
                }

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

            // Check if name is unique before creating
            const { data: existing, error: fetchError } = await supabase
                .from("inventorys")
                .select("id")
                .eq("name", form.name)
                .limit(1)
                .single();

            if (existing) {
                // Name already exists
                setToast({
                    type: "error",
                    message: "This inventory name already exists. Please choose a different name."
                })
                return;
            }

            //  Check rack capacity
            if (selectedRack) {
                const rackInfo = racks.find((r) => r.id === form.rack_id);
                const maxU = rackInfo?.size_u || 42;

                if (form.start_unit < 1 || form.height < 1) {
                    setToast({
                        type: "error",
                        message: "Start unit and height must be at least 1!"
                    })
                    return;
                }

                const newEnd = form.start_unit + form.height - 1;
                if (newEnd > maxU) {
                    setToast({
                        type: "error",
                        message: `The device height exceeds rack capacity. Max unit in this rack is ${maxU}`
                    })
                    return;
                }

                //  Check overlapping units
                const { data: occupied } = await supabase
                    .from("inventorys")
                    .select("start_unit, height")
                    .eq("rack_id", form.rack_id);

                for (let device of occupied) {
                    const deviceStart = device.start_unit;
                    const deviceEnd = device.start_unit + device.height - 1;

                    const overlap =
                        (form.start_unit >= deviceStart && form.start_unit <= deviceEnd) ||
                        (newEnd >= deviceStart && newEnd <= deviceEnd) ||
                        (form.start_unit <= deviceStart && newEnd >= deviceEnd);

                    if (overlap) {
                        setToast({
                            type: "error",
                            message: `This device overlaps with an existing device at units ${deviceStart}-${deviceEnd}.`
                        })

                        return;
                    }
                }
            }

            // Submit via your context function
            await InventoryCreate({
                ...form,
                region_id: form.region_id || null,
                warehouse_id: form.warehouse_id || null,
                rack_id: form.rack_id || null,
                start_unit: form.start_unit ?? null,
                height: form.height ?? null,
                notes: form.notes || null,
                image: imageUrl,
            });
            setToast({
                type: "success",
                message: "Inventory added successfully!"
            })
            setForm({
                name: "",
                region_id: "",
                warehouse_id: "",
                rack_id: "",
                status: "active",
                serial_no: "",
                type: "",
                model: "",
                vendor: "",
                start_unit: null,
                height: null,
                color: "#10b981",
                notes: "",
                attributes: {},
                quantity: 1
            });

            setImagePreview(null);
            setImageFile(null);
        } catch (err) {
            console.log(err.message)
        } finally {
            setLoading(false);
        }
    };


    return (
        <div>
            <form action="" onSubmit={handleSubmit}>
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-sm flex items-center me-2"><MoveLeft /></Link>
                        <h1 className="font-bold text-[24px]">Add Inventory</h1>
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
                        {loading ? "Saving..." : "Add Inventory"}
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
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Type <span className="text-red-500">*</span></label>
                                <select name="type" value={form.type} onChange={handleChange} id=""
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="server">Server</option>
                                    <option value="switch">Switch</option>
                                    <option value="router">Router</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Device Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Device01"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Region <span className="text-red-500">*</span></label>
                                <select name="region_id" id="" value={form.region_id} onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                    required
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
                                    required
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
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Rack</label>
                                <select name="rack_id" id="" value={form.rack_id} onChange={handleChange} disabled={!form.warehouse_id || racks.length === 0}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                >
                                    <option value="">
                                        {form.warehouse_id ? "Selecct rack" : "No Rack"}
                                    </option>
                                    {racks.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Status <span className="text-red-500">*</span></label>
                                <select name="status" value={form.status} onChange={handleChange} id=""
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>


                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Serial No </label>
                                <input
                                    type="text"
                                    name="serial_no"
                                    value={form.serial_no}
                                    onChange={handleChange}
                                    placeholder="Serial01"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Model <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="model"
                                    value={form.model}
                                    onChange={handleChange}
                                    placeholder="Model01"
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Vendor <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="vendor"
                                    value={form.vendor}
                                    onChange={handleChange}
                                    placeholder="Vendor01"
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Start Unit</label>
                                <input
                                    name="start_unit"
                                    type="number"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                                    value={form.start_unit ?? ""}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            start_unit:
                                                e.target.value === "" ? null : Number(e.target.value),
                                        }))
                                    }
                                    min={1}
                                    required={!!selectedRack}
                                    placeholder={selectedRack ? "Enter Start Unit" : "Disabled without rack"}
                                    disabled={!selectedRack}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900">
                                    Height (U)
                                </label>
                                <input
                                    name="height"
                                    type="number"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                                    value={form.height ?? ""}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            height:
                                                e.target.value === "" ? null : Number(e.target.value),
                                        }))
                                    }
                                    min={1}
                                    required={!!selectedRack}
                                    placeholder={selectedRack ? "Enter height" : "Disabled without rack"}
                                    disabled={!selectedRack}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900">
                                    Color
                                </label>
                                <input
                                    name="color"
                                    type="color"
                                    className="p-2 h-11.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500 cursor-pointer"
                                    value={form.color}
                                    onChange={handleChange}

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
                                            value={form.notes}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {form.type && (
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
    )
}