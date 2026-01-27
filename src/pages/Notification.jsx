import { Check, CirclePlus, Delete, Dot, Download, Edit, ListFilter, Mail, MailOpen, MapPin, Pen, Search, Trash2 } from "lucide-react"
import { useEffect, useState } from "react";
import { getAuditRowsForUI } from "../context/AuditContext";
import { supabase } from "../../supabase/supabase-client";
import { useUserProfiles } from "../context/UserProfileContext";

export default function Notification() {

    const { profile } = useUserProfiles();
    const [notis, setNotis] = useState([]);

    const toRelativeTime = (iso) => {
        if (!iso) return "-";
        const now = Date.now();
        const t = new Date(iso).getTime();
        const diff = Math.max(0, Math.floor((now - t) / 1000));
        if (diff < 5) return "Just now";
        if (diff < 60) return `${diff}s ago`;
        const m = Math.floor(diff / 60);
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        const d = Math.floor(h / 24);
        return `${d} days ago`;
    };

    const load = async () => {
        try {
            const [installEvents, relocationEvents] = await Promise.all([
                getAuditRowsForUI({ limit: 150, table: "installation_requests" }),
                getAuditRowsForUI({ limit: 150, table: "relocation_requests" }),
            ]);

            let filteredInstallEvents = installEvents || [];
            let filteredRelocationEvents = relocationEvents || [];

            if (profile?.role === "admin") {
                filteredInstallEvents = filteredInstallEvents.filter(
                    (r) => r.status === "pm_approved" || r.status === "admin_approved" || r.status === "complete" || r.status === "rejected"
                );

                filteredRelocationEvents = filteredRelocationEvents.filter(
                    (r) => r.status === "pm_approved" || r.status === "admin_approved" || r.status === "complete" || r.status === "rejected"
                );
            } else if (profile?.role === "pm") {
                filteredInstallEvents = filteredInstallEvents.filter(
                    (r) => r.status === "pm_approve_pending" || r.status === "rejected" || r.status === "complete"
                );
                filteredRelocationEvents = filteredRelocationEvents.filter(
                    (r) => r.status === "pm_approve_pending" || r.status === "rejected" || r.status === "complete"
                );
            } else if (profile?.role === "engineer") {
                filteredInstallEvents = filteredInstallEvents.filter(
                    (r) => r.user_id === profile.id && (r.status === "rejected" || r.status === "complete")
                );
                filteredRelocationEvents = filteredRelocationEvents.filter(
                    (r) => r.user_id === profile.id && (r.status === "rejected" || r.status === "complete")
                );
            }


            // fetch install details (component + server) using audit row_id_text as the install request id
            const installIds = Array.from(new Set((filteredInstallEvents || []).map(r => r.row_id_text).filter(Boolean)));
            let installDetailById = {};
            if (installIds.length > 0) {
                const { data: installRows } = await supabase
                    .from("installation_requests")
                    .select(`
          id,
          component:inventory_id ( name ),
          server:server_id ( name )
        `)
                    .in("id", installIds);
                if (Array.isArray(installRows)) {
                    installDetailById = installRows.reduce((acc, row) => {
                        acc[row.id] = {
                            compName: row?.component?.name || "-",
                            serverName: row?.server?.name || "warehouse",
                        };
                        return acc;
                    }, {});
                }
            }

            // get user's read receipts
            let readIds = new Set();
            if (profile?.id) {
                const { data: reads, error } = await supabase
                    .from("notification_reads")
                    .select("audit_id")
                    .eq("user_id", profile.id);
                if (!error && Array.isArray(reads)) {
                    readIds = new Set(reads.map(r => r.audit_id));
                }
            }

            // map install rows to your exact noti shape, keeping internal fields for read state
            const installNotis = (filteredInstallEvents || []).map(r => {
                const d = installDetailById[r.row_id_text] || {};
                const comp = d.compName || "-";
                const server = d.serverName || "warehouse";
                const who = r.name || "-";
                return {
                    _auditId: r.id, // internal for mark-as-read
                    title: `${who} requests to install ${comp} into ${server}`,
                    Date: toRelativeTime(r.date),
                    _sortDate: r.date,
                    _isRead: readIds.has(r.id),
                };
            });

            // keep relocation generic (optional)
            const relocationNotis = (filteredRelocationEvents || []).map(r => ({
                _auditId: r.id,
                title: `${r.name || "-"} ${r.action} (relocation)`,
                Date: toRelativeTime(r.date),
                _sortDate: r.date,
                _isRead: readIds.has(r.id),
            }));

            const merged = [...installNotis, ...relocationNotis]
                .sort((a, b) => new Date(b._sortDate) - new Date(a._sortDate));

            setNotis(merged);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { load(); }, [profile?.id]);

    // Realtime: refresh on new notification rows (optional, for auto-update)
    useEffect(() => {
        const channel = supabase
            .channel("audit-realtime")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "audit_logs" },
                (payload) => {
                    const t = (payload?.new?.table_name || "").toLowerCase();
                    if (t === "installation_requests" || t === "relocation_requests") {
                        load();
                    }
                }
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);




    const markAsRead = async (auditId) => {
        if (!profile?.id || !auditId) return;
        try {
            await supabase.from("notification_reads").insert({
                user_id: profile.id,
                audit_id: auditId
            });
            // Optimistic UI update
            setNotis(prev => prev.map(n => n._auditId === auditId ? { ...n, _isRead: true } : n));
        } catch (e) {
            // ignore duplicates (unique constraint)
            setNotis(prev => prev.map(n => n._auditId === auditId ? { ...n, _isRead: true } : n));
        }
    };

    const currentNotis = notis;

    return (
        <div>

            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-auto">
                <div className="flex items-center justify-end py-3 border-b border-[#EAECF0] px-5 space-x-4">

                    <div className="flex space-x-5">

                        <div
                            className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 hover:border-none hover:outline-none'
                        >
                            <span>Mark As All Read</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg flex flex-col gap-y-2 py-2">

                    {currentNotis.map((noti, index) => {
                        return (
                            <div key={index} className="flex items-center justify-between px-4">
                                <div className="flex items-center gap-2">
                                    <Dot />
                                    <p className="text-gray-600">{noti.title}</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <p className="text-gray-400">
                                        {noti.Date}
                                    </p>
                                    <div
                                        className="p-2 hover:bg-gray-100 hover:rounded-lg cursor-pointer relative group inline-block"
                                        onClick={() => markAsRead(noti._auditId)}
                                        title="Mark as read"
                                    >
                                        <MailOpen className={noti._isRead ? "text-gray-400" : "text-gray-600"} />
                                    </div>
                                    <div className="hover:bg-gray-100 hover:rounded-lg p-2">
                                        <Trash2 className="text-red-500" />
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                </div>


            </div>


        </div>
    )
}