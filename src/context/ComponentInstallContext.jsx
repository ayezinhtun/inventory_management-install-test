import { supabase } from '../../supabase/supabase-client';

// CREATE a new installation request
export const createInstallRequest = async (request) => {
    const { data, error } = await supabase
        .from('installation_requests')
        .insert([request]);

    if (error) throw error;
    return data;
}

// GET all components (RAM, CPU, Storage) with quantity > 0
export const getComponents = async () => {
    const { data, error } = await supabase
        .from('inventorys')
        .select('*')
        .in('type', ['ram', 'cpu', 'storage'])
        .gt('quantity', 0);

    if (error) throw error;
    return data;
}

// GET all servers
export const getServers = async () => {
    const { data, error } = await supabase
        .from('inventorys')
        .select('*')
        .eq('type', 'server');

    if (error) throw error;
    return data;
}
