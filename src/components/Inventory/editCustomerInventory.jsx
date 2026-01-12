import { CircleX, Cross, X } from "lucide-react";
import { FloatingLabel, Textarea, Button, Spinner } from "flowbite-react";
import { createRegion } from "../../context/RegionContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomer } from "../../context/CustomerContext";
import { supabase } from "../../../supabase/supabase-client";

export default function EditCustomerInventory({ onClose, customerinventory, onUpdate }) {

    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(
        customerinventory.customer_id
    );
    const [soldQuantity, setSoldQuantity] = useState(
        customerinventory.quantity
    );

    const [notes, setNotes] = useState(
        customerinventory.notes || ""
    );

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        contact_person: "",
        contact_email: "",
        contact_number: "",
        address: ""
    })
    // for fetch customer
    useEffect(() => {
        const fetchCustomer = async () => {
            const data = await getCustomer();
            setCustomers(data);

            const customer = data.find(
                (c) => c.id === customerinventory.customer_id
            );

            if (customer) {
                setForm({
                    contact_person: customer.contact_person || "",
                    contact_email: customer.contact_email || "",
                    contact_number: customer.contact_number || "",
                    address: customer.address || "",
                });
            }
        };

        fetchCustomer();
    }, [customerinventory.customer_id])

    const handleCustomerChange = (e) => {
        const id = e.target.value;
        setSelectedCustomerId(id);

        const customer = customers.find((c) => c.id === id);

        if (!customer) return;

        setForm({
            contact_person: customer.contact_person || "",
            contact_email: customer.contact_email || "",
            contact_number: customer.contact_number || "",
            address: customer.address || "",
        });
    }

    // submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try{
            const inventoryId = customerinventory.inventory_id;
            const oldQty = customerinventory.quantity;
            const newQty = soldQuantity;
            const diff = newQty - oldQty;

            if(newQty < 1) {
                alert("Quantity must be at least 1");
                return;
            }

            //fetch inventory
            const {data: inventory, error: invErr} = await supabase
                .from("inventorys")
                .select("quantity, status")
                .eq("id", inventoryId)
                .single();

            if(invErr || !inventory) {
                alert("Inventory not found");
                return;
            }

            if(inventory.quantity - diff < 0) {
                alert(
                    `Not enough stock . Available: ${inventory.quantity + oldQty}`
                );

                return;
            }

            // update inventory (difference only)
            await supabase
            .from('inventorys')
            .update({
                quantity: inventory.quantity - diff, 
                status: 
                    inventory.quantity - diff <=0 
                        ? "Out of Stock"
                        : "Active",
            })
            .eq("id", inventoryId);

            // udpate customer sale
            await supabase
                .from("customer_sales")
                .update({
                    customer_id: selectedCustomerId, 
                    quantity: newQty, 
                    notes: notes, 
                })
                .eq('id', customerinventory.id);

                alert("Sale updated Successfully");
                onUpdate();
                onClose();
        }catch(error){
            console.error(error); 
            alert("Something went wrong");
        }finally {
            setLoading(false);
        }
    };


   

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">

            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

            <div className="relative z-10 bg-white backdrop-blur-md w-[600px] max-h-[90vh] overflow-y-auto rounded-lg shadow-xl rounded-md">
                <div className="flex items-center justify-between border-b border-gray-200 p-4 rounded-t-md">
                    <h1 className="text-xl font-bold">Edit Customer Inventory</h1>
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
                        {loading ? "Updating..." : "Update"}
                    </Button>
                </form>
            </div>

        </div>
    )
}