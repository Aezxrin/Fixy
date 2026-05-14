import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Өөрийн компьютерийн IPv4 хаягийг энд бичнэ.
const API_BASE_URL = 'http://192.168.137.1:8000/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Хүсэлт болгонд Token-ийг автоматаар нэмж явуулах Interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;