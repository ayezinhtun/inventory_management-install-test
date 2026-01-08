import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserProfiles } from "../context/UserProfileContext";

export default function AdminRoute() {
    const { user, loading } = useAuth();
    const { profile } = useUserProfiles();

    if (loading) return null;

    if (!user) return <Navigate to="/login" replace />;

    if (profile?.role !== "admin") {
        return <Navigate to="/" replace />; 
    }

    return <Outlet />;
}
