import { createContext, useContext, useEffect, useState } from "react";

import {supabase} from '../../supabase/supabase-client';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    
    const signUp = async ({email, password, full_name}) => {
        const {data, error} = await supabase.auth.signUp({
            email,
            password, 
            options: {data: {full_name}}
        });
        if(error) throw error;
        return data;
    }

    const signIn = async ({email, password}) => {
        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if(error) throw error;
        return data;
    }

    const logOut = () => {
        return supabase.auth.signOut();
    }

    return (
        <AuthContext.Provider value={{signUp, signIn, logOut}}>
            {children}
        </AuthContext.Provider>
    )
}


export const useAuth = () => {
    return useContext(AuthContext);
}