import { Home, Layers, Package } from "lucide-react";
import CardComponent from "../components/card/crad";
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Spinner } from "flowbite-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getWarehouse } from "../context/WarehouseContext";
import { fetchRack, fetchRackByRegions } from "../context/RackContext";
import { fetchInventory, fetchInventoryByRegions } from "../context/InventoryContext";
import { useUserProfiles } from "../context/UserProfileContext";

export default function Dashboard() {

    const { profile, profileLoading } = useUserProfiles();

    const [warehouses, setWarehouses] = useState([]);
    const [racks, setRacks] = useState([]);
    const [inventorys, setInventorys] = useState([]); // total inventory
    const [recentInventorys, setRecentInventorys] = useState([]); // recent inventory

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (profileLoading) return;

        const loadDashboard = async () => {

            setLoading(true);

            try {

                const role = profile?.role;
                const assignedRegionIds = profile?.assignments?.regions || [];

                // ADMIN
                if (role === "admin") {

                    const [wh, rk, inv] = await Promise.all([
                        getWarehouse(),
                        fetchRack(),
                        fetchInventory()
                    ]);

                    setWarehouses(wh);
                    setRacks(rk);
                    setInventorys(inv);
                    setRecentInventorys(inv.slice(0, 5));

                }

                // PM / ENGINEER
                else {

                    const allWh = await getWarehouse();

                    const wh = assignedRegionIds.length
                        ? allWh.filter(w => assignedRegionIds.includes(w.region_id))
                        : [];

                    const [rk, inv] = await Promise.all([
                        fetchRackByRegions(assignedRegionIds),
                        fetchInventoryByRegions(assignedRegionIds)
                    ]);

                    setWarehouses(wh);
                    setRacks(rk);
                    setInventorys(inv);
                    setRecentInventorys(inv.slice(0, 5));

                }

            } catch (err) {

                console.error("Dashboard load error:", err);

                setWarehouses([]);
                setRacks([]);
                setInventorys([]);
                setRecentInventorys([]);

            } finally {

                setLoading(false);

            }

        };

        loadDashboard();

    }, [profileLoading, profile?.role, profile?.assignments?.regions]);



    return (

        <div>

            <h1 className="font-bold mb-5 text-[24px]">Dashboard</h1>

            {/* Cards */}
            <div className="grid grid-cols-3 gap-8 mb-5">

                <CardComponent
                    title="Total Racks"
                    count={racks.length}
                    icon={Layers}
                    color="bg-yellow-100"
                    iconColor="text-yellow-600"
                />

                <CardComponent
                    title="Total Warehouses"
                    count={warehouses.length}
                    icon={Home}
                    color="bg-blue-100"
                    iconColor="text-blue-600"
                />

                <CardComponent
                    title="Total Inventory"
                    count={inventorys.length}
                    icon={Package}
                    color="bg-green-100"
                    iconColor="text-green-600"
                />

            </div>



            {/* Recent Inventory Table */}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                <div className="md:col-span-12 shadow rounded-lg border border-gray-200 h-[350px] overflow-y-auto">

                    <div className="flex items-center justify-between py-3 border-b border-[#EAECF0] px-5 space-x-4">

                        <h5 className="text-xl py-5 font-bold leading-none text-gray-900">
                            Recent Inventory
                        </h5>

                        <Link
                            to="/inventory"
                            className="text-sm font-medium text-[#26599F] hover:underline"
                        >
                            View all
                        </Link>

                    </div>

                    <Table hoverable>

                        <TableHead className="sticky top-0 bg-white z-10">

                            <TableRow>
                                <TableHeadCell>Name</TableHeadCell>
                                <TableHeadCell>Serial No</TableHeadCell>
                                <TableHeadCell>Stock</TableHeadCell>
                            </TableRow>

                        </TableHead>


                        <TableBody className="divide-y divide-gray-200">

                            {loading ? (

                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-5">
                                        <Spinner size="xl" color="info" />
                                    </TableCell>
                                </TableRow>

                            ) : recentInventorys.length > 0 ? (

                                recentInventorys.map((inventory) => (

                                    <TableRow key={inventory.id} className="bg-white">

                                        <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                            {inventory.name}
                                        </TableCell>

                                        <TableCell>
                                            {inventory.serial_no}
                                        </TableCell>

                                        <TableCell>

                                            {inventory.quantity > 0 ? (

                                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                    {inventory.quantity} in stock
                                                </span>

                                            ) : (

                                                <span className="whitespace-nowrap bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                    Out of Stock
                                                </span>

                                            )}

                                        </TableCell>

                                    </TableRow>

                                ))

                            ) : (

                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-5 text-gray-500">
                                        No recent inventory
                                    </TableCell>
                                </TableRow>

                            )}

                        </TableBody>

                    </Table>

                </div>

            </div>

        </div>

    );
}