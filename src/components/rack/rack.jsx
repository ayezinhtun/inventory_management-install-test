import { ChevronDown, Edit2, Trash2 } from "lucide-react";

export default function RackComponent({backgroundColor, title}) {
    return (
        <div className="">
            <div
                className="text-white p-4 flex items-center justify-between"
                style={{ backgroundColor }}
            >
                <div className="flex items-center">
                    <div className="me-2 cursor-pointer">
                        <ChevronDown />
                    </div>
                    <div>
                        <h3 className="font-bold">{title}</h3>
                        <p className="text-sm">42U | Server | Active | Location A</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <Edit2 className="me-4" size={20} />
                    <Trash2 size={20} />
                </div>
            </div>

            <div className="flex shadow-sm flex-col">
                <div
                    className="group relative flex items-center h-8 border border-gray-300 group"
                    style={{ backgroundColor: "white", color: "black" }}
                >
                    <div className="w-6 text-right pr-1">3</div>
                    {/* <div className="flex-1 flex items-center justify-center cursor-pointer">
                        <span className="absolute inset-0 flex items-center justify-center text-[#26599F] font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">+</span>
                    </div> */}
                </div>

                <div
                    className="group relative flex items-center h-8 border border-gray-300 group"
                    style={{ backgroundColor: "white", color: "black" }}
                >
                    <div className="w-6 text-right pr-1">2</div>
                    {/* <div className="flex-1 flex items-center justify-center cursor-pointer">
                        <span className="absolute inset-0 flex items-center justify-center text-[#26599F] font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">+</span>
                    </div> */}
                </div>

                <div
                    className="relative flex items-center h-8 border border-gray-300 group"
                    style={{ backgroundColor: "white", color: "black" }}
                >
                    <div className="w-6 text-right pr-1">1</div>
                    {/* <div className="flex-1 flex items-center justify-center cursor-pointer">
                        <span className="absolute inset-0 flex items-center justify-center text-[#26599F] font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">+</span>
                    </div> */}
                </div>
            </div>
        </div>

    )
}