import { CircleX, Cross, X } from "lucide-react";
import { FloatingLabel, Textarea, Button } from "flowbite-react";
import { createRegion } from "../../context/RegionContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "flowbite-react";
import AppToast from "../toast/Toast";

export default function AddRegion({ onClose , onAdd, setToast }) {

    const [form, setForm] = useState({
        name: '',
        description: ''
    })


    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            await createRegion(form);
            setForm({name: '', description: ''});
            setToast({
                type: "success", 
                message: "Region added successfully!"
            })
            onAdd();
            onClose();
        }catch (error) {
            console.error('Error adding region', error)
            setToast({
                type: "error", 
                message: "Failed to add region!", 
            })
        }
    }
    

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">

            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

            <div className="relative z-10 bg-white backdrop-blur-md w-[600px] rounded-lg shadow-xl rounded-md">
                <div className="flex items-center justify-between border-b border-gray-200 p-4 rounded-t-md">
                    <h1 className="text-xl font-bold">Add Region</h1>
                    <X onClick={onClose} className="w-6 h-6 text-gray-600 cursor-pointer hover:text-red-500" />
                </div>
                <form className="p-6" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Region Name<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="YGN"
                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-700"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="" className="block mb-2 text-gray-900 text-sm font-medium">Note</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Description"
                            rows={3}
                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-700"
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