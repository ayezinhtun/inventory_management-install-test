import { supabase } from '../../supabase/supabase-client';

export const createRegion = async (region) => {
    const {data, error} = await supabase
        .from('regions')
        .insert([region])
    
    if(error) throw error;

    return data;
}

export const getRegion = async () => {
    const {data, error} = await supabase
        .from('regions')
        .select('*')
        .order('created_at', {ascending: false});

    if(error) throw error;

    return data;
}



export const deleteRegion = async (id) => {
    const {error} = await supabase
        .from('regions')
        .delete()
        .eq('id', id);
    
    if(error) throw error;
}


export const updateRegion = async (id, values) => {
    const {data, error} = await supabase
        .from('regions')
        .update(values)
        .eq('id', id);
    
    if(error) throw error;
    return data;
}


