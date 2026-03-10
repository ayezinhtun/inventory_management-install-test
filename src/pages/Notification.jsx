import { MailOpen, Trash2 } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabase/supabase-client";
import { useUserProfiles } from "../context/UserProfileContext";
import { NotificationContext } from "../context/NotificationContext";
import { Spinner } from "flowbite-react";
import AppToast from "../components/toast/Toast";

export default function Notification() {
  const { profile } = useUserProfiles();
  const { notifications, readIds, reload, optimisticDelete, optimisticMarkRead } = useContext(NotificationContext);

  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(new Set());
  const [toast, setToast] = useState(null);

  console.log('Notifications in UI:', notifications);

  // helper: relative time
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
    return `${Math.floor(h / 24)} days ago`;
  };

  // Formatters when title is not provided by trigger (fallback)
  const prettyVerb = (n) => {
    const t = (n.type || '').toUpperCase();
    if (t === 'INSERT') return 'created';
    if (t === 'UPDATE') return n.status ? `changed status into ${n.status}` : 'updated';
    return 'updated';
  };
  const prettyTarget = (n) => {
    if (n.table_name === 'installation_requests') return 'install request';
    if (n.table_name === 'relocation_requests') return 'relocation request';
    if (n.table_name === 'inventory_requests') return 'inventory request';
    return 'request';
  };

  const prettyVerbForInsert = (n) => `${prettyTarget(n)} created`;
  const prettyVerbForUpdate = (n) =>
    n.status ? `changed ${prettyTarget(n)} status into ${n.status}` : `updated ${prettyTarget(n)}`;

  const notis = useMemo(() => {
    return (notifications || []).map((n) => {
      const actorName = n.actor?.name || n.requester?.name || 'Someone';
      const phrase =
        (n.type || '').toUpperCase() === 'INSERT'
          ? prettyVerbForInsert(n)
          : prettyVerbForUpdate(n);
      const fallbackTitle = `${actorName} ${phrase}`;
      return {
        id: n.id,
        title: n.title || fallbackTitle,   // prefer DB title; fallback to actorName + phrase
        date: n.created_at,
        isRead: readIds.has(n.id),
      };
    });
  }, [notifications, readIds]);
  const load = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      // context is authoritative; just trigger reload for safety
      await reload?.();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [profile?.id]);

  // mark single notification as read
  const markAsRead = async (notificationId) => {
    if (!profile?.id || !notificationId) return;
    if (pending.has(notificationId)) return;
    if (readIds.has(notificationId)) return;

    setPending((prev) => {
      const s = new Set(prev);
      s.add(notificationId);
      return s;
    });

    await supabase.from("notification_reads").insert({
      user_id: profile.id,
      notification_id: notificationId,
    });
    // update immediately (no refresh needed)
    optimisticMarkRead?.(notificationId);

    try {
      await supabase.from("notification_reads").insert({
        user_id: profile.id,
        notification_id: notificationId,
      });
      // Realtime in NotificationContext will add to readIds; no manual state update needed
    } catch (_) {
      // swallow; UI remains clickable
    } finally {
      setPending((prev) => {
        const s = new Set(prev);
        s.delete(notificationId);
        return s;
      });
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!profile?.id || !notificationId) return;
    if (pending.has(notificationId)) return;

    const isConfirmed = window.confirm("Are you sure you want to delete this notification?");
    if (!isConfirmed) return;

    setPending((prev) => {
      const s = new Set(prev);
      s.add(notificationId);
      return s;
    });

    try {
      await supabase.from("notification_deletions").insert({
        notification_id: notificationId,
        deleted_by: profile.id,
      });

      // Updte immediately (no refresh needed)
      optimisticDelete?.(notificationId);

      setToast({
        type: "success",
        message: "Notification deleted successfully!"
      });

    } catch (error) {
      console.error("Error deleting notification:", error);
      setToast({
        type: "error",
        message: "Failed to delete notification!"
      });
    } finally {
      setPending((prev) => {
        const s = new Set(prev);
        s.delete(notificationId);
        return s;
      })
    }
  }

  // mark all as read
  const markAllAsRead = async () => {
    if (!profile?.id) return;

    const unread = notis.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    setLoading(true);
    try {
      await supabase
        .from("notification_reads")
        .insert(
          unread.map((n) => ({
            user_id: profile.id,
            notification_id: n.id,
          }))
        );
      // Realtime will update readIds
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-auto">
        <div className="flex items-center justify-end py-3 border-b border-[#EAECF0] px-5 space-x-4">
          <div className="flex space-x-5">
            <div
              className="flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900"
              onClick={markAllAsRead}
            >
              <span>Mark As All Read</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg flex flex-col gap-y-4 py-2">
          {loading && (
            <div className="flex justify-center py-6">
              <Spinner size="lg" />
            </div>
          )}

          {!loading && notis.length === 0 && (
            <div className="text-center text-gray-500 py-6">
              No Notification Found
            </div>
          )}

          {!loading &&
            notis.map((noti, index) => {
              const disabled = noti.isRead || pending.has(noti.id);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between ps-4 gap-2"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-gray-600">{noti.title}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <p className="text-gray-400">
                      {toRelativeTime(noti.date)}
                    </p>

                    <div
                      className={`p-2 hover:bg-gray-100 hover:rounded-lg ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      onClick={() => !disabled && markAsRead(noti.id)}
                      title={
                        noti.isRead
                          ? 'Already read'
                          : pending.has(noti.id)
                            ? 'Marking...'
                            : 'Mark as read'
                      }
                    >
                      <MailOpen
                        className={
                          noti.isRead ? "text-gray-400" : "text-gray-600"
                        }
                      />
                    </div>

                    <div
                      className={`hover:bg-gray-100 hover:rounded-lg p-2 ${pending.has(noti.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() => !pending.has(noti.id) && deleteNotification(noti.id)}
                      title={pending.has(noti.id) ? 'Deleting...' : 'Delete notification'}
                    >
                      <Trash2 className="text-red-500" />
                    </div>

                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {toast && (
        <div className="fixed top-5 right-5 z-50">
          <AppToast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

    </div>
  );
}