import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../supabase/supabase-client';
import { useUserProfiles } from './UserProfileContext';

export const NotificationContext = createContext(null);
export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const { profile } = useUserProfiles();
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());

  // Derive assigned region IDs from profile.assignments.regions
  const assignedRegionStrings = useMemo(
    () => (profile?.assignments?.regions || []).map(String),
    [profile?.assignments?.regions]
  );

  // Role-based visibility
  const visibleFilter = (n) => {
    const role = (profile?.role || '').toLowerCase();
    if (role === 'admin') {
      const s = (n.status || '').toLowerCase();
      return ['pm_approved', 'admin_approved', 'complete'].includes(s);
    }
    if (role === 'pm') {
      if (!assignedRegionStrings.length) return false;
      return assignedRegionStrings.includes(String(n.region_id));
    }
    // engineer: actor or requester
    return n.actor_user_id === profile?.id || n.requested_by === profile?.id;
  };

  const load = async () => {
    if (!profile?.id) return;

    // One query with embedded names using your FK constraints
    const { data: notifData, error: notifErr } = await supabase
      .from('notifications')
      .select(`
    id,
    table_name,
    entity_id,
    type,
    title,
    body,
    actor_user_id,
    requested_by,
    region_id,
    status,
    created_at,
    actor:user_profile!notifications_actor_user_fk ( id, name ),
    requester:user_profile!notifications_requested_by_fk ( id, name )
  `)
      .order('created_at', { ascending: false })
      .limit(200);

    if (notifErr) {
      console.error('notifications load error', notifErr);
      return;
    }

    const { data: readsData, error: readsErr } = await supabase
      .from('notification_reads')
      .select('notification_id')
      .eq('user_id', profile.id);

    if (readsErr) {
      console.error('notification_reads load error', readsErr);
      return;
    }

    const readSet = new Set((readsData || []).map((r) => r.notification_id));
    setNotifications((notifData || []).filter(visibleFilter));
    setReadIds(readSet);
  };

  useEffect(() => {
    load();
  }, [profile?.id, profile?.role, JSON.stringify(assignedRegionStrings)]);

  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase.channel('notifications-live');

    // New notifications (INSERT). Payload won't include embedded names; rely on title from trigger.
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      (payload) => {
        const n = payload.new;
        if (visibleFilter(n)) {
          setNotifications((prev) => [n, ...prev].slice(0, 200));
        }
      }
    );

    // New read receipts for this user
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notification_reads', filter: `user_id=eq.${profile.id}` },
      (payload) => {
        setReadIds((prev) => {
          const s = new Set(prev);
          s.add(payload.new.notification_id);
          return s;
        });
      }
    );

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, profile?.role, JSON.stringify(assignedRegionStrings)]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !readIds.has(n.id)).length;
  }, [notifications, readIds]);

  const optimisticMarkRead = (notificationId) => {
    setReadIds(prev => {
      const s = new Set(prev);
      s.add(notificationId);
      return s;
    });
  };

  const value = useMemo(
    () => ({
      notifications,
      readIds,
      unreadCount,
      reload: load,
      optimisticMarkRead,
    }),
    [notifications, readIds, unreadCount, optimisticMarkRead]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}