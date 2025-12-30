import { CircleX, Cross, X } from "lucide-react";
import { FloatingLabel, Textarea, Button } from "flowbite-react";

export default function AddCustomer({ onClose }) {

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">

            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

            <div className="relative z-10 bg-white backdrop-blur-md w-[600px] rounded-lg shadow-xl rounded-md">
                <div className="flex items-center justify-between border-b border-gray-200 p-4 rounded-t-md">
                    <h1 className="text-xl font-bold">Add Customer</h1>
                    <CircleX onClick={onClose} className="w-6 h-6 text-gray-600 cursor-pointer hover:text-red-500" />
                </div>
                <form className="p-6">
                    <div className="mb-4">
                        <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Company Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            placeholder="OneCloud"
                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Contact Person <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Contact Email <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="example@gmail.com"
                                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Contact Number <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            placeholder="09 123-456-789"
                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Address <span className="text-red-500">*</span></label>
                        <textarea
                            placeholder="Yangon"
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