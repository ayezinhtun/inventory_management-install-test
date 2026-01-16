import { supabase } from '../../supabase/supabase-client';

// Create a new install request
export const createInstallRequest = async (payload) => {
    // add initial status for PM approval
    const newPayload = {
        ...payload,
        status: 'pm_approve_pending'
    };

    const { data, error } = await supabase
        .from('installation_requests')
        .insert([newPayload])
        .select();
    if (error) throw error;
    return data;
}

// Get all requests (can filter by status or user)
export const getInstallRequests = async (status) => {
    let query = supabase
        .from('installation_requests')
        .select(`
            id, 
            inventory_id, 
            server_id,
            quantity, 
            notes, 
            requested_by, 
            status, 
            component:inventory_id (
                id,
                name,
                type,
                model,
                vendor,
                quantity
            ),
            server:server_id (
                id,
                name,
                type,
                rack_id,
                start_unit,
                height
            ) , 
            requester:requested_by(
                id, 
                name
            )

        `);

    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

// Update request status (approve, reject)
// Update request status (approve, reject, complete)
export const updateInstallRequestStatus = async (id, status, userId) => {
  if (!id) throw new Error("Request ID is required");

  // 1️⃣ Fetch request
  const { data: request, error: fetchError } = await supabase
    .from("installation_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!request) throw new Error("Request not found");

  const payload = { status };

  // 2️⃣ Approvals
  if (status === "pm_approved" && userId) payload.pm_approved_by = userId;
  if (status === "admin_approved" && userId) payload.admin_approved_by = userId;
  if (status === "rejected" && userId) payload.rejected_by = userId;

  // 3️⃣ Timestamps
  if (status === "pm_approved") payload.pm_approved_at = new Date().toISOString();
  if (status === "admin_approved") payload.admin_approved_at = new Date().toISOString();
  if (status === "rejected") payload.rejected_at = new Date().toISOString();
  if (status === "complete") payload.completed_at = new Date().toISOString();

  // 4️⃣ Handle complete (installation)
  if (status === "complete") {
    if (!userId) throw new Error("Installer must be logged in");

    const { inventory_id, server_id, quantity, attributes } = request;

    // 🔹 Check if component already installed on this server
    const { data: existing, error: existingError } = await supabase
      .from("installations")
      .select("id, quantity, attributes")
      .eq("server_id", server_id)
      .eq("inventory_id", inventory_id)
      .maybeSingle();

    if (existingError && existingError.code !== "PGRST116") throw existingError;

    if (existing) {
      // ✅ Update existing installation quantity
      const updatedAttributes = { ...existing.attributes, ...attributes };
      const { error: updateError } = await supabase
        .from("installations")
        .update({
          quantity: existing.quantity + quantity,
          attributes: updatedAttributes,
          installed_at: new Date().toISOString(),
          installed_by: userId,
        })
        .eq("id", existing.id);
      if (updateError) throw updateError;
    } else {
      // ✅ Insert new installation record
      const { error: installError } = await supabase
        .from("installations")
        .insert({
          inventory_id,
          server_id,
          quantity,
          installed_by: userId,
          attributes: attributes || {},
        });
      if (installError) throw installError;
    }

    // 5️⃣ Reduce inventory quantity
    const { data: invData, error: invError } = await supabase
      .from("inventorys")
      .select("quantity")
      .eq("id", inventory_id)
      .maybeSingle();
    if (invError) throw invError;

    const newQuantity = invData.quantity - quantity;
    if (newQuantity < 0) throw new Error("Not enough inventory quantity");

    const { error: updateInvError } = await supabase
      .from("inventorys")
      .update({ quantity: newQuantity })
      .eq("id", inventory_id);
    if (updateInvError) throw updateInvError;
  }

  // 6️⃣ Update installation request status
  const { data, error } = await supabase
    .from("installation_requests")
    .update(payload)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;

  return data;
};




// Get all components (RAM, CPU, Storage)
export const getComponents = async () => {
    const { data, error } = await supabase
        .from('inventorys')
        .select('*')
        .in('type', ['ram', 'cpu', 'storage']);
    if (error) throw error;
    return data;
}

// Get all servers
export const getServers = async () => {
    const { data, error } = await supabase
        .from('inventorys')
        .select('*')
        .eq('type', 'server');
    if (error) throw error;
    return data;
}