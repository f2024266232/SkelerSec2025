import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";

export interface AuthUser {
  id: number;
  name: string;
  isAdmin: boolean;
}

export async function login(name: string, password: string): Promise<AuthUser> {
  const response = await apiRequest("POST", "/api/login", { name, password });
  const data = await response.json();
  
  // Wait a moment for session to be established
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Invalidate all queries on login
  queryClient.clear();
  
  return data;
}

export async function register(name: string, password: string): Promise<AuthUser> {
  const response = await apiRequest("POST", "/api/register", { name, password });
  const data = await response.json();
  
  // Invalidate all queries on register
  queryClient.clear();
  
  return data;
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/logout");
  
  // Clear all cached data on logout
  queryClient.clear();
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest("GET", "/api/me");
  return response.json();
}
