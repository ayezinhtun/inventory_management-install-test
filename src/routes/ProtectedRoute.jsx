import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useUserProfiles } from "../context/UserProfileContext";
import { Spinner } from "flowbite-react";

export default function ProtectedRoute() {
    const { user, loading: authLoading } = useAuth();
    const { profile, profileLoading } = useUserProfiles();

    if (authLoading || profileLoading) {
        return (
            <div className="fixed inset-0 flex justify-center items-center ">
                <Spinner
                    aria-level="Loading..."
                    size="xl"
                    color="info"
                />
            </div>
        )
    }
    

    if (!user) {
        return <Navigate to="/login" replace />
    }

    const role = profile?.role;
    const regionsCount = profile?.assignments?.regions?.length || 0;
    const warehousesCount = profile?.assignments?.warehouses?.length || 0;

    // Admin always allowed
    if (role === "admin") {
        return <Outlet />;
    }

    // PM, PC, Engineer need at least 1 region and 1 warehouse
    if ((role === "engineer" || role === "PM" || role === "PC") && (regionsCount === 0 || warehousesCount === 0)) {
        return <Navigate to="/pending" replace />;
    }

    return <Outlet />;
}