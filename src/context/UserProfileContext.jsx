import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "../../supabase/supabase-client";

import { useAuth } from "./AuthContext";
import AppToast from "../components/toast/Toast";

const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
    const { user } = useAuth();

    const [profile, setProfile] = useState(null);

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [toast, setToast] = useState(null);

    const [profileLoading, setProfileLoading] = useState(true);

    // this is for to show user list in usermanagement
    const fetchUsers = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from("user_profile")
                .select("*")
                .eq("status", "active");

            if (error) throw error;

            setUsers(data || []);
        } catch (err) {
            console.error("Error fetching users:", err.message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }

    const updateUserRole = async (id, newRole) => {
        //backup current role
        const currentRole = users.find(u => u.id === id)?.role;

        // optimistic update
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));

        const { error } = await supabase
            .from("user_profile")
            .update({ role: newRole })
            .eq("id", id);

        if (error) {
            // rollback if faild, meaning when failed to place in the user with the old current role
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role: currentRole } : u));
            setToast({
                type: "error",
                message: "Failed to udpate role:" + error.message,
            })
            return false;
        }

        setToast({
            type: "success",
            message: "Role updated successfully"
        })

        return true;
    }

    //delete user
    // const deleteUser = async (id) => {
    //     if(!window.confirm("Are you sure to delete this user?")) return;
    //     const {error} = await supabase.from("user_profile").delete().eq("id", id);
    //     if(error) alert(error.message);
    //     else setUsers(prev => prev.filter(u => u.id !== id));
    // }

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure to delete this user?")) return;
        const { error } = await supabase
            .from("user_profile")
            .update({ status: "inactive" })
            .eq("id", id);

        if (error) {
            console.error(error);
            alert("Failed to delete user");
        } else {
            setUsers(prev => prev.filter(u => u.id !== id));
            alert("User marked as inactive");
        }
    }

    //for porfile page
    const fetchProfile = async () => {
        if (!user) {
            setProfile(null);
            setProfileLoading(false);
            return;
        }

        setProfileLoading(true);

        try {
            // Fetch main user profile
            const { data: profileData, error: profileError } = await supabase
                .from('user_profile')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;

            // Fetch assigned regions
            const { data: regionData, error: regionError } = await supabase
                .from('user_regions')
                .select('region_id')
                .eq('user_id', user.id);

            if (regionError) throw regionError;

            // Fetch assigned warehouses
            const { data: warehouseData, error: warehouseError } = await supabase
                .from('user_warehouses')
                .select('warehouse_id')
                .eq('user_id', user.id);

            if (warehouseError) throw warehouseError;

            // Merge assignments into profileData
            const profileWithAssignments = {
                ...profileData,
                assignments: {
                    regions: regionData?.map(r => r.region_id) || [],
                    warehouses: warehouseData?.map(w => w.warehouse_id) || []
                }
            };

            setProfile(profileWithAssignments);
        } catch (err) {
            console.error("Error fetching profile with assignments:", err);
            setProfile(null);
        }

        setProfileLoading(false);
    };


    // update profile name
    const updateProfileName = async (newName) => {
        if (!profile) return false;

        const { data, error } = await supabase
            .from('user_profile')
            .update({ name: newName })
            .eq('id', profile.id)
            .select()
            .single();

        if (error) {
            setToast({
                type: "error",
                message: "Failed to update name: " + error.message,
            })
            return false;
        }

        // setProfile(data);
        setProfile(prev => ({
            ...prev,
            ...data,
        }));
        setToast({
            type: "success",
            message: "Profile name updated successfully",
        }); return true;
    }

    //for update password
    // const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
    //     if (!profile) return { success: false, message: "No profile found" };

    //     if (!currentPassword || !newPassword || !confirmPassword) {
    //         return { success: false, message: "All fields are required" };
    //     }

    //     if (newPassword !== confirmPassword) {
    //         return { success: false, message: "New Password and ConfirmPassword do not match" };
    //     }

    //     // Re-authenticate
    //     const { error: signInError } = await supabase.auth.signInWithPassword({
    //         email: profile.email,
    //         password: currentPassword,
    //     });

    //     if (signInError) {
    //         return { success: false, message: "Current Password is incorrect" };
    //     }

    //     //update password
    //     const { error } = await supabase.auth.updateUser({ password: newPassword });

    //     if (error) return { success: false, message: error.message };

    //     return { success: true, message: "Password updated successfully!" };
    // }
    const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
        if (!profile) {
            setToast({ type: "error", message: "No profile found" });
            return false;
        }

        if (!currentPassword || !newPassword || !confirmPassword) {
            setToast({ type: "error", message: "All fields are required" });
            return false;
        }

        if (newPassword !== confirmPassword) {
            setToast({
                type: "error",
                message: "New Password and Confirm Password do not match",
            });
            return false;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: profile.email,
            password: currentPassword,
        });

        if (signInError) {
            setToast({
                type: "error",
                message: "Current Password is incorrect",
            });
            return false;
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            setToast({ type: "error", message: error.message });
            return false;
        }

        setToast({
            type: "success",
            message: "Password updated successfully",
        });

        return true;
    };


    // useEffect(() => {
    //     fetchUsers();
    //     fetchProfile();
    // }, [user]);

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchUsers();
        }
    }, [user?.id]);

    return (
        <UserProfileContext.Provider value={{ profile, profileLoading, users, loading, fetchUsers, updateUserRole, deleteUser, updateProfileName, updatePassword, toast, setToast }}>
            {children}

            {toast && (
                <div className="fixed top-5 right-5 z-50">
                    <AppToast
                        type={toast.type}
                        message={toast.message}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}
        </UserProfileContext.Provider>


    )




}

export const useUserProfiles = () => useContext(UserProfileContext);