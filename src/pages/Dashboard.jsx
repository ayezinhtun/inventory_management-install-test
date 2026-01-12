import { Home, Layers, Package, Pen, Trash2 } from "lucide-react";
import CardComponent from "../components/card/crad"
import { RecentComponent } from "../components/card/recentActivityCard"
import { Checkbox, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getWarehouse } from "../context/WarehouseContext";
import { fetchRack } from '../context/RackContext';
import { fetchInventory } from "../context/InventoryContext";

export default function Dashboard() {
    const [warehouses, setWarehouses] = useState([]);
    const [racks, setRacks] = useState([]);
    const [inventorys, setInventorys] = useState([]);

    // for fetch warehouses
    const fetchWarehouses = async () => {
        const data = await getWarehouse();
        setWarehouses(data);
    }

    // for fetch racks 
    const fetchRacks = async () => {
        const data = await fetchRack();
        setRacks(data);
    }

    //for fetch Inventorys
    const InventoryData = async () => {
        try {
            const data = await fetchInventory();
            setInventorys(data);
        } catch (error) {
            console.log('Error in fetch Inventory', error);
        }
    }

    useEffect(() => {
        fetchWarehouses();
        fetchRacks();
        InventoryData()
    }, [])
    return (
        <div>
            <h1 className="font-bold mb-5 text-[24px]">Dashboard</h1>

            <div className="grid grid-cols-3 gap-8 mb-5">
                <CardComponent title="Total Racks" count={racks.length} icon={Layers} />
                <CardComponent title="Total Warehouses" count={warehouses.length} icon={Home} />
                <CardComponent title="Total Inventory" count={inventorys.length} icon={Package} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                <div className="md:col-span-8 shadow rounded-lg border border-gray-200 h-[350px] overflow-y-auto">
                    <div className="flex items-center justify-between py-3 border-b border-[#EAECF0] px-5 space-x-4">
                        <h5 className="text-xl py-5 font-bold leading-none text-gray-900 dark:text-white">Recent Inventory</h5>
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

                            <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                    Test
                                </TableCell>
                                <TableCell>Testing</TableCell>
                                <TableCell>Active</TableCell>
                            </TableRow>

                        </TableBody>
                    </Table>

                </div>

                <div className="md:col-span-4">
                    <RecentComponent />
                </div>
            </div>

        </div>
    )
}