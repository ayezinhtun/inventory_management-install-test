import { supabase } from "../../supabase/supabase-client";

export const getCustomerInventory = async () => {
    const { data, error } = await supabase
        .from('customer_sales')
        .select(` 
            id, 
            inventory_id, 
            customer_id, 
            quantity, 
            notes, 
            inventorys (
                id, 
                name, 
                serial_no, 
                type
            ), 
            customers (
                id, 
                company_name, 
                contact_person
            )
        `)
        .order('sold_at', { ascending: false })

    if (error) throw error;
    return data;
};

export const restoreSale = async (saleId, inventoryId, quantity ) => {
    try {
        //fetch current inventory quantity
        const {data: invData, error: invError} = await supabase
            .from("inventorys")
            .select("quantity, status")
            .eq("id", inventoryId)
            .single();

        if(invError) throw invError;

        const newQuantity = (invData?.quantity || 0) + quantity;

        // update inventory quantity and status
        const {error: updateError} = await supabase
            .from("inventorys")
            .update({
                quantity: newQuantity, 
                status: "active"
            })

            .eq("id", inventoryId);

        if(updateError) throw updateError;

        // Delete the sale record
        const {error: deleteError} = await supabase
            .from("customer_sales")
            .delete()
            .eq("id", saleId);

        if(deleteError) throw deleteError;

        return true;
    }catch(error) {
        console.error("Error restoring sale:", error);
        throw error;
    }
};