import axios from 'axios';
const API_BASE_URL = 'http://localhost:3000/api';
const api = axios.create({
  baseURL: 'http://192.168.1.4:8000/api/admin',
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
    // Жинхэнэ API дуудах хэсэг
    const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // <--- ҮҮНИЙГ НЭМНЭ
      }
    });
    if (!response.ok) throw new Error('Мэдэгдэл татахад алдаа гарлаа');
    
    const json = await response.json();
    return json.data; // Backend-ийнхээ бүтцээс хамаарч өөрчилнө
  } catch (error) {
    console.error(error);
    return []; // Алдаа гарвал хоосон array буцаана
  }
};

export default api;