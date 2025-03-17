// src/utils/axiosConfig.ts
import axios from 'axios';
import { API_URL } from '../../Base_Api';

export const getAxiosInstance = (requiresAuth = true) => {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
  };
  
  if (requiresAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return axios.create({
    baseURL: API_URL,
    headers
  });
};

// For public endpoints
export const publicAxios = getAxiosInstance(false);

// For protected endpoints 
export const authAxios = getAxiosInstance(true);