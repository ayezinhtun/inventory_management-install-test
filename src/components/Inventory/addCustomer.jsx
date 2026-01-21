import { CircleX, Cross, X } from "lucide-react";
import { FloatingLabel, Textarea, Button, Spinner } from "flowbite-react";
import { createRegion } from "../../context/RegionContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomer } from "../../context/CustomerContext";
import { supabase } from "../../../supabase/supabase-client";

export default function AddCustomer({ onClose, inventoryId, onAdd, setToast }) {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [soldQuantity, setSoldQuantity] = useState(1);
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        contact_person: "",
        contact_email: "",
        contact_number: "",
        address: ""
    })
    // for fetch customer
    const fetchCustomer = async () => {
        try {
            const data = await getCustomer();
            setCustomers(data);
        } catch (error) {
            console.log("Error fetching customer", error);
        }
    }

    const handleCustomerChange = (e) => {
        const id = e.target.value;
        setSelectedCustomerId(id);

        const customer = customers.find((c) => c.id === id);

        if (customer) {
            setForm({
                contact_person: customer.contact_person || "",
                contact_email: customer.contact_email || "",
                contact_number: customer.contact_number || "",
                address: customer.address || ""
            });
        } else {
            setForm({
                contact_person: "",
                contact_email: "",
                contact_number: "",
                address: ""
            })
        }
    }

    // submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        if (!selectedCustomerId) {
            setToast({
                type: "error",
                message: "Please select a customer!"
            })

            return;
        }

        if (soldQuantity < 1) {
            setToast({
                type: "error",
                message: "Quantity must be at least 1"
            })
            return;
        }

        try {
            // fetch current inventory
            const { data: inventoryData, error: fetchError } = await supabase
                .from('inventorys')
                .select('*')
                .eq('id', inventoryId)
                .single();

            if (fetchError || !inventoryData) {
                setToast({
                    type: "error",
                    message: "Errorr fetching inventory!"
                })

                return;
            }

            if (inventoryData.quantity < soldQuantity) {
                setToast({
                    type: "error",
                    message: `Not enough stock! Available: ${inventoryData.quantity}`
                })

                return;
            }

            // update inventory quantity and status
            const { data: updatedInventory, error: updateError } = await supabase
                .from("inventorys")
                .update({
                    quantity: inventoryData.quantity - soldQuantity,
                    status: inventoryData.quantity - soldQuantity <= 0 ? "Out of Stock" : inventoryData.status,
                    rack_id: null,
                    start_unit: null,
                    height: null
                })
                .eq("id", inventoryId)
                .select()
                .single();

            if (updateError) {
                setToast({
                    type: "error",
                    message: "Failed updating Inventory!"
                })

                return;
            }

            // insert into customer_sales
            const { error: saleError } = await supabase
                .from("customer_sales")
                .insert({
                    inventory_id: inventoryId,
                    customer_id: selectedCustomerId,
                    quantity: soldQuantity,
                    notes: notes
                });

            if (saleError) {
                setToast({
                    type: "error",
                    message: "Error recording sale!"
                })

                return;
            }

            setToast({
                type: "error",
                message: "Inventory sold successfully!"
            })

            onAdd();
            onClose();
        } catch (err) {
            console.log(err);
            setToast({
                type: "error",
                message: "Something went wrong?!"
            })

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomer();
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">

            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

            <div className="relative z-10 bg-white backdrop-blur-md w-[600px] max-h-[90vh] overflow-y-auto rounded-lg shadow-xl rounded-md">
                <div className="flex items-center justify-between border-b border-gray-200 p-4 rounded-t-md">
                    <h1 className="text-xl font-bold">Add Inventory Customer</h1>
                    <X onClick={onClose} className="w-6 h-6 text-gray-600 cursor-pointer hover:text-red-500" />
                </div>
                <form className="p-6" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Customer</label>
                        <select
                            id=""
                            value={selectedCustomerId}
                            onChange={handleCustomerChange}
                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                        >
                            <option value="">
                                Company Name
                            </option>

                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.company_name}
                                </option>
                            ))}

                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Contact Person <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="contact_person"
                                value={form.contact_person}
                                readOnly
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Contact Email <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="contact_email"
                                value={form.contact_email}
                                readOnly
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Contact Number <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="contact_number"
                            value={form.contact_number}
                            readOnly
                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Address <span className="text-red-500">*</span></label>
                        <textarea
                            name="address"
                            value={form.address}
                            readOnly
                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Quantity</label>
                        <input
                            type="number"
                            min={1}
                            value={soldQuantity}
                            onChange={(e) => setSoldQuantity(parseInt(e.target.value))}
                            className="w-ful p-2.5 border border-gray-300 rounded-lg text-gray-700"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Note</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add Notes"
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-700"
                        />

                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#26599F] text-lg"
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
                        {loading ? "Saving..." : "Sell"}
                    </Button>
                </form>
            </div>

        </div>
    )
}