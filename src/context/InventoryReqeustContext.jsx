import { supabase } from "../../supabase/supabase-client";

export const createInventoryRequest = async (request) => {
    const {data, error} = await supabase
        .from('inventory_requests')
        .insert([request])
        .select()
        .single()

        if(error) throw error;

        return data;
};