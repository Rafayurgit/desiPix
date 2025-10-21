// src/api/axiosClient.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ,
  withCredentials: true, // important to send/receive httpOnly cookies
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

api.interceptors.request.use(config => {
  // Access token will be provided by a function to avoid stale closures
  const token = window.__ACCESS_TOKEN__; // see AuthProvider below (keep in-memory)
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor to handle 401
api.interceptors.response.use(
  res => res,
  err => {
    const originalRequest = err.config;
    if (err.response && err.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = "Bearer " + token;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        api.post("/auth/refresh")
          .then(({ data }) => {
            const newToken = data.accessToken;
            // Provide a place to store it in-memory for request interceptors:
            window.__ACCESS_TOKEN__ = newToken;
            processQueue(null, newToken);
            originalRequest.headers.Authorization = "Bearer " + newToken;
            resolve(api(originalRequest));
          })
          .catch(err2 => {
            processQueue(err2, null);
            reject(err2);
          })
          .finally(() => { isRefreshing = false; });
      });
    }
    return Promise.reject(err);
  }
);

export default api;
