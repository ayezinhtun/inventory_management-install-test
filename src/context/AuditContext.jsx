import { supabase } from '../../supabase/supabase-client';

export async function getAuditRowsForUI({ limit = 200, table = "", subjectId = "" } = {}) {
  const { data: rows, error } = await supabase
    .from("audit_logs")
    .select(`
      id, 
      executed_at,
      table_name,
      action,
      row_id_text,
      actor_uid,
      actor_email,
      old_data,
      new_data,
      changed_cols
    `)
    .order("executed_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  const filtered = (rows ?? []).filter((r) => {
    if (table && r.table_name !== table) return false;
    if (subjectId && r.row_id_text !== subjectId) return false;
    return true;
  });

  // Resolve user display name/email
  const ids = Array.from(new Set(filtered.map((r) => r.actor_uid).filter(Boolean)));
  let profileById = {};
  if (ids.length > 0) {
    let profiles = null;
    {
      const res = await supabase
        .from("user_profile") // change to 'profiles' if that's your table
        .select("id, name, email")
        .in("id", ids);
      profiles = res.data;
      if ((!profiles || profiles.length === 0) && res.error) {
        const fall = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", ids);
        profiles = fall.data || [];
      }
    }
    if (profiles && profiles.length > 0) {
      profileById = profiles.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
    }
  }

  // Helper to derive a human label for the specific row (e.g., region name)
  const deriveEntityLabel = (r) => {
    const n = r?.new_data || {};
    const o = r?.old_data || {};
    // Prefer common name fields
    const label =
      n.name ?? o.name ??
      n.title ?? o.title ??
      n.code ?? o.code ??
      n.slug ?? o.slug ??
      r.row_id_text ?? "-";
    return String(label);
  };

  const entitySingular = (tableName) => {
    // simple table->entity mapping (override as needed)
    if (tableName === "regions") return "region";
    if (tableName === "warehouses") return "warehouse";
    if (tableName === "racks") return "rack";
    return tableName?.replace(/_/g, " ") || "item";
  };

  const describe = (r) => {
    const item = deriveEntityLabel(r);
    const ent = entitySingular(r.table_name);
    if (r.action === "INSERT") return `Created ${ent} "${item}"`;
    if (r.action === "DELETE") return `Deleted ${ent} "${item}"`;
    if (r.action === "UPDATE") {
      const cols = (r.changed_cols || []).join(", ");
      return cols ? `Updated ${ent} "${item}" (${cols})` : `Updated ${ent} "${item}"`;
    }
    return `${r.action} ${ent} "${item}"`;
  };

  // Map to your UI row shape
  const uiRows = filtered.map((r) => {
    const prof = r.actor_uid ? profileById[r.actor_uid] : null;
    const displayName = prof?.name || "-";
    const email = prof?.email || r.actor_email || "-";
    return {
      id: r.id, 
      table_name: r.table_name, 
      row_id_text: r.row_id_text, 
      name: displayName,            // who did it
      email,                        // email of who did it
      action: describe(r),          // e.g., Created region "Yangon"
      date: r.executed_at,          // when
    };
  });

  return uiRows;
}