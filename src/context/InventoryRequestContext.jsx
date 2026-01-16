import { supabase } from "../../supabase/supabase-client";

export const createInventoryRequest = async (request) => {
    const {data, error} = await supabase
        .from('inventory_requests')
        .insert([request])
        .select()
        .single();

    if(error) throw error;
    return data;
}

export const fetchInventoryRequestsbyUser = async (userId) => {
    const {data, error} = await supabase
        .from('inventory_requests')
        .select(`
            id, 
            item_name, 
            quantity, 
            notes, 
            status, 
            image, 
            created_at   
        `)
        .eq('requester_id', userId)
        .order('created_at', {ascending: false});


        if(error) throw error;
        return data;
}

export const fetchAllInventoryRequest = async () => {
    const {data, error} = await supabase
        .from('inventory_requests')
        .select(`
            id, 
            item_name, 
            quantity, 
            notes, 
            status, 
            image, 
            created_at, 
            requester:user_profile (
                id, 
                name, 
                email
            )
        `)
        .order('created_at', {ascending: false});

    if(error) throw error;
    return data;
}

export const updateRequestStatus = async (id, status) => {
    const {data, error} = await supabase
        .from('inventory_requests')
        .update({status})
        .eq('id', id)
        .select()
        .single();

    if(error) throw error;
    return data;
}

export const updateInventoryRequest = async (id, payload) => {
    const {data, error} = await supabase
        .from("inventory_requests")
        .update(payload)
        .eq("id", id);

    if(error) throw error;
    return data;
}


export const fetchInventoryRequestById = async (id) => {
    const { data, error } = await supabase
        .from("inventory_requests")
        .select("*")
        .eq("id", id)
        .single(); 

    if (error) throw error;
    return data;
};
