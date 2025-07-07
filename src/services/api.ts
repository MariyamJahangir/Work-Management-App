const API_BASE_URL = 'https://work-management-app-ux1a.onrender.com/api';

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Client API functions
export const clientApi = {
  getAll: () => apiRequest<any[]>('/clients'),
  
  create: (client: { id: string; name: string }) =>
    apiRequest<any>('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    }),
  
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/clients/${id}`, {
      method: 'DELETE',
    }),
};

// Service API functions
export const serviceApi = {
  getAll: () => apiRequest<any[]>('/services'),
  
  create: (service: any) =>
    apiRequest<any>('/services', {
      method: 'POST',
      body: JSON.stringify(service),
    }),
  
  update: (id: string, updates: any) =>
    apiRequest<any>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/services/${id}`, {
      method: 'DELETE',
    }),
};

// Health check
export const healthCheck = () => apiRequest<{ status: string; message: string }>('/health');