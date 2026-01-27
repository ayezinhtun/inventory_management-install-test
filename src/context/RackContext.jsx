import {supabase} from '../../supabase/supabase-client'

export const createRack = async(racks) => {
    const {data, error} = await supabase
    .from('racks')
    .insert([racks])
    .select()

    if(error) throw error;

    return data;
}

export const fetchRack = async() => {
    const {data, error} = await supabase
    .from('racks')
    .select(`
        id,
        name,
        size_u,
        type,
        status,
        color,
        notes,
        warehouse_id,
        warehouses (
            id,
            name,
            region_id,
            regions (
                id,
                name
            )
        )
    `)
    .order('created_at', {ascending: false})

    if(error) throw error;

    return data;
}

export const deleteRack = async (id) => {
    const {error} = await supabase
    .from('racks')
    .delete()
    .eq('id', id)

    if(error) throw error;
}


export const updateRack = async(id, values) => {
    const {data, error} = await supabase
    .from('racks')
    .update(values)
    .eq('id', id)

    if(error) throw error;

    return data;
}


export const fetchRackbyWarehouse = async(warehouseId) => {
    const {data, error} = await supabase
    .from('racks')
    .select(`
        id,
        name,
        size_u,
        type,
        status,
        color,
        notes,
        warehouse_id,
        warehouses (
            id,
            name,
            region_id,
            regions (
                id,
                name
            )
        )
    `)
    .eq('warehouse_id', warehouseId) 
    .order('created_at', {ascending: false})

    if(error) throw error;

    return data;
}