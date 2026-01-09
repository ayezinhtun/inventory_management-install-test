import { useEffect, useState } from "react";
import { X, ImagePlus, MoveLeft } from "lucide-react";
import { Button, Spinner } from "flowbite-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/supabase-client";
import { getRegion } from "../../context/RegionContext";

export default function EditPart() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        type: "",
        serial_no: "",
        region_id: "",
        warehouse_id: "",
        status: "inactive",
        model: "",
        vendor: "",
        quantity: 1,
        notes: "",
        attributes: {}
    });
    const [regions, setRegions] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [attributeFields, setAttributeFields] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const typeAttributes = {
        ram: ["capacity", "speed", "form_factor"],
        cpu: ["cores", "threads", "frequency", "socket"],
        ssd: ["capacity", "interface", "form_factor"]
    };

    // Load existing inventory
    useEffect(() => {
        const loadInventory = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("inventorys")
                .select("*")
                .eq("id", id)
                .single();
            if (error) {
                console.error(error);
                setLoading(false);
                return;
            }

            setForm(prev => ({
                ...prev,
                name: data.name,
                type: data.type,
                serial_no: data.serial_no,
                region_id: data.region_id,
                warehouse_id: data.warehouse_id,
                status: data.status,
                model: data.model,
                vendor: data.vendor,
                quantity: data.quantity || 1,
                notes: data.notes || "",
                attributes: data.attributes || {}
            }));

            if (data.image) {
                const { data: { publicUrl } } = supabase.storage
                    .from("inventory-images")
                    .getPublicUrl(data.image);
                setImagePreview(publicUrl);
            }

            setLoading(false);
        };
        loadInventory();
    }, [id]);

    // Load regions
    useEffect(() => {
        const loadRegion = async () => {
            const data = await getRegion();
            setRegions(data || []);
        };
        loadRegion();
    }, []);

    // Load warehouses for selected region
    useEffect(() => {
        const loadWh = async () => {
            if (!form.region_id) {
                setWarehouses([]);
                setForm(prev => ({ ...prev, warehouse_id: "" }));
                return;
            }

            const { data, error } = await supabase
                .from("warehouses")
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

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAttrChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            attributes: { ...prev.attributes, [name]: value }
        }));
    };

    const addCustomAttribute = () => {
        const attrName = prompt("Enter attribute name:");
        if (!attrName) return;
        setAttributeFields(prev => [...prev, attrName]);
        setForm(prev => ({
            ...prev,
            attributes: { ...prev.attributes, [attrName]: "" }
        }));
    };

    const handleImageChange = e => {
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
    };

    const renderAttributes = () => {
        const typeKey = (form.type || "").toLowerCase();
        const defaults = typeAttributes[typeKey] || [];
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
                    {[...defaults, ...attributeFields].map(attr => (
                        <div key={attr}>
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

    const handleSubmit = async e => {
        e.preventDefault();

        setLoading(true);

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
                    region_id: form.region_id || null,
                    warehouse_id: form.warehouse_id || null,
                    notes: form.notes || null,
                    image: imageUrl
                })
                .eq("id", id);

            if (error) throw error;

            alert("Component updated successfully");
            navigate("/inventory");
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex justify-center items-center ">
                <Spinner
                    aria-level="Loading..."
                    size="xl"
                    color="info"
                />
            </div>
        )
    }
    return (
        <div className="p-6">
            <form onSubmit={handleSubmit}>
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-sm flex items-center me-2">
                            <MoveLeft />
                        </Link>
                        <h1 className="font-bold text-[24px]">Edit Component</h1>
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
                        {loading ? "Updating..." : "Update Component"}
                    </Button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Image Upload */}
                    <div className="col-span-3">
                        {!imagePreview ? (
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#26599F] hover:bg-gray-50">
                                <ImagePlus className="w-12 h-12 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Upload Image</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        ) : (
                            <div className="relative">
                                <img src={imagePreview} className="w-full h-40 object-cover rounded-lg" alt="" />
                                <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="col-span-9 grid grid-cols-3 gap-4">
                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-900">
                                Type <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="type"
                                value={form.type.toUpperCase()}
                                readOnly
                                className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </div>


                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Name *</label>
                            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg" />
                        </div>

                        {/* Serial No */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Serial No</label>
                            <input type="text" name="serial_no" value={form.serial_no} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg" />
                        </div>

                        {/* Region */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Region *</label>
                            <select name="region_id" value={form.region_id} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg">
                                <option value="">No Region</option>
                                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>

                        {/* Warehouse */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Warehouse *</label>
                            <select name="warehouse_id" value={form.warehouse_id} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg">
                                <option value="">No Warehouse</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Status *</label>
                            <select name="status" value={form.status} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="sold">Sold</option>
                            </select>
                        </div>

                        {/* Model */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Model *</label>
                            <input type="text" name="model" value={form.model} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg" />
                        </div>

                        {/* Vendor */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Vendor *</label>
                            <input type="text" name="vendor" value={form.vendor} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg" />
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Quantity *</label>
                            <input type="number" name="quantity" min={1} value={form.quantity} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg" />
                        </div>

                        {/* Notes */}
                        <div className="col-span-3">
                            <label className="block text-sm font-medium mb-1">Notes</label>
                            <textarea name="notes" rows={3} value={form.notes} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg" />
                        </div>

                        {/* Attributes */}
                        {form.type && (
                            <div className="col-span-3 mt-2 border border-gray-200 p-4 rounded">
                                <label className="block mb-2 font-medium">{form.type.toUpperCase()} Specifications</label>
                                {renderAttributes()}
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
