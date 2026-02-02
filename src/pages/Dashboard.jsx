import { Home, Layers, Package, Pen, Trash2 } from "lucide-react";
import CardComponent from "../components/card/crad"
import { RecentComponent } from "../components/card/recentActivityCard"
import { Checkbox, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getWarehouse } from "../context/WarehouseContext";
import { fetchRack, fetchRackByRegions } from '../context/RackContext';
import { fetchInventory, fetchInventoryByRegions } from "../context/InventoryContext";
import { useUserProfiles } from "../context/UserProfileContext";

export default function Dashboard() {
    const { profile, profileLoading } = useUserProfiles();
    const [warehouses, setWarehouses] = useState([]);
    const [racks, setRacks] = useState([]);
    const [inventorys, setInventorys] = useState([]);
    const [loading, setLoading] = useState(true);


    // // for fetch warehouses
    // const fetchWarehouses = async () => {
    //     const data = await getWarehouse();
    //     setWarehouses(data);
    // }

    // // for fetch racks 
    // const fetchRacks = async () => {
    //     const data = await fetchRack();
    //     setRacks(data);
    // }

    // //for fetch Inventorys
    // const InventoryData = async () => {
    //     try {
    //         const data = await fetchInventory();
    //         setInventorys(data);
    //     } catch (error) {
    //         console.log('Error in fetch Inventory', error);
    //     }
    // }

    useEffect(() => {
        if (profileLoading) return;

        const load = async () => {
            setLoading(true);
            try {
                const role = profile?.role;
                const assignedRegionIds = profile?.assignments?.regions || [];

                if (role === "admin") {
                    // admin: load everything
                    const [wh, rk, inv] = await Promise.all([
                        getWarehouse(),
                        fetchRack(),
                        fetchInventory()
                    ]);
                    setWarehouses(wh);
                    setRacks(rk);
                    setInventorys(inv);
                } else {
                    // non-admin: filter by assigned regions
                    // warehouses: filter client-side
                    const allWh = await getWarehouse();
                    const wh = assignedRegionIds.length
                        ? allWh.filter(w => assignedRegionIds.includes(w.region_id))
                        : [];

                    // racks & inventory: query by regions
                    const [rk, inv] = await Promise.all([
                        fetchRackByRegions(assignedRegionIds),
                        fetchInventoryByRegions(assignedRegionIds)
                    ]);

                    setWarehouses(wh);
                    setRacks(rk);
                    setInventorys(inv);
                }
            } catch (err) {
                console.error("Error loading dashboard data:", err);
                setWarehouses([]);
                setRacks([]);
                setInventorys([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [profileLoading, profile?.role, profile?.assignments?.regions]);

    // fetch recent inventory
    useEffect(() => {
        const getInventory = async () => {
            try {
                const data = await fetchInventory();
                setInventorys(data.slice(0, 5));
            } catch (err) {
                console.error("Error fetching inventory:", err.message);
            } finally {
                setLoading(false);
            }
        };

        getInventory();
    }, []);


    // useEffect(() => {
    //     fetchWarehoue();
    //     fetchRacks();
    //     InventoryData()
    // }, [])
    return (
        <div>
            <h1 className="font-bold mb-5 text-[24px]">Dashboard</h1>

            <div className="grid grid-cols-3 gap-8 mb-5">
                <CardComponent title="Total Racks" count={racks.length} icon={Layers} color="bg-yellow-100" iconColor="text-yellow-600" />
                <CardComponent title="Total Warehouses" count={warehouses.length} icon={Home} color="bg-blue-100" iconColor="text-blue-600" />
                <CardComponent title="Total Inventory" count={inventorys.length} icon={Package} color="bg-green-100" iconColor="text-green-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                <div className="md:col-span-7 shadow rounded-lg border border-gray-200 h-[350px] overflow-y-auto">
                    <div className="flex items-center justify-between py-3 border-b border-[#EAECF0] px-5 space-x-4">
                        <h5 className="text-xl py-5 font-bold leading-none text-gray-900">Recent Inventory</h5>
                        <Link to="/inventory" className="text-sm font-medium text-[#26599F] hover:underline">
                            View all
                        </Link>
                    </div>
                    <Table hoverable>
                        <TableHead className="sticky top-0 bg-white z-10">
                            <TableRow>
                                <TableHeadCell>Name</TableHeadCell>
                                <TableHeadCell>Serial No</TableHeadCell>
                                <TableHeadCell>Status</TableHeadCell>
                            </TableRow>
                        </TableHead>

                        <TableBody className="divide-y divide-gray-200">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-5">
                                        <Spinner size="xl" color="info" aria-label="Loading..." />
                                    </TableCell>
                                </TableRow>
                            ) : inventorys.length > 0 ? (
                                inventorys.map((inventory) => (
                                    <TableRow
                                        key={inventory.id}
                                        className="bg-white"
                                    >
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                            {inventory.name}
                                        </TableCell>
                                        <TableCell>{inventory.serial_no}</TableCell>
                                        <TableCell>{inventory.status}</TableCell>
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

                <div className="md:col-span-5">
                    <RecentComponent />
                </div>
            </div>

        </div>
    )
}