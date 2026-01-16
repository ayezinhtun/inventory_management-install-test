import { useState, useEffect, useMemo } from 'react';
import { createInstallRequest, getComponents, getServers } from '../../context/InstallRequest';
import { useUserProfiles } from '../../context/UserProfileContext';
import { Button, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell } from 'flowbite-react';
import { MoveLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../supabase/supabase-client';

export default function ComponentInstallRequest() {
    const { profile } = useUserProfiles();
    const [components, setComponents] = useState([]);
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        inventory_id: '',
        server_id: '',
        quantity: 1,
        notes: ''
    });

    

    useEffect(() => {
        const fetchData = async () => {
            const comps = await getComponents();
            const srvs = await getServers();
            setComponents(comps);
            setServers(srvs);
        };
        fetchData();
    }, []);

    const selectedComponent = useMemo(
        () => components.find(c => c.id === form.inventory_id),
        [components, form.inventory_id]
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!profile) return alert("User not logged in");


        if (!form.inventory_id || !form.server_id || form.quantity <= 0) {
            return alert("Please fill all required fields correctly");
        }

        if (!selectedComponent) {
            return alert("Invalid component selected");
        }

        setLoading(true);


        const payload = {
            inventory_id: form.inventory_id,
            server_id: form.server_id,
            quantity: Number(form.quantity),
            notes: form.notes,
            requested_by: profile.id,
            attributes: selectedComponent.attributes
        };

        try {
            await createInstallRequest(payload);
            alert("Request created! Waiting for approval.");

            setForm({
                inventory_id: '',
                server_id: '',
                quantity: 1,
                notes: ''
            });

        } catch (err) {
            alert("Error: " + err.message);
        }

        setLoading(false);
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-sm flex items-center me-2"><MoveLeft /></Link>
                        <h1 className="font-bold text-[24px]">Create Component Request</h1>
                    </div>
                    <Button type="submit" className="bg-[#26599F]">{loading ? "Submitting..." : "Create Request"}</Button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-8">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block mb-2">Component Name *</label>
                                <select name="inventory_id" value={form.inventory_id} onChange={handleChange} required className="w-full p-2.5 border rounded-lg">
                                    <option value="">Select Component</option>
                                    {components.map(c => <option key={c.id} value={c.id}>{c.name} ({c.quantity} available)</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2">Destination Device *</label>
                                <select name="server_id" value={form.server_id} onChange={handleChange} required className="w-full p-2.5 border rounded-lg">
                                    <option value="">Select Server</option>
                                    {servers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.serial_no})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2">Quantity</label>
                                <input name="quantity" type="number" min={1} value={form.quantity} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
                            </div>
                        </div>

                        <div className="mt-2">
                            <label className="block mb-2">Note</label>
                            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full p-2.5 border rounded-lg"></textarea>
                        </div>
                    </div>

                    <div className="col-span-4">
                        <Table hoverable>
                            <TableHead>
                                <TableRow>
                                    <TableHeadCell colSpan={2}>Current Component Information</TableHeadCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedComponent ? (
                                    <>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>{selectedComponent.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Type</TableCell>
                                            <TableCell>{selectedComponent.type}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Quantity</TableCell>
                                            <TableCell>{selectedComponent.quantity}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Attributes</TableCell>
                                            <TableCell>
                                                {Object.entries(selectedComponent.attributes || {})
                                                    .map(([k, v]) => `${k}: ${v}`)
                                                    .join(", ")}
                                            </TableCell>
                                        </TableRow>
                                    </>
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-gray-400">
                                            Select a component to view details
                                        </TableCell>
                                    </TableRow>
                                )
                                }
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </form>
        </div>
    );
}
