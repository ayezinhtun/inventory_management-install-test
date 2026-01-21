import { CircleX, Cross, X } from "lucide-react";
import { FloatingLabel, Textarea, Button } from "flowbite-react";
import { useState } from "react";
import { updateCustomer } from "../../context/CustomerContext";

export default function EditCustomer({ onClose, customer, onUpdate, setToast }) {

    const [form, setForm] = useState({
        company_name: customer.company_name || '',
        contact_person: customer.contact_person || '',
        contact_email: customer.contact_email || '',
        contact_number: customer.contact_number || '', 
        address: customer.address || ''
    })


    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            await updateCustomer(customer.id, form);
            setToast({
                type: "success",
                message: "Customer Updated Success!"
            })
            onUpdate();
            onClose();
        }catch (error) {
            console.error('Error update customer', error);
            setToast({
                type: "error",
                message: "Failed to update customer!"
            })
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">

            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

            <div className="relative z-10 bg-white backdrop-blur-md w-[600px] rounded-lg shadow-xl rounded-md">
                <div className="flex items-center justify-between border-b border-gray-200 p-4 rounded-t-md">
                    <h1 className="text-xl font-bold">Edit Customer</h1>
                    <X onClick={onClose} className="w-6 h-6 text-gray-600 cursor-pointer hover:text-red-500" />
                </div>
                <form className="p-6" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Company Name</label>
                        <input
                            type="text"
                            name="company_name"
                            value={form.company_name}
                            onChange={handleChange}
                            placeholder="OneCloud"
                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Contact Person </label>
                            <input
                                type="text"
                                name="contact_person"
                                value={form.contact_person}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Contact Email</label>
                            <input
                                type="text"
                                name="contact_email"
                                value={form.contact_email}
                                onChange={handleChange}
                                placeholder="example@gmail.com"
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Contact Number </label>
                        <input
                            type="text"
                            name="contact_number"
                            value={form.contact_number}
                            onChange={handleChange}
                            placeholder="09 123-456-789"
                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Address </label>
                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="Yangon"
                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                        />
                    </div>


                    <Button
                        type="submit"
                        className="w-full bg-[#26599F] text-lg"
                    >
                        Edit
                    </Button>
                </form>
            </div>

        </div>
    )
}