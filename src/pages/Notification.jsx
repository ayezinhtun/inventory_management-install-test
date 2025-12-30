import { Check, CirclePlus, Delete, Dot, Download, Edit, ListFilter, Mail, MailOpen, MapPin, Pen, Search, Trash2 } from "lucide-react"


export default function Notification() {

    const notis = [
        { title: "Aye requests to install inventory", Date: "Just Now" },
        { title: "Mg Mg requests to relocate inventory", Date: "2 days ago" },
    ];

    const currentNotis = notis;

    return (
        <div>

            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-auto">
                <div className="flex items-center justify-end py-3 border-b border-[#EAECF0] px-5 space-x-4">

                    <div className="flex space-x-5">

                        <div
                            className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 hover:border-none hover:outline-none'
                        >
                            <span>Mark As All Read</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg flex flex-col gap-y-2 py-2">

                    {currentNotis.map((noti, index) => {
                        return (
                            <div key={index} className="flex items-center justify-between px-4">
                                <div className="flex items-center gap-2">
                                    <Dot />
                                    <p className="text-gray-600">{noti.title}</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <p className="text-gray-400">
                                        {noti.Date}
                                    </p>
                                    <div className="p-2 hover:bg-gray-100 hover:rounded-lg cursor-pointer relative group inline-block">
                                        <MailOpen
                                            className="text-gray-600"
                                        />
                                    </div>
                                    <div className="hover:bg-gray-100 hover:rounded-lg p-2">
                                        <Trash2 className="text-red-500" />
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                </div>


            </div>

            
        </div>
    )
}