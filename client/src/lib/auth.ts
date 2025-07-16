import { apiRequest } from "@/lib/queryClient";

export interface User {
  id: number;
  username: string;
  fullname: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', {
      username,
      password,
    });
    
    return await response.json();
  },

  async register(userData: {
    username: string;
    password: string;
    email: string;
    fullname: string;
    role?: string;
  }): Promise<{ user: User }> {
    const response = await apiRequest('POST', '/api/auth/register', userData);
    return await response.json();
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiRequest('GET', '/api/auth/me');
    return await response.json();
  },

  logout(): void {
    localStorage.removeItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  setToken(token: string): void {
    localStorage.setItem('token', token);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    staff: 1,
    manager: 2,
    admin: 3,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
};

export const isUnauthorizedError = (error: Error): boolean => {
  return /^401: .*Unauthorized/.test(error.message);
};
