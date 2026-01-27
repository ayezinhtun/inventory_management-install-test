import { supabase } from "../../supabase/supabase-client";

export const reservedStock = async ({ inventory_id, quantity, notes }) => {
    // get current inventory quantity
    const {data: inventory, error} = await supabase
        .from("inventorys")
        .select("id, quantity")
        .eq("id", inventory_id)
        .single();

        if(error) throw error;

        if(inventory.quantity < quantity) throw new Error("Not enough stock to reserve");


        // Decrease inventory 
        const {error: invError} = await supabase
            .from("inventorys")
            .update({quantity: inventory.quantity - quantity})
            .eq('id', inventory.id);
        if(invError) throw invError;

        // insert reserved stock
        const {error: resError} = await supabase
            .from("reserved_stocks")
            .insert([{ inventory_id, quantity, notes }]);

        if(resError) throw resError;
};

// fetch reserved stocks with inventory info 
export const fetchReservedStocks = async () => {
    const {data, error} = await supabase
        .from("reserved_stocks")
        .select(` 
            id, 
            quantity, 
            notes, 
            inventory: inventory_id (
                id, 
                name
            )
        `)
        .order("created_at", {ascending: false});

        if(error) throw error;
        return data;
};


// active reserved stock - increase inventory quantity - delete reserved stock row
export const activatedReservedStock = async (reserved) => {
    const inventory_id = reserved.inventory.id; 

    // get current inventory 
    const {data: inventory, error} = await supabase
        .from("inventorys")
        .select("id, quantity")
        .eq("id", inventory_id)
        .single();

    if(error) throw error;

    // Increase inventory
    const {error: invError} = await supabase
        .from("inventorys")
        .update({quantity: inventory.quantity + reserved.quantity})
        .eq("id", inventory.id);

    if(invError) throw invError;

    // delete reserved stock row
    const {error: resError} = await supabase
        .from('reserved_stocks')
        .delete()
        .eq("id", reserved.id);
    
    if(resError) throw resError;
}