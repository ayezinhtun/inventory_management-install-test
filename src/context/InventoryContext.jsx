import { supabase } from "../../supabase/supabase-client";

export const InventoryCreate = async (inventorys) => {
    const { data, error } = await supabase
        .from('inventorys')
        .insert([inventorys])
        .select()

    if (error) throw error;

    return data;
}

export const fetchInventory = async () => {
    const { data, error } = await supabase
        .from('inventorys')
        .select(`
        id, 
        warehouse_id, 
        rack_id, 
        name,
        status,
        serial_no, 
        type, 
        model, 
        vendor, 
        start_unit, 
        height, 
        color, 
        notes, 
        attributes, 
        image, 
        racks(
            id, 
            name
        ), 
        warehouses(
            id,
            name
        )
    `)
        .order('created_at', { ascending: false })

    if (error) throw error;

    return data;
}

export const fetchInventoryById = async (id) => {
    const { data, error } = await supabase
        .from("inventorys")
        .select(`
                id, 
        warehouse_id, 
        rack_id, 
        name,
        status,
        serial_no, 
        type, 
        model, 
        vendor, 
        start_unit, 
        height, 
        color, 
        notes, 
        attributes, 
        image, 
        racks(
            id, 
            name
        ), 
        warehouses(
            id,
            name
        )    
    `)
        .eq("id", id)
        .single();

    if (error) throw error;
    return data;
};


export const deleteInventory = async (id) => {
    const { error } = await supabase
        .from('inventorys')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
