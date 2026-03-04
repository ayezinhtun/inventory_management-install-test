import { supabase } from "../../supabase/supabase-client";


// Get all inventory types
export const getInventoryTypes = async () => {
    try {
        const { data, error } = await supabase
            .from('inventory_types')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching inventory types:', error);
        throw error;
    }
};

// Get single inventory type by ID
export const getInventoryType = async (id) => {
    try {
        const { data, error } = await supabase
            .from('inventory_types')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching inventory type:', error);
        throw error;
    }
};

// Create new inventory type 
export const createInventoryType = async (typeData) => {
    try {
        const { data, error } = await supabase
            .from('inventory_types')
            .insert([typeData])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating inventory type:', error);
        throw error;
    }
};


// Update inventory type 
export const updateInventoryType = async (id, typeData) => {
    try {
        const { data, error } = await supabase
            .from('inventory_types')
            .update(typeData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating inventory type:', error);
        throw error;
    }
};


// Delete Inventory type 
export const deleteInventoryType = async (id) => {
    try {
        const { data, error } = await supabase
            .from('inventory_types')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting inventory type:', error);
        throw error;
    }
}

// Validate inventory attributes based on type specifications 
export const validateInventoryAttributes = (type, attributes) => {
    const errors = [];

    if (!type || !type.specifications) {
        return errors;
    }

    const specs = type.specifications;

    for (const [attrName, rules] of Object.entries(specs)) {
        const value = attributes[attrName];

        // Check if required
        if (rules.required && (value === undefined || value === "")) {
            errors.push(`${rules.label || attrName.toUpperCase()} is required`);
            continue;
        }

        // Skip validation if field is empty and not required
        if (!value && !rules.required) {
            continue;
        }

        // Type validation 
        if (rules.type === 'number' && isNaN(Number(value))) {
            errors.push(`${rules.label || attrName.toUpperCase()} must be a number`);
        }

        // IP validation 
        if (rules.type === 'ip') {
            const ipRegex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
            if(!ipRegex.test(value)) {
                errors.push(`${rules.label || attrName.toUpperCase()} is not a valid IP address`);
            }
        }
    }


    return errors;
}