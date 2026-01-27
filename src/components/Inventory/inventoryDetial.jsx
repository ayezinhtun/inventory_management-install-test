import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { X, MoveLeft } from "lucide-react";
import { Button, Spinner } from "flowbite-react";
import { fetchInstalledComponents, fetchInventoryById } from "../../context/InventoryContext";
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";

export default function InventoryDetail() {
    const { id } = useParams();
    const [inventory, setInventory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [installedComponents, setInstalledComponents] = useState([]);

    useEffect(() => {
        const getInventory = async () => {
            setLoading(true);
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

    useEffect(() => {
        const getInstalled = async () => {
            if (inventory?.type === "server") {
                try {
                    const data = await fetchInstalledComponents(inventory.id);
                    setInstalledComponents(data);
                } catch (err) {
                    console.error("Error fetching installed components", err);
                }
            }
        };
        getInstalled();
    }, [inventory]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner size="xl" color="info" aria-label="Loading..." />
            </div>
        );
    }


    if (!inventory) {
        return (
            <p>Inventory not found</p>
        )
    }



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

                <Link
                    to={
                        inventory.type === "ram" || inventory.type === "cpu" || inventory.type === "ssd"
                            ? `/edit-part/${inventory.id}`
                            : `/edit-inventory/${inventory.id} `
                    }

                >
                    <Button type="button" className="bg-[#26599F] text-lg">
                        Edit Inventory
                    </Button>
                </Link>

            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Image */}
                <div className="col-span-3">
                    <div className="w-full">
                        <img
                            src={`https://mlozugcajyiygdgtzbnk.supabase.co/storage/v1/object/public/inventory-images/${inventory.image}`}
                            alt={inventory.name}
                            className="w-full h-auto object-cover rounded-lg"
                        />
                    </div>
                </div>

                <div className="col-span-9">
                    <div className="grid grid-cols-2 gap-4 items-start">
                        <div className="overflow-x-auto shadow-sm">
                            <Table hoverable className="bg-gray-200 rounded-md">
                                <TableHead>
                                    <TableRow>
                                        <TableHeadCell className="bg-gray-200">Device Information</TableHeadCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody className="divide-y">
                                    <TableRow className="bg-white border-bottom border-gray-300  border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                            Device Name
                                        </TableCell>
                                        <TableCell>{inventory.name}</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                            Region
                                        </TableCell>
                                        <TableCell>{inventory.regions.name}</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                            Warehouse
                                        </TableCell>
                                        <TableCell>{inventory.warehouses.name}</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                            Status
                                        </TableCell>
                                        <TableCell>{inventory.status}</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                            Serial No
                                        </TableCell>
                                        <TableCell>{inventory.serial_no}</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                            Type
                                        </TableCell>
                                        <TableCell>{inventory.type}</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                            Model
                                        </TableCell>
                                        <TableCell>{inventory.model}</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                            Vendor
                                        </TableCell>
                                        <TableCell>{inventory.vendor}</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                            Color
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-block w-20 h-7 rounded" style={{ backgroundColor: inventory.color }}>
                                            </span>
                                        </TableCell>
                                    </TableRow>

                                    {inventory.quantity > 1 && (
                                        <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                            <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                Quantity
                                            </TableCell>
                                            <TableCell>{inventory.quantity}</TableCell>
                                        </TableRow>
                                    )}

                                    <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                            Notes
                                        </TableCell>
                                        <TableCell>{inventory.notes || ''}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex flex-col gap-y-4">
                            {inventory.racks && (
                                <div className="overflow-x-auto shadow-sm">
                                    <Table hoverable className="bg-gray-200 rounded-md">
                                        <TableHead>
                                            <TableRow>
                                                <TableHeadCell className="bg-gray-200">Rack Information</TableHeadCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody className="divide-y">
                                            {inventory.racks && (
                                                <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                                    <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                        Rack
                                                    </TableCell>
                                                    <TableCell>{inventory.racks.name}</TableCell>
                                                </TableRow>
                                            )}

                                            {inventory.start_unit && (
                                                <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                                    <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                        Start Unit
                                                    </TableCell>
                                                    <TableCell>{inventory.start_unit}</TableCell>
                                                </TableRow>
                                            )}

                                            {inventory.height && (
                                                <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                                    <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                        Height
                                                    </TableCell>
                                                    <TableCell>{inventory.height}</TableCell>
                                                </TableRow>
                                            )}

                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {Object.keys(inventory.attributes || {}).length > 0 && (
                                <div className="overflow-x-auto shadow-sm">
                                    <Table hoverable className="bg-gray-200 rounded-md">
                                        <TableHead>
                                            <TableRow>
                                                <TableHeadCell className="bg-gray-200">
                                                    {inventory.type.toUpperCase()} Specification
                                                </TableHeadCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody className="divide-y">
                                            {Object.entries(inventory.attributes).map(([key, value]) => (
                                                <TableRow key={key} className="bg-white border-bottom border-gray-300 border-dashed">
                                                    <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                        {key.toUpperCase()}
                                                    </TableCell>
                                                    <TableCell>{value}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}



                            {inventory.type === "server" && installedComponents.length > 0 && (
                                <div className="mt-4 overflow-x-auto shadow-sm">
                                    <h2 className="text-lg font-bold mb-2">Installed Components</h2>
                                    <Table hoverable className="bg-gray-200 rounded-md">
                                        <TableHead>
                                            <TableRow>
                                                <TableHeadCell className="bg-gray-200">Name</TableHeadCell>
                                                <TableHeadCell className="bg-gray-200">Model</TableHeadCell>
                                                <TableHeadCell className="bg-gray-200">Vendor</TableHeadCell>
                                                <TableHeadCell className="bg-gray-200">Quantity</TableHeadCell>

                                            </TableRow>
                                        </TableHead>
                                        <TableBody className="divide-y">
                                            {installedComponents.map((item) => (
                                                <TableRow key={item.id} className="bg-white border-b border-gray-300 border-dashed">
                                                    <TableCell>{item.component.name}</TableCell>
                                                    <TableCell>{item.component.model}</TableCell>
                                                    <TableCell>{item.component.vendor}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
