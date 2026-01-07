import { CircleX, Cross, X, MoveLeft, ImagePlus } from "lucide-react";
import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/supabase-client";
import { getWarehouse } from "../../context/WarehouseContext";
import { InventoryCreate } from "../../context/InventoryContext"; // optional, if you have update context

export default function EditInventory() {
    const { id } = useParams(); // inventory id
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);

    const [customerId, setCustomerId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        warehouse_id: "",
        rack_id: "",
        status: "inactive",
        serial_no: "",
        type: "",
        model: "",
        vendor: "",
        start_unit: null,
        height: null,
        color: "#10b981",
        notes: "",
        attributes: {}
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [racks, setRacks] = useState([]);
    const [attributeFields, setAttributeFields] = useState([]);
    const [selectedRack, setSelectedRack] = useState(null);

    // Load warehouses and inventory data
    useEffect(() => {
        const loadData = async () => {
            const wh = await getWarehouse();
            setWarehouses(wh || []);

            const { data, error } = await supabase
                .from("inventorys")
                .select("*")
                .eq("id", id)
                .single();

            if (error) return console.error(error);

            setForm({
                ...form,
                name: data.name,
                warehouse_id: data.warehouse_id,
                rack_id: data.rack_id,
                status: data.status,
                serial_no: data.serial_no,
                type: data.type,
                model: data.model,
                vendor: data.vendor,
                start_unit: data.start_unit,
                height: data.height,
                color: data.color || "#10b981",
                notes: data.notes || "",
                attributes: data.attributes || {},
                image: data.image || null,
                customer_id: data.customer_id || null,
            });

            setCustomerId(data.customer_id || null);

            if (data.image) {
                const { data: { publicUrl } } = supabase.storage
                    .from("inventory-images")
                    .getPublicUrl(data.image)

                setImagePreview(publicUrl);
            }


            if (data.rack_id) setSelectedRack(data.rack_id);
        };
        loadData();
    }, [id]);

    // Load racks for selected warehouse
    useEffect(() => {
        const loadRacks = async () => {
            if (!form.warehouse_id) return setRacks([]);

            const { data, error } = await supabase
                .from("racks")
                .select("id, name, size_u")
                .eq("warehouse_id", form.warehouse_id)
                .order("name");

            if (error) return console.error(error);
            setRacks(data || []);
        };
        loadRacks();
    }, [form.warehouse_id]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (name === "rack_id") setSelectedRack(value || null);
    };

    // Handle dynamic attribute changes
    const handleAttrChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            attributes: { ...prev.attributes, [name]: value }
        }));
    };

    // Add custom attribute
    const addCustomAttribute = () => {
        const attrName = prompt("Enter attribute name:");
        if (!attrName) return;
        setAttributeFields(prev => [...prev, attrName]);
        setForm(prev => ({
            ...prev,
            attributes: { ...prev.attributes, [attrName]: "" }
        }));
    };

    // Default attributes by type
    const typeAttributes = {
        server: ["cpu", "ram", "storage"],
        switch: ["ports", "speed"],
        router: ["ip", "routing_protocol"]
    };

    const renderAttributes = () => {
        const typeKey = (form.type || "").toLowerCase();
        const defaults = typeAttributes[typeKey] || [];

        return (
            <div className="flex flex-col gap-2">
                <Button type="button" onClick={addCustomAttribute} className="bg-[#26599F] text-lg w-3xs mb-2">
                    + Add Custom Attribute
                </Button>

                <div className="grid grid-cols-3 gap-4 w-full">
                    {[...defaults, ...attributeFields].map(attr => (
                        <div key={attr} className="mb-2">
                            <label className="block text-sm font-medium mb-1">{attr.toUpperCase()}</label>
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

    // Handle image change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            alert("File type not allowed");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("File size exceeds 5MB");
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setForm(prev => ({ ...prev, image: null }));
    };

    // Validate start unit and height
    const validateRackUnits = async () => {
        if (!selectedRack) return true;

        const rackInfo = racks.find(r => r.id === form.rack_id);
        const maxU = rackInfo?.size_u || 42;

        if (form.start_unit < 1 || form.height < 1) {
            alert("Start unit and height must be at least 1");
            return false;
        }

        const newEnd = form.start_unit + form.height - 1;
        if (newEnd > maxU) {
            alert(`Height exceeds rack max units (${maxU})`);
            return false;
        }

        const { data: occupied } = await supabase
            .from("inventorys")
            .select("id, start_unit, height")
            .eq("rack_id", form.rack_id)
            .neq("id", id);

        for (let device of occupied) {
            const deviceStart = device.start_unit;
            const deviceEnd = device.start_unit + device.height - 1;

            const overlap =
                (form.start_unit >= deviceStart && form.start_unit <= deviceEnd) ||
                (newEnd >= deviceStart && newEnd <= deviceEnd) ||
                (form.start_unit <= deviceStart && newEnd >= deviceEnd);

            if (overlap) {
                alert(`This device overlaps with units ${deviceStart}-${deviceEnd}`);
                return false;
            }
        }

        return true;
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!(await validateRackUnits())) return;

        try {
            let imageUrl = form.image;

            if (imageFile) {
                const ext = imageFile.name.split(".").pop();
                const filename = `${crypto.randomUUID()}.${ext}`;
                const path = `inventory/${filename}`;
                const { data, error } = await supabase.storage
                    .from("inventory-images")
                    .upload(path, imageFile, { upsert: false });

                if (error) throw error;
                imageUrl = data.path;
            }

            const { data, error } = await supabase
                .from("inventorys")
                .update({
                    ...form,
                    warehouse_id: form.warehouse_id || null,
                    rack_id: form.rack_id || null,
                    start_unit: form.start_unit ?? null,
                    height: form.height ?? null,
                    notes: form.notes || null,
                    image: imageUrl, 
                    customer_id: form.customer_id || null
                })
                .eq("id", id);

            if (error) throw error;

            alert("Inventory updated successfully");
            navigate("/inventory");
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    // for fetch customer
    useEffect(() => {
        const fetchCustomers = async () => {
            const { data, error } = await supabase
                .from("customers")
                .select("id, company_name")
                .order("company_name");

            if (!error) setCustomers(data);
        };

        fetchCustomers();
    }, []);

    const handleCustomerChange = (e) => {
        setCustomerId(e.target.value || null);
        setForm(prev => ({
            ...prev, customer_id: e.target.value || null
        }))
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-sm flex items-center me-2"><MoveLeft /></Link>
                        <h1 className="font-bold text-[24px]">Edit Inventory</h1>
                    </div>
                    <Button type="submit" className="bg-[#26599F] text-lg">Update Inventory</Button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Image */}
                    <div className="col-span-3">
                        <div className="relative w-full">
                            {!imagePreview ? (
                                <label
                                    htmlFor="imageUpload"
                                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition hover:border-[#26599F] hover:bg-gray-50"
                                >
                                    <ImagePlus className="w-12 h-12 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Upload Image</span>
                                    <input id="imageUpload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            ) : (
                                <div className="relative">
                                    <img src={imagePreview} className="w-full h-40 object-cover rounded-lg" alt="" />
                                    <button
                                        type="button"
                                        onClick={() => { setImagePreview(null); setImageFile(null); }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="col-span-9">
                        <div className="grid grid-cols-3 gap-2 gap-y-2">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900">Device Name <span className="text-red-500">*</span></label>
                                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Device01" className="w-full p-2.5 border border-gray-300 rounded-lg" />
                            </div>

                            {/* Warehouse */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900">Warehouse <span className="text-red-500">*</span></label>
                                <select name="warehouse_id" value={form.warehouse_id} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg">
                                    <option value="">No Warehouse</option>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>

                            {/* Rack */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900">Rack</label>
                                <select name="rack_id" value={form.rack_id} onChange={handleChange} disabled={!form.warehouse_id || racks.length === 0} className="w-full p-2.5 border border-gray-300 rounded-lg">
                                    <option value="">{form.warehouse_id ? "Select rack" : "No Rack"}</option>
                                    {racks.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900">Status <span className="text-red-500">*</span></label>
                                <select name="status" value={form.status} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="sold">Sold</option>
                                </select>
                            </div>

                            {/* Serial No */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900">Serial No</label>
                                <input type="text" name="serial_no" value={form.serial_no} onChange={handleChange} placeholder="Serial01" className="w-full p-2.5 border border-gray-300 rounded-lg" />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900">Type <span className="text-red-500">*</span></label>
                                <select name="type" value={form.type} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg">
                                    <option value="">Select Type</option>
                                    <option value="server">Server</option>
                                    <option value="switch">Switch</option>
                                    <option value="router">Router</option>
                                </select>
                            </div>

                            {/* Model */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900">Model <span className="text-red-500">*</span></label>
                                <input type="text" name="model" value={form.model} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg" />
                            </div>

                            {/* Vendor */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900">Vendor <span className="text-red-500">*</span></label>
                                <input type="text" name="vendor" value={form.vendor} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg" />
                            </div>

                            {/* Start Unit */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900">Start Unit</label>
                                <input type="number" name="start_unit" value={form.start_unit ?? ""} onChange={e => setForm(prev => ({ ...prev, start_unit: e.target.value === "" ? null : Number(e.target.value) }))} min={1} disabled={!selectedRack} className="w-full p-2.5 border border-gray-300 rounded-lg" placeholder={selectedRack ? "Enter start unit" : "Disabled without rack"} />
                            </div>

                            {/* Height */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900">Height (U)</label>
                                <input type="number" name="height" value={form.height ?? ""} onChange={e => setForm(prev => ({ ...prev, height: e.target.value === "" ? null : Number(e.target.value) }))} min={1} disabled={!selectedRack} className="w-full p-2.5 border border-gray-300 rounded-lg" placeholder={selectedRack ? "Enter height" : "Disabled without rack"} />
                            </div>

                            {form.status === "sold" && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-900">
                                        Customer
                                    </label>
                                    <select
                                        value={customerId || ""}
                                        onChange={handleCustomerChange}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                                    >
                                        <option value="">Select Customer</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.company_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}


                            {/* Color */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900">Color</label>
                                <input type="color" name="color" value={form.color} onChange={handleChange} className="p-2 h-11.5 border border-gray-300 rounded-lg cursor-pointer" />
                            </div>


                        </div>

                        {/* Notes */}
                        <div className="mt-2">
                            <label className="block mb-2 text-gray-900 text-sm font-medium">Notes</label>
                            <textarea name="notes" rows={3} value={form.notes} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg" placeholder="Description" />
                        </div>

                        {/* Attributes */}
                        {form.type && (
                            <div className="mt-2">
                                <label className="block mb-2 text-gray-900 text-sm font-medium">{form.type} Specification</label>
                                <div className="border border-gray-200 px-2 py-4 rounded">{renderAttributes()}</div>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
