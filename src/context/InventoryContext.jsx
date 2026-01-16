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
        region_id, 
        warehouse_id, 
        rack_id, 
        name,
        status,
        serial_no, 
        type, 
        model, 
        vendor, 
        quantity,
        start_unit, 
        height, 
        color, 
        notes, 
        attributes, 
        image, 
        regions(
            id,
            name 
        ),
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
        region_id,
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
        quantity,
        racks(
            id, 
            name
        ), 
        warehouses(
            id,
            name
        ), 
        regions(
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


export const fetchInstalledComponents = async (serverId) => {
  const { data, error } = await supabase
    .from("installations")
    .select(`
      id,
      inventory_id, 
      server_id, 
      quantity,
      attributes,
      installed_by,
      installed_at,
      component:inventory_id (
        id,
        name,
        type,
        model,
        vendor
      )
      
    `)
    .eq("server_id", serverId);

  if (error) throw error;

  // sort by type in frontend
  return data.sort((a, b) => a.component.type.localeCompare(b.component.type));
};
