import { CircleX, Cross, X } from "lucide-react";
import { FloatingLabel, Textarea, Button } from "flowbite-react";
import { createRegion } from "../../context/RegionContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomer } from "../../context/CustomerContext";
import { supabase } from "../../../supabase/supabase-client";

export default function AddCustomer({ onClose, inventoryId, onAdd }) {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");

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
    const handleSubmit = async(e) => {
        e.preventDefault();

        if(!selectedCustomerId) {
            alert("Please select a customer");
            return;
        }

        const {data, error} = await supabase
        .from("inventorys")
        .update({
            status: "sold", 
            customer_id: selectedCustomerId, 
        })
        .eq("id", inventoryId)

        onAdd();
        onClose();

        if(error) {
            alert("Error updating inventory:"+ error.message);
        }else {
            alert("Inventory Sold Successfully!");
            onClose();
        }
    }

    useEffect(() => {
        fetchCustomer();
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">

            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

            <div className="relative z-10 bg-white backdrop-blur-md w-[600px] rounded-lg shadow-xl rounded-md">
                <div className="flex items-center justify-between border-b border-gray-200 p-4 rounded-t-md">
                    <h1 className="text-xl font-bold">Add Customer</h1>
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

                    <Button
                        type="submit"
                        className="w-full bg-[#26599F] text-lg"
                    >
                        Add
                    </Button>
                </form>
            </div>

        </div>
    )
}