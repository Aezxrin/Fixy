export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'technician' | 'user';
  avatar?: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Technician extends User {
  specialty: string;
  status: 'active' | 'inactive' | 'busy';
  rating: number;
}

export interface RepairRequest {
  id: number;
  user_id: number;
  technician_id?: number;
  description: string;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  created_at: string;
  user?: User;
  technician?: Technician;
}

export interface DashboardStats {
  total_users: number;
  total_technicians: number;
  active_requests: number;
  completed_requests: number;
}
