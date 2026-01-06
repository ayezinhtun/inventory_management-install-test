import { supabase } from "../../supabase/supabase-client";

export const createCustomer = async (customer) => {
    const {data, error} = await supabase
    .from('customers')
    .insert([customer])

    if(error) throw error;

    return data;
}

export const getCustomer = async () => {
    const {data, error} = await supabase
    .from('customers')
    .select('*')
    .order('created_at', {ascending: false});

    if(error) throw error;

    return data;
}

export const deleteCustomer = async (id) => {
    const {error} = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

    if(error) throw error;
} 

export const updateCustomer = async (id, values) => {
    const {data, error} = await supabase
    .from('customers')
    .update(values)
    .eq('id', id);

    if(error) throw error;

    return data;
}