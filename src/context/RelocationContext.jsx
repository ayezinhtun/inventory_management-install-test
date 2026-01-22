import { createContext, useContext, useId, useState } from "react";
import { supabase } from "../../supabase/supabase-client";

const RelocationContext = createContext(); 

export const useRelocation = () => useContext(RelocationContext); 

export const RelocationProvider = ({children}) => {
    const [relocations, setRelocations] = useState([]); 
    const [installedComponents, setInstalledComponents] = useState([]); 
    const [loading, setLoading] = useState(false); 


    const fetchInstalledComponents = async (type = "ram") => {
        setLoading(true); 

        const {data, error} = await supabase
            .from("installations")
            .select(` 
                id, 
                inventory_id , 
                server_id, 
                warehouse_id, 
                quantity, 
                attributes, 
                inventorys (
                    id, 
                    name, 
                    type
                )    
            `); 

        if(!error) {
            const filtered = (data || []).filter(
                i => i.inventorys?.type === type
            ); 

            setInstalledComponents(filtered); 
        }

        setLoading(false); 
    }; 


    // fetch relocation requests(approval / history)
    const fetchRelocations = async (filter = {}) => {
        setLoading(true); 

        let query = supabase
            .from("relocation_requests")
            .select(` 
                *, 
                installations (
                    inventory_id , 
                    inventorys (name, type)
                )    
            `); 

        Object.entries(filter).forEach(([key, vlaue]) => {
            query = query.eq(key, value); 
        }); 

        const {data, error} = await query; 

        if(!error) setRelocations(data || []); 
        setLoading(false);
    }; 

    // create relocation request (Engineer)
    const createRelocation = async (payload) => {
        const {data, error} = await supabase
            .from("relocation_requests")
            .insert({
                ...payload, 
                status: "pm_approve_pending", 
                created_at: new Date().toISOString()
            })

            .select() 
            .maybeSingle(); 

        if(error) throw error; 
        return data; 
    }

    // update relocation stauts (PM, Admin, Physical)
    const updateRelocationStatus = async (id, status, userId) => {
        const payload = {status}; 

        if(status === "pm_approved") {
            payload.pm_approved_by = useId; 
            payload.pm_approved_at = new Date().toISOString();
        }

        if(status === "admin_approved") {
            payload.admin_approved_by = userId; 
            payload.admin_approved_at = new Date().toISOString(); 
        }

        if(status === "complete") {
            payload.completed_by = userId; 
            payload.completed_at = new Date().toISOString(); 
        }

        const {data, error} = await supabase
            .from("relocation_requests")
            .update(payload)
            .eq("id", id)
            .select() 
            .maybeSingle(); 

        if(error) throw error; 
        return data; 
    };

    return (
        <RelocationContext.Provider
            value={{
                relocations, 
                installedComponents, 
                loading, 
                fetchInstalledComponents, 
                fetchRelocations, 
                createRelocation, 
                updateRelocationStatus
            }}
        >
            {children}
        </RelocationContext.Provider>
    )
}