import { supabase } from '../../supabase/supabase-client';

export const createRelocationRequest = async (payload) => {
    const newPayload = {
        ...payload,
        status: 'pm_approve_pending',
    };

    const { data, error } = await supabase
        .from('relocation_requests')
        .insert([newPayload])
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
};

export const getRelocationRequests = async (statuses, userId, regionIds) => {
    let q = supabase
        .from('relocation_requests')
        .select(` 
        id, 
        inventory_id, 
        source_server_id,
        source_region_id,
        source_warehouse_id,
        source_rack_id,
        source_start_unit,
        source_height,
        destination_move_type,
        destination_server_id, 
        destination_region_id, 
        destination_warehouse_id, 
        destination_rack_id,
        destination_start_unit,
        destination_height,
        quantity, 
        status, 
        requested_by, 
        notes,
        created_at, 
        component:inventory_id (id, name, type, model, vendor), 
        source:source_server_id (id, name, type),
        source_warehouse:source_warehouse_id (id, name),
        source_region:source_region_id (id, name),
        dest_server:destination_server_id (id, name, type),
        dest_warehouse:destination_warehouse_id (id, name),
        requester:requested_by (id, name)
    `);

    if (Array.isArray(statuses)) q = q.in('status', statuses);
    else if (statuses) q = q.eq('status', statuses);

    if (userId) q = q.eq('requested_by', userId);

    if (Array.isArray(regionIds) && regionIds.length > 0) {
        q = q.in('destination_region_id', regionIds);
    }

    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

// Approve / Reject /Complete
export const updateRelocationRequestStatus = async (id, status, userId) => {
    if (!id) throw new Error('Request ID is required');
    const { data: req, error: fetchErr } = await supabase
        .from('relocation_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!req) throw new Error('Request not found');

    const payload = { status };
    if (status === 'pm_approved' && userId) payload.pm_approved_by = userId;
    if (status === 'admin_approved' && userId) payload.admin_approved_by = userId;
    if (status === 'rejected' && userId) payload.rejected_by = userId;
    if (status === 'pm_approved') payload.pm_approved_at = new Date().toISOString();
    if (status === 'admin_approved') payload.admin_approved_at = new Date().toISOString();
    if (status === 'rejected') payload.rejected_at = new Date().toISOString();
    if (status === 'complete') payload.completed_at = new Date().toISOString();

    if (status === 'complete') {
        if (!userId) throw new Error('Operator must be logged in');

        const {
            inventory_id,
            source_server_id,
            destination_move_type,
            destination_server_id,
            destination_region_id,
            destination_warehouse_id,
            destination_rack_id,
            destination_start_unit,
            destination_height,
            quantity,
        } = req;

        // Handle INVENTORY RELOCATION (no source server, moving inventory directly)
        if (!source_server_id && destination_move_type === 'warehouse') {
            const { error: updateError } = await supabase
                .from('inventorys')
                .update({
                    region_id: destination_region_id,
                    warehouse_id: destination_warehouse_id,
                    rack_id: destination_rack_id,
                    start_unit: destination_start_unit,
                    height: destination_height,
                    updated_at: new Date().toISOString()
                })
                .eq('id', inventory_id);

            if (updateError) throw updateError;

        }

        // Handle COMPONENT RELOCATION (has source server, moving from installations)
        if (source_server_id) {
            // deduct from source installations
            const { data: srcInst, error: srcErr } = await supabase
                .from('installations')
                .select('id, quantity, attributes')
                .eq('server_id', source_server_id)
                .eq('inventory_id', inventory_id)
                .maybeSingle();

            if (srcErr) throw srcErr;
            if (!srcInst || srcInst.quantity < quantity) {
                throw new Error('Insufficient installed quantity on source server');
            }

            if (srcInst.quantity === quantity) {
                const { error: delErr } = await supabase
                    .from('installations')
                    .delete()
                    .eq('id', srcInst.id);

                if (delErr) throw delErr;
            } else {
                const { error: updErr } = await supabase
                    .from('installations')
                    .update({ quantity: srcInst.quantity - quantity })
                    .eq('id', srcInst.id);
                if (updErr) throw updErr;
            }

            // apply destination
            if (destination_move_type === 'server') {
                const { data: dstInst, error: dstFetchErr } = await supabase
                    .from('installations')
                    .select('id, quantity')
                    .eq('server_id', destination_server_id)
                    .eq('inventory_id', inventory_id)
                    .maybeSingle();

                if (dstFetchErr) throw dstFetchErr;
                if (dstInst) {
                    const { error: dstUpdErr } = await supabase
                        .from('installations')
                        .update({
                            quantity: dstInst.quantity + quantity,
                            installed_at: new Date().toISOString(),
                            installed_by: userId,
                        })
                        .eq('id', dstInst.id);

                    if (dstUpdErr) throw dstUpdErr;
                } else {
                    const { error: dstInstErr } = await supabase
                        .from('installations')
                        .insert({
                            inventory_id,
                            server_id: destination_server_id,
                            quantity,
                            installed_by: userId,
                            attributes: srcInst?.attributes || {},
                        });

                    if (dstInstErr) throw dstInstErr;
                }
            } else if (destination_move_type === 'warehouse') {
                // Handle warehouse relocation for components
                const { data: srcItem, error: srcErr } = await supabase
                    .from('inventorys')
                    .select('id, name, type, model, vendor, quantity, region_id, warehouse_id, rack_id')
                    .eq('id', inventory_id)
                    .maybeSingle();
                if (srcErr) throw srcErr;
                if (!srcItem) throw new Error('Source inventory item not found');

                const { data: existingDest, error: destFindErr } = await supabase
                    .from('inventorys')
                    .select('id, quantity')
                    .eq('name', srcItem.name)
                    .eq('type', srcItem.type)
                    .eq('model', srcItem.model)
                    .eq('vendor', srcItem.vendor)
                    .eq('region_id', destination_region_id)
                    .eq('warehouse_id', destination_warehouse_id)
                    .maybeSingle();
                if (destFindErr) throw destFindErr;

                if (existingDest) {
                    const { error: updDestErr } = await supabase
                        .from('inventorys')
                        .update({
                            quantity: (existingDest.quantity || 0) + quantity,
                        })
                        .eq('id', existingDest.id);
                    if (updDestErr) throw updDestErr;
                } else {
                    const newRow = {
                        name: srcItem.name,
                        type: srcItem.type,
                        model: srcItem.model,
                        vendor: srcItem.vendor,
                        attributes: srcItem.attributes || {},
                        image: srcItem.image,
                        quantity: quantity,
                        region_id: destination_region_id,
                        warehouse_id: destination_warehouse_id,
                        rack_id: null,
                        start_unit: null,
                        height: null,
                    };
                    const { error: insDestErr } = await supabase
                        .from('inventorys')
                        .insert([newRow]);
                    if (insDestErr) throw insDestErr;
                }
            }
        }
    }

    const { data, error } = await supabase
        .from('relocation_requests')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;

}