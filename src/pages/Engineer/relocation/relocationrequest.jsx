import { useEffect, useMemo, useState } from 'react';
import { Button, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell } from 'flowbite-react';
import { MoveLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../../supabase/supabase-client';
import { createRelocationRequest } from '../../../context/RelocationContext';
import { fetchInstalledComponents } from '../../../context/InventoryContext';
import { useUserProfiles } from '../../../context/UserProfileContext';
import AppToast from '../../../components/toast/Toast';

export default function ComponentRelocationRequest() {
  const { profile } = useUserProfiles();
  const [toast, setToast] = useState(null);

  const [servers, setServers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [sourceServerId, setSourceServerId] = useState('');
  const [installed, setInstalled] = useState([]);
  const [selectedInstalledId, setSelectedInstalledId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [moveType, setMoveType] = useState('server'); // 'server' | 'warehouse'
  const [destServerId, setDestServerId] = useState('');
  const [destRegionId, setDestRegionId] = useState('');
  const [destWarehouseId, setDestWarehouseId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const [destInstalled, setDestInstalled] = useState([]);

  const sourceServer = useMemo(
    () => servers.find(s => s.id === sourceServerId),
    [servers, sourceServerId]
  );
  const selectedInstalled = useMemo(
    () => installed.find(i => i.id === selectedInstalledId),
    [installed, selectedInstalledId]
  );

  useEffect(() => {
    const load = async () => {
      const [{ data: srv }, { data: reg }, { data: wh }] = await Promise.all([
        supabase.from('inventorys').select('*').eq('type', 'server'),
        supabase.from('regions').select('id, name'),
        supabase.from('warehouses').select('id, name, region_id'),
      ]);
      setServers(srv || []);
      setRegions(reg || []);
      setWarehouses(wh || []);
    };
    load();
  }, []);

  useEffect(() => {
    if (!sourceServerId) {
      setInstalled([]);
      setSelectedInstalledId('');
      return;
    }
    fetchInstalledComponents(sourceServerId)
      .then(setInstalled)
      .catch(err =>
        setToast({ type: 'error', message: err.message || 'Failed to load installed components' })
      );
  }, [sourceServerId]);

  useEffect(() => {
    if (moveType !== 'server' || !destServerId) {
      setDestInstalled([]);
      return;
    }

    fetchInstalledComponents(destServerId)
      .then(setDestInstalled)
      .catch(() =>
        setToast({ type: 'error', message: 'Failed to load destination server components' })
      );
  }, [destServerId, moveType]);


  const warehouseOptions = useMemo(
    () => warehouses.filter(w => !destRegionId || w.region_id === destRegionId),
    [warehouses, destRegionId]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profile) {
      return setToast({ type: 'error', message: 'User not logged In!' });
    }
    if (!sourceServerId) {
      return setToast({ type: 'error', message: 'Please select a source server' });
    }
    if (!selectedInstalled) {
      return setToast({ type: 'error', message: 'Please select an installed component' });
    }
    if (quantity < 1 || quantity > selectedInstalled.quantity) {
      return setToast({ type: 'error', message: `Quantity must be between 1 and ${selectedInstalled.quantity}` });
    }
    if (moveType === 'server' && !destServerId) {
      return setToast({ type: 'error', message: 'Please select destination server' });
    }
    if (moveType === 'warehouse' && (!destRegionId || !destWarehouseId)) {
      return setToast({ type: 'error', message: 'Please select destination region and warehouse' });
    }

    const componentType = selectedInstalled.component?.type?.toLowerCase();

    const destServer = servers.find(s => s.id === destServerId);

    // get max slots from the server attributes
    const maxCpu = Number(destServer?.attributes?.max_cpu_slots || 0);
    const maxRam = Number(destServer?.attributes?.max_ram_slots || 0);
    const maxStorage = Number(destServer?.attributes?.max_storage_slots || 0);

    // Count how many slots are already used for this type
    let usedCpu = 0, usedRam = 0, usedStorage = 0;

    destInstalled.forEach(inst => {
      const type = inst.component?.type?.toLowerCase();
      const qty = Number(inst.quantity || 0);

      if (type === 'cpu') usedCpu += qty;
      else if (type === 'ram') usedRam += qty;
      else if (type === 'ssd') usedStorage += qty;
    });

    if (moveType === 'server') {
      if (componentType === 'ram' && usedRam + quantity > maxRam) {
        return setToast({
          type: 'error',
          message: `Cannot relocate ${quantity} RAM(s). Destination max: ${maxRam}, used: ${usedRam}`,
        });
      }

      if (componentType === 'cpu' && usedCpu + quantity > maxCpu) {
        return setToast({
          type: 'error',
          message: `Cannot relocate ${quantity} CPU(s). Destination max: ${maxCpu}, used: ${usedCpu}`,
        });
      }

      if (componentType === 'storage' && usedStorage + quantity > maxStorage) {
        return setToast({
          type: 'error',
          message: `Cannot relocate ${quantity} storage(s). Destination max: ${maxStorage}, used: ${usedStorage}`,
        });
      }
    }


    setLoading(true);
    try {
      await createRelocationRequest({
        inventory_id: selectedInstalled.inventory_id,
        source_server_id: sourceServerId,
        destination_move_type: moveType,
        destination_server_id: moveType === 'server' ? destServerId : null,
        destination_region_id: moveType === 'warehouse' ? destRegionId : null,
        destination_warehouse_id: moveType === 'warehouse' ? destWarehouseId : null,
        quantity: Number(quantity),
        requested_by: profile.id,
        notes,
      });

      await supabase.rpc('log_event', {
        p_category: 'relocation',
        p_action: 'request_created',
        p_subject_table: 'relocation_requests',
        p_subject_id: null,
        p_meta: { inventory_id: selectedInstalled.inventory_id, source_server_id: sourceServerId, dest_type: moveType, qty: quantity }
      });

      setToast({ type: 'success', message: 'Relocation Request created! Waiting for approval!' });
      // reset form
      setSourceServerId('');
      setInstalled([]);
      setSelectedInstalledId('');
      setQuantity(1);
      setMoveType('server');
      setDestServerId('');
      setDestRegionId('');
      setDestWarehouseId('');
      setNotes('');
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-sm flex items-center me-2">
              <MoveLeft />
            </Link>
            <h1 className="font-bold text-[24px]">Create Relocation Request</h1>
          </div>
          <Button type="submit" className="bg-[#26599F]">
            {loading ? 'Submitting...' : 'Create Request'}
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-8">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-2">Source Server <span className='text-red-500'>*</span></label>
                <select
                  value={sourceServerId}
                  onChange={(e) => setSourceServerId(e.target.value)}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                >
                  <option value="">Select Server</option>
                  {servers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.serial_no})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2">Installed Component <span className='text-red-500'>*</span></label>
                <select
                  value={selectedInstalledId}
                  onChange={(e) => setSelectedInstalledId(e.target.value)}
                  required
                  disabled={!sourceServerId || installed.length === 0}
                  className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                >
                  <option value="">Select Installed Component</option>
                  {installed.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.component?.type?.toUpperCase()} - {i.component?.name} (qty {i.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={selectedInstalled ? selectedInstalled.quantity : 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  onInput={(e) => {
                    const input = e.target;
                    // Remove 0 or empty input
                    if (Number(input.value) < 1 || input.value === '0') {
                      input.value = '1';
                      setQuantity(1);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === '0') {
                      e.preventDefault();
                    }
                  }}
                  className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                />
              </div>

              <div>
                <label className="block mb-2">Move To <span className='text-red-500'>*</span></label>
                <select
                  value={moveType}
                  onChange={(e) => setMoveType(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                >
                  <option value="server">Another Server</option>
                  <option value="warehouse">Warehouse (Region + Warehouse)</option>
                </select>
              </div>

              {moveType === 'server' ? (
                <div>
                  <label className="block mb-2">Destination Server <span className='text-red-500'>*</span></label>
                  <select
                    value={destServerId}
                    onChange={(e) => setDestServerId(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                  >
                    <option value="">Select Server</option>
                    {servers
                      .filter(s => s.id !== sourceServerId)
                      .map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.serial_no})</option>
                      ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block mb-2">Destination Region <span className='text-red-500'>*</span> </label>
                    <select
                      value={destRegionId}
                      onChange={(e) => { setDestRegionId(e.target.value); setDestWarehouseId(''); }}
                      className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                    >
                      <option value="">Select Region</option>
                      {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2">Destination Warehouse <span className='text-red-500'>*</span></label>
                    <select
                      value={destWarehouseId}
                      onChange={(e) => setDestWarehouseId(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
                    >
                      <option value="">Select Warehouse</option>
                      {warehouseOptions.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="mt-2">
              <label className="block mb-2">Note</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-500"
              />
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
                {selectedInstalled ? (
                  <>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>{selectedInstalled.component?.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>{selectedInstalled.component?.type}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Installed Qty</TableCell>
                      <TableCell>{selectedInstalled.quantity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Attributes</TableCell>
                      <TableCell>
                        {Object.entries(selectedInstalled.attributes || {})
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')}
                      </TableCell>
                    </TableRow>
                    {sourceServer && (
                      <TableRow>
                        <TableCell>Source Server</TableCell>
                        <TableCell>{sourceServer.name}</TableCell>
                      </TableRow>
                    )}
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-gray-400">
                      Select an installed component to view details
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
  );
}