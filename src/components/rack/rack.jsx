import { ChevronDown, ChevronUp, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";


export default function RackComponent({ rack }) {
    const [collapsed, setCollapsed] = useState({});

    return (
        <div>
            <div
                className="text-white p-4 flex items-center justify-between"
                style={{ backgroundColor: rack.color || '#3b82f6' }}
            >
                <div className="flex items-center">
                    <div
                        className="me-2 cursor-pointer"
                        onClick={() => setCollapsed(prev => ({
                            ...prev,
                            [rack.id]: !prev[rack.id]
                        }))}
                    >
                        {collapsed[rack.id] ? <ChevronDown /> : <ChevronUp />}
                    </div>
                    <div>
                        <h3 className="font-bold">{rack.name}</h3>
                        <p className="text-sm">{rack.size_u} U | {rack.type} | {rack.status} <br /> {rack.warehouse.name} | {rack.warehouse.region_name}</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <Edit2 className="me-4" size={20} />
                    <Trash2 size={20} />
                </div>
            </div>

            {!collapsed[rack.id] && (
                <div className="flex shadow-sm flex-col">
                    {Array.from({ length: rack.size_u }, (_, i) => {
                        const u = rack.size_u - i;
                        return (
                            <div
                                key={u}
                                className="group relative flex items-center h-8 border border-gray-300 group"
                                style={{ backgroundColor: "white", color: "black" }}
                            >
                                <div className="w-6 text-right pr-1">{u}</div>
                            </div>
                        )
                    })}

                </div>
            )}

        </div>

    )
}