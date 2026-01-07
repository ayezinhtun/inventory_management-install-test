import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { X, MoveLeft } from "lucide-react";
import { Button } from "flowbite-react";
import { fetchInventoryById } from "../../context/InventoryContext";

export default function InventoryDetail() {
    const { id } = useParams();
    const [inventory, setInventory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getInventory = async () => {
            try {
                const data = await fetchInventoryById(id);
                setInventory(data);
            } catch (error) {
                console.error("Error fetching inventory", error);
            } finally {
                setLoading(false);
            }
        };

        getInventory();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (!inventory) return <p>Inventory not found</p>;

    return (
        <div>
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center">
                    <Link
                        to="/inventory"
                        className="p-2 hover:bg-gray-100 rounded-sm flex items-center me-2"
                    >
                        <MoveLeft />
                    </Link>
                    <h1 className="font-bold text-[24px]">Inventory Detail</h1>
                </div>
                <Button type="button" className="bg-[#26599F] text-lg">
                    Edit Inventory
                </Button>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Image */}
                <div className="col-span-3">
                    <div className="w-full">
                        <img
                            src={`https://frbzprbrsihovjypoftc.supabase.co/storage/v1/object/public/inventory-images/${inventory.image}`}
                            alt={inventory.name}
                            className="w-full h-auto object-cover rounded-lg"
                        />
                    </div>
                </div>


                {/* Details */}
                <div className="col-span-9">
                    <div className="grid grid-cols-3 gap-2 gap-y-2 text-gray-700">
                        <div>
                            <span className="font-medium">Device Name:</span> {inventory.name}
                        </div>
                        <div>
                            <span className="font-medium">Warehouse:</span> {inventory.warehouses.name}
                        </div>
                        {inventory.racks && (
                            <div>
                                <span className="font-medium">Rack:</span> {inventory.racks.name}
                            </div>
                        )}
                        <div>
                            <span className="font-medium">Status:</span> {inventory.status}
                        </div>
                        <div>
                            <span className="font-medium">Serial No:</span> {inventory.serial_no}
                        </div>
                        <div>
                            <span className="font-medium">Type:</span> {inventory.type}
                        </div>
                        <div>
                            <span className="font-medium">Model:</span> {inventory.model}
                        </div>
                        <div>
                            <span className="font-medium">Vendor:</span> {inventory.vendor}
                        </div>
                        {inventory.start_unit && (
                            <div>
                                <span className="font-medium">Start Unit:</span> {inventory.start_unit}
                            </div>
                        )}
                        {inventory.height && (
                            <div>
                                <span className="font-medium">Height (U):</span> {inventory.height}
                            </div>
                        )}
                        <div>
                            <span className="font-medium">Color:</span>{" "}
                            <span
                                className="inline-block w-5 h-5 rounded"
                                style={{ backgroundColor: inventory.color }}
                            ></span>
                        </div>
                    </div>

                    {inventory.customers && (
                        <div>
                            <span className="font-medium">Company Name:</span> {inventory.customers?.company_name}
                        </div>
                    )}

                    {/* Notes */}
                    <div className="mt-4">
                        <span className="font-medium text-gray-900">Notes:</span>
                        <p className="mt-1 text-gray-700">{inventory.notes}</p>
                    </div>

                    {/* Attributes */}
                    <div className="mt-4">
                        <span className="font-medium text-gray-900">Specification:</span>
                        <div className="grid grid-cols-3 gap-4 mt-2 text-gray-700">
                            {inventory.attributes &&
                                Object.entries(inventory.attributes).map(([key, value]) => (
                                    <div key={key}>
                                        <span className="font-medium">{key.toUpperCase()}:</span> {value}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
