import React from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';
import api from '../../api/axiosClient';

export default function GoogleCallbackPage() {

    const navigate = useNavigate();
    const {setTokenInMemory } = useAuth();

    useEffect(()=>{
        (async()=>{
            try {
                const {data} = await api.post("/auth/refresh");
                setTokenInMemory(data.accessToken);
                navigate("/dashboard");
            } catch (error) {
                navigate("/login");
            }
        })()
    },[navigate, setTokenInMemory])

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-100 to-white">
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
                <p className="text-lg font-medium text-gray-700 animate-pulse">
                    Signing you in with Google...
                </p>
            </div>
        </div>
  )
}
