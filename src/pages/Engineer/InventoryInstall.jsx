import { Button, Spinner, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell } from "flowbite-react";
import { MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserProfiles } from "../../context/UserProfileContext";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabase/supabase-client";
import { getRegion } from "../../context/RegionContext";
import { getWarehouse, getWarehousebyRegion } from "../../context/WarehouseContext";
import { fetchRack, fetchRackbyWarehouse } from "../../context/RackContext";
import { createInstallRequest } from "../../context/InstallRequest";
import AppToast from '../../components/toast/Toast'
import { fetchInventory } from "../../context/InventoryContext";

export default function InventoryInstallRequest() {
    const [toast, setToast] = useState(null);

    const { profile } = useUserProfiles();
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [regions, setRegions] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [racks, setRacks] = useState([]);

    const [form, setForm] = useState({
        inventory_id: '',
        destination_region_id: '',
        destination_warehouse_id: '',
        destination_rack_id: '',
        destination_start_unit: '',
        destination_height: '',
        notes: ''
    });

    useEffect(() => {
        const loadRegions = async () => {
            const data = await getRegion();
            setRegions(data || []);
        };

        loadRegions();
    }, []);



    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const data = await fetchInventory();

                const filtered = data.filter(d =>
                    ['server', 'switch', 'router'].includes(d.type) && d.status === 'active'
                );

                setDevices(filtered || []);
            } catch (error) {
                console.error('Failed to fetch inventory:', error.message);
            }
            // const { data, error } = await supabase
            //     .from('inventorys')
            //     .select('*')
            //     .in('type', ['server', 'switch', 'router']);

            // if (!error) setDevices(data);
        };

        fetchDevices();
    }, []);

    const handleChange = async (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (name === 'inventory_id') {
            const device = devices.find(d => d.id === value);
            setSelectedDevice(device || null);
        }

        // region selected -> fetch warehouses
        if (name === 'destination_region_id') {
            setForm(prev => ({ ...prev, destination_warehouse_id: '', destination_rack_id: '' }));
            setRacks([]);

            const data = await getWarehousebyRegion(value);
            setWarehouses(data || []);
        }

        // warehouse selected -> fetch racks
        if (name === 'destination_warehouse_id') {
            setForm(prev => ({ ...prev, destination_rack_id: '' }));

            const data = await fetchRackbyWarehouse(value);
            setRacks(data || []);
        }

    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.inventory_id)
            return setToast({
                type: "error",
                message: "Please select a device"
            })


        if (
            form.destination_rack_id &&
            form.destination_start_unit &&
            form.destination_height
        ) {
            const start = Number(form.destination_start_unit);
            const height = Number(form.destination_height);
            const end = start + height - 1;

            if (start < 1 || height < 1) {

                setToast({
                    type: "error",
                    message: "Start unit and heigth must be at least 1"
                })
                setLoading(false);
                return;
            }

            // get rack info 
            const rackInfo = racks.find(r => r.id === form.destination_rack_id);
            const maxU = rackInfo?.size_u || 42;

            if (end > maxU) {
                setToast({
                    type: "error",
                    message: `Exceeds rack capacity (Max ${maxU}U)`
                })
                setLoading(false);
                return;
            }

            // fetch overlapping units 
            const { data: occupied } = await supabase
                .from('inventorys')
                .select('start_unit, height')
                .eq('rack_id', form.destination_rack_id);

            for (let device of occupied || []) {
                const deviceStart = device.start_unit;
                const deviceEnd = device.start_unit + device.height - 1;

                const overlap =
                    (form.destination_start_unit >= deviceStart && form.destination_start_unit <= deviceEnd) ||
                    (end >= deviceStart && end <= deviceEnd) ||
                    (form.destination_start_unit <= deviceStart && end >= deviceEnd);

                if (overlap) {
                    setToast({
                        type: "error",
                        message: `This device overlaps with an existing device at units ${deviceStart}-${deviceEnd}.`
                    })
                    setLoading(false);
                    return;
                }
            }
        }
        setLoading(true);

        try {
            await createInstallRequest({
                inventory_id: form.inventory_id,
                quantity: 1,
                requested_by: profile.id,
                notes: form.notes,
                destination_region_id: form.destination_region_id,
                destination_warehouse_id: form.destination_warehouse_id,
                destination_rack_id: form.destination_rack_id || null,
                destination_start_unit: form.destination_start_unit || null,
                destination_height: form.destination_height || null
            });

            setToast({
                type: "success",
                message: "Installation request submitted! Waiting for approval"
            })


            setForm({
                inventory_id: '',
                destination_region_id: '',
                destination_warehouse_id: '',
                destination_rack_id: '',
                destination_start_unit: '',
                destination_height: '',
                notes: ''
            });

            setSelectedDevice(null);
        } catch (err) {
            setToast({
                type: "error",
                message: err.message
            })
        }

        setLoading(false);
    }


    return (
        <div>
            <form action="" onSubmit={handleSubmit}>
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-sm flex items-center me-2"><MoveLeft /></Link>
                        <h1 className="font-bold text-[24px]">Create Inventory Request</h1>
                    </div>
                    <Button
                        type="submit"
                        className="bg-[#26599F] text-lg"
                    >
                        Create Request
                    </Button>
                </div>
                <div className="grid grid-cols-12 gap-8">

                    <div className="col-span-8">
                        <div className="grid grid-cols-2 gap-2 gap-y-2">
                            <div>
                                <label className="block mb-2">Device Name <span className="text-red-500">*</span></label>
                                <select name="inventory_id" value={form.inventory_id} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500">
                                    <option value="">Select Device</option>
                                    {devices.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} ({d.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Destination Region <span className="text-red-500">*</span></label>
                                <select name="destination_region_id" value={form.destination_region_id} onChange={handleChange} id="" required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                >
                                    <option value="">
                                        Select Region
                                    </option>

                                    {
                                        regions.map(r =>
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        )
                                    }

                                </select>
                            </div>

                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Destination Warehouse <span className="text-red-500">*</span></label>
                                <select name="destination_warehouse_id" value={form.destination_warehouse_id} onChange={handleChange} required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                >
                                    <option value="">
                                        Select Warehouse
                                    </option>
                                    {warehouses.map(w =>
                                        <option key={w.id} value={w.id}>
                                            {w.name}
                                        </option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Destination Rack</label>
                                <select name="destination_rack_id" value={form.destination_rack_id} onChange={handleChange} id=""
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300  text-gray-500"
                                >
                                    <option value="">
                                        No Rack
                                    </option>
                                    {racks.map(r =>
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    )}
                                </select>
                            </div>


                            <div>
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">Destination Start Unit</label>
                                <input
                                    name="destination_start_unit"
                                    type="number"
                                    value={form.destination_start_unit}
                                    onChange={handleChange}
                                    disabled={!form.destination_rack_id}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900">
                                    Destination Height (U)
                                </label>
                                <input
                                    name="destination_height"
                                    type="number"
                                    value={form.destination_height}
                                    onChange={handleChange}
                                    disabled={!form.destination_rack_id}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                                />
                            </div>
                        </div>

                        <div className="mt-2">
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-8">
                                    <div>
                                        <label className="block mb-2 text-gray-900 text-sm font-medium">
                                            Note
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={form.notes}
                                            onChange={handleChange}
                                            placeholder="Description"
                                            rows={3}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-4">
                        <div className="overflow-x-auto shadow-sm">
                            <Table hoverable className="bg-gray-200 rounded-md">
                                <TableHead>
                                    <TableRow>
                                        <TableHeadCell colSpan={2} className="bg-gray-200">Current Device Information</TableHeadCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody className="divide-y">
                                    {selectedDevice ? (
                                        <>
                                            <TableRow className="bg-white border-bottom border-gray-300  border-dashed">
                                                <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                    Device Name
                                                </TableCell>
                                                <TableCell>{selectedDevice.name}</TableCell>
                                            </TableRow>
                                            <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                                <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                    Serial No
                                                </TableCell>
                                                <TableCell>{selectedDevice.serial_no}</TableCell>
                                            </TableRow>
                                            <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                                <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                    Type
                                                </TableCell>
                                                <TableCell>{selectedDevice.type}</TableCell>
                                            </TableRow>
                                            <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                                <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                    Model
                                                </TableCell>
                                                <TableCell>{selectedDevice.model}</TableCell>
                                            </TableRow>
                                            <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                                <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                    Vendor
                                                </TableCell>
                                                <TableCell>{selectedDevice.vendor}</TableCell>
                                            </TableRow>
                                            <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                                <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                    Region
                                                </TableCell>
                                                <TableCell>{selectedDevice.regions?.name}</TableCell>
                                            </TableRow>
                                            <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                                <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                    Warehouse
                                                </TableCell>
                                                <TableCell>{selectedDevice.warehouses?.name}</TableCell>
                                            </TableRow>
                                            <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                                <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                    Rack
                                                </TableCell>
                                                <TableCell>{selectedDevice.racks?.name}</TableCell>
                                            </TableRow>
                                            {selectedDevice.racks.id && (
                                                <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                                    <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                        Start Unit
                                                    </TableCell>
                                                    <TableCell>{selectedDevice.start_unit}</TableCell>
                                                </TableRow>
                                            )}

                                            {selectedDevice.racks.id && (
                                                <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                                    <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                        Height
                                                    </TableCell>
                                                    <TableCell>{selectedDevice.height}</TableCell>
                                                </TableRow>
                                            )}
                                            <TableRow className="bg-white border-bottom border-gray-300 border-dashed">
                                                <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                    Color
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-block w-20 h-7 rounded" style={{ backgroundColor: selectedDevice.color }}>
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        </>
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-gray-400">
                                                Select a device to view details
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                </div>
            </form>

            {toast && (
                <div className="fixed top-5 right-5 z-50">
                    <AppToast
                        type={toast.type}
                        message={toast.message}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}

        </div>
    )
}