import { ChevronDown, ChevronUp, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RackComponent({ rack, inventorys, onDelete, onEdit }) {
    const [collapsed, setCollapsed] = useState({});
    const navigate = useNavigate();

    // Keep track of which units are already rendered for a device
    const renderedUnits = new Set();

    return (
        <div className="shadow-lg">
            {/* Rack Header */}
            <div
                className="text-white p-4 flex items-center justify-between rounded-t-lg"
                style={{ backgroundColor: rack.color || "#3b82f6" }}
            >
                <div className="flex items-center">
                    <div
                        className="me-2 cursor-pointer"
                        onClick={() =>
                            setCollapsed((prev) => ({ ...prev, [rack.id]: !prev[rack.id] }))
                        }
                    >
                        {collapsed[rack.id] ? <ChevronDown /> : <ChevronUp />}
                    </div>
                    <div>
                        <h3 className="font-bold">{rack.name}</h3>
                        <p className="text-sm">
                            {rack.size_u}U | {rack.type} | {rack.status} <br />
                            {rack.warehouses?.name} | {rack.warehouses?.regions?.name}
                        </p>
                    </div>
                </div>

                <div className="flex items-center">
                    <Edit2
                        className="me-4 cursor-pointer"
                        size={20}
                        onClick={() => onEdit(rack)}
                    />
                    <Trash2
                        className="cursor-pointer"
                        size={20}
                        onClick={() => onDelete(rack.id)}
                    />
                </div>
            </div>

            {/* Rack Units */}
            {!collapsed[rack.id] && (
                <div className="flex flex-col border-t border-gray-300">
                    {Array.from({ length: rack.size_u }, (_, i) => {
                        const u = rack.size_u - i; // unit number from top to bottom

                        // Skip if this unit was already rendered as part of a previous device
                        if (renderedUnits.has(u)) return null;

                        // Find device occupying this unit
                        const deviceHere = inventorys.find(
                            (d) =>
                                d.rack_id === rack.id &&
                                u >= d.start_unit &&
                                u < d.start_unit + d.height
                        );

                        if (deviceHere) {
                            // Mark all units of this device as rendered
                            for (let j = deviceHere.start_unit; j < deviceHere.start_unit + deviceHere.height; j++) {
                                renderedUnits.add(j);
                            }

                            return (
                                <div
                                    key={u}
                                    className="flex border-b border-gray-300 cursor-pointer"
                                    style={{
                                        height: `${deviceHere.height * 30}px`, // height per unit
                                        backgroundColor: deviceHere.color || "#3b82f6",
                                        color: "white",
                                    }}
                                    onClick={() => navigate(`/inventory-detail/${deviceHere.id}`)}
                                >
                                    {/* Unit numbers column */}
                                    <div className="flex flex-col justify-center w-6 text-right pr-1">
                                        {Array.from({ length: deviceHere.height }, (_, idx) => deviceHere.start_unit + idx)
                                            .reverse()
                                            .map((unitNum) => (
                                                <div key={unitNum} className="py-0.5">{unitNum}</div>
                                            ))}
                                    </div>

                                    {/* Device name centered */}
                                    <div className="flex-1 flex items-center justify-center">
                                        <span className="font-medium">{deviceHere.name}</span>
                                    </div>
                                </div>
                            );
                        }

                        // Empty unit
                        return (
                            <div
                                key={u}
                                className="flex items-center border-b border-gray-300 h-8"
                            >
                                <div className="w-6 text-right pr-1">{u}</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
