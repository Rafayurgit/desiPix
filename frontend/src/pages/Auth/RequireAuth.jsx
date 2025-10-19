import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ComponentLoader from "../../components/ComponentLoader.jsx"

export default function RequireAuth({children}) {
    const {user, loading} = useAuth();
    if(loading) return <ComponentLoader/>
    if(!user) return <Navigate to="/login"/>

    return children;
}
