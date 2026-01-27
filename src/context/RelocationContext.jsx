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

export const getRelocationRequests = async (statuses, userId) => {
    let q = supabase
        .from('relocation_requests')
        .select(` 
            id, 
            inventory_id, 
            source_server_id, 
            destination_server_id, 
            destination_region_id, 
            destination_warehouse_id, 
            quantity, 
            status, 
            requested_by, 
            notes,
            created_at, 
            component:inventory_id (id, name, type, model, vendor), 
            source:source_server_id (id, name, type), 
            dest_server:destination_server_id (id, name, type), 
            requester:requested_by (id, name)
        `);

    if (Array.isArray(statuses)) q = q.in('status', statuses);
    else if (statuses) q = q.eq('status', statuses);
    if (userId) q = q.eq('requested_by', userId);
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
            quantity,
        } = req;

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
            // increase inventory stock and set region/warehouse
            // const { data: inv, error: invErr } = await supabase
            //     .from('inventorys')
            //     .select('quantity')
            //     .eq('id', inventory_id)
            //     .maybeSingle();

            // if (invErr) throw invErr;
            // const { error: invUpdErr } = await supabase
            //     .from('inventorys')
            //     .update({
            //         quantity: (inv?.quantity || 0) + quantity,
            //         region_id: destination_region_id,
            //         warehouse_id: destination_warehouse_id,
            //     })
            //     .eq('id', inventory_id);
            // if (invUpdErr) throw invUpdErr;

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

    const { data, error } = await supabase
        .from('relocation_requests')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;

}