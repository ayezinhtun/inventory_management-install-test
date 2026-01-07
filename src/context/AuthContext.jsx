import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from '../../supabase/supabase-client';
import { data } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    // to check have been login or signup (meaning in the session does have user or not)
    useEffect(() => {
        // get user from session and set into user usestate
        supabase.auth.getSession().then(({data}) => {
            setUser(data.session?.user || null);
            setLoading(false);
        });

        // to update user when login, logout, signup

       const {data: listener} = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
       });


        return () => listener.subscription.unsubscribe();
    }, []);




    // for signup
    const signUp = async ({ email, password, full_name }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name } }
        });
        if (error) throw error;
        return data;
    }

    //for signin
    // const signIn = async ({ email, password }) => {
    //     const { data, error } = await supabase.auth.signInWithPassword({
    //         email,
    //         password
    //     });
    //     if (error) throw error;
    //     return data;
    // }

    const signIn = async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;

        const userId = data.user?.id;

        if(!userId) throw new Error("User not found");

        const {data: profile, error: profileError} = await supabase
        .from("user_profile")
        .select("status")
        .eq("id", userId)
        .single();

        if(profileError) throw profileError;

        if(profile.status !== "active") {
            await supabase.auth.signOut();
            throw new Error("Your account is inactive")
        }
        return data;
    }


    //for logout
    const logOut = () => {
        return supabase.auth.signOut();
    }

    return (
        <AuthContext.Provider value={{user, loading, signUp, signIn, logOut }}>
            {children}
        </AuthContext.Provider>
    )
}


export const useAuth = () => {
    return useContext(AuthContext);
}