import axios from 'axios';

// 1. Хуучин localhost:3000 байсныг зөв IP-ээрээ солих
const API_BASE_URL = 'http://192.168.137.1:8000/api';

const api = axios.create({
  baseURL: `${API_BASE_URL}/admin`, // Энэ нь 'http://192.168.103.155:8000/api/admin' болно
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Өглөө танай систем токеноо ямар нэрээр хадгалдаг байсан тэр нэрээ л бичнэ. 
  // Ихэвчлэн 'token' эсвэл 'fixy_admin_token' байдаг.
  const token = localStorage.getItem('token'); 
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Notification {
  id: number;
  type: 'call' | 'technician' | 'customer' | 'system';
  title: string;
  desc: string;
  created_at: string;
  is_read: boolean;
}

export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    // 2. 'client' биш 'api' гэж дуудна. 
    // 3. baseURL дээр '/admin' байгаа тул шууд '/notifications' гэнэ.
    // 4. Interceptor автоматаар токен илгээх тул энд headers бичихгүй.
    const response = await api.get('/notifications');
    
    // Laravel-ээс бид 'data' түлхүүр дотор явуулж байгаа тул:
    return response.data.data || response.data; 
  } catch (error) {
    console.error("Мэдэгдэл татахад алдаа гарлаа:", error);
    return [];
  }
};

export default api;