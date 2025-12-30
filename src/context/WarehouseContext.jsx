import { data } from "react-router-dom";
import { supabase } from "../../supabase/supabase-client";

export const createWarehouse = async (warehouse) => {
    const {data, error} = await supabase
        .from('warehouses')
        .insert([warehouse])
        .select();

    if(error) throw error;

    return data;
}

export const getWarehouse = async () => {
    const {data, error} = await supabase
        .from('warehouses')
        .select(`
            id,
            name,
            description,
            region_id,
            regions(name)
        `)
        .order('created_at', {ascending: false})

    if(error) throw error;

    return data;
}

export const deleteWarehouse = async (id) => {
    const {error} = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id)
    
    if(error) throw error;
}

export const updateWarehouse = async(id, values) => {
    const {data, error} = await supabase
        .from('warehouses')
        .update(values)
        .eq('id', id)
    
    if(error) throw error;
    return data;
}