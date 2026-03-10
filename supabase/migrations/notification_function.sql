-- Update relocation trigger
CREATE OR REPLACE FUNCTION notify_relocation_requests()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
    approver_name TEXT;
    action_title TEXT;
    actor_id UUID;
BEGIN
    -- Get user name
    SELECT name INTO user_name FROM user_profile WHERE id = NEW.requested_by LIMIT 1;
    
    -- Handle different actions
    IF TG_OP = 'INSERT' THEN
        action_title := user_name || ' create relocation request';
        actor_id := NEW.requested_by;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Get approver name
        IF NEW.status = 'pm_approved' THEN
            SELECT name INTO approver_name FROM user_profile WHERE id = NEW.pm_approved_by LIMIT 1;
            action_title := approver_name || ' change pm_approved status in relocation request';
            actor_id := NEW.pm_approved_by;
        ELSIF NEW.status = 'admin_approved' THEN
            SELECT name INTO approver_name FROM user_profile WHERE id = NEW.admin_approved_by LIMIT 1;
            action_title := approver_name || ' change admin_approved status in relocation request';
            actor_id := NEW.admin_approved_by;
        ELSIF NEW.status = 'rejected' THEN
            SELECT name INTO approver_name FROM user_profile WHERE id = NEW.rejected_by LIMIT 1;
            action_title := approver_name || ' rejected relocation request';
            actor_id := NEW.rejected_by;
        ELSIF NEW.status = 'complete' THEN
            -- Use completed_by field for completion
            SELECT name INTO approver_name FROM user_profile WHERE id = NEW.completed_by LIMIT 1;
            action_title := approver_name || ' change complete status in relocation request';
            actor_id := NEW.completed_by;  -- Use completed_by, not pm_approved_by
        ELSE
            action_title := user_name || ' changed status in relocation request';
            actor_id := NEW.requested_by;
        END IF;
    END IF;
    
    -- Insert notification
    INSERT INTO notifications (
        table_name,
        entity_id,
        type,
        title,
        actor_user_id,
        requested_by,
        region_id,
        status
    ) VALUES (
        'relocation_requests',
        NEW.id::text,
        TG_OP,
        action_title,
        actor_id,
        NEW.requested_by,
        NEW.destination_region_id,
        NEW.status
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update installation trigger
CREATE OR REPLACE FUNCTION notify_installation_requests()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
    approver_name TEXT;
    action_title TEXT;
    actor_id UUID;
BEGIN
    -- Get user name
    SELECT name INTO user_name FROM user_profile WHERE id = NEW.requested_by LIMIT 1;
    
    -- Handle different actions
    IF TG_OP = 'INSERT' THEN
        action_title := user_name || ' create installation request';
        actor_id := NEW.requested_by;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Get approver name
        IF NEW.status = 'pm_approved' THEN
            SELECT name INTO approver_name FROM user_profile WHERE id = NEW.pm_approved_by LIMIT 1;
            action_title := approver_name || ' change pm_approved status in installation request';
            actor_id := NEW.pm_approved_by;
        ELSIF NEW.status = 'admin_approved' THEN
            SELECT name INTO approver_name FROM user_profile WHERE id = NEW.admin_approved_by LIMIT 1;
            action_title := approver_name || ' change admin_approved status in installation request';
            actor_id := NEW.admin_approved_by;
        ELSIF NEW.status = 'rejected' THEN
    SELECT name INTO approver_name FROM user_profile WHERE id = NEW.rejected_by LIMIT 1;
    action_title := approver_name || ' rejected installation request';
    actor_id := NEW.rejected_by;
        ELSIF NEW.status = 'complete' THEN
            -- Use completed_by field for completion
            SELECT name INTO approver_name FROM user_profile WHERE id = NEW.completed_by LIMIT 1;
            action_title := approver_name || ' change complete status in installation request';
            actor_id := NEW.completed_by;  -- Use completed_by, not pm_approved_by
        ELSE
            action_title := user_name || ' changed status in installation request';
            actor_id := NEW.requested_by;
        END IF;
    END IF;
    
    -- Insert notification
    INSERT INTO notifications (
        table_name,
        entity_id,
        type,
        title,
        actor_user_id,
        requested_by,
        region_id,
        status
    ) VALUES (
        'installation_requests',
        NEW.id::text,
        TG_OP,
        action_title,
        actor_id,
        NEW.requested_by,
        NEW.destination_region_id,
        NEW.status
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers first
DROP TRIGGER IF EXISTS trg_notify_relocation_requests ON relocation_requests;
DROP TRIGGER IF EXISTS trg_notify_installation_requests ON installation_requests;

-- Now recreate the updated triggers
CREATE TRIGGER trg_notify_relocation_requests
AFTER INSERT OR UPDATE
ON relocation_requests
FOR EACH ROW
EXECUTE FUNCTION notify_relocation_requests();

CREATE TRIGGER trg_notify_installation_requests
AFTER INSERT OR UPDATE
ON installation_requests
FOR EACH ROW
EXECUTE FUNCTION notify_installation_requests();




-- Add notification_deletions table
ALTER PUBLICATION supabase_realtime ADD TABLE notification_deletions;

-- Add the source tables that trigger notifications
ALTER PUBLICATION supabase_realtime ADD TABLE installation_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE relocation_requests;

-- Check if this fixes it
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';