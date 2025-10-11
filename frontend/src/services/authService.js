// src/services/authService.js
import api from "../api/axiosClient";

export const signIn = (email, password) => api.post("/auth/signIn", { email, password });
export const signUp = (payload) => api.post("/auth/signUp", payload);
export const refresh = () => api.post("/auth/refresh");
export const logOut = () => api.post("/auth/logOut");
export const changePassword = (payload) => api.post("/auth/changePassword", payload);
