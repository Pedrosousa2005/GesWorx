const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('gesworx_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          this.token = user.token;
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    }
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // User endpoints
  async getUsers() {
    return this.request<any[]>('api/users');
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    return this.request<any>('api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Van endpoints
  async getVans() {
    return this.request<any[]>('api/vans');
  }

  async createVan(vanData: { licensePlate: string }) {
    return this.request<any>('api/vans', {
      method: 'POST',
      body: JSON.stringify(vanData),
    });
  }

  async updateVan(id: string, vanData: { licensePlate: string }) {
    return this.request<any>(`api/vans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vanData),
    });
  }

  async deleteVan(id: string) {
    return this.request<any>(`api/vans/${id}`, {
      method: 'DELETE',
    });
  }

  // Material endpoints
  async getMaterials() {
    return this.request<any[]>('api/materials');
  }

  async createMaterial(materialData: {
    name: string;
    category: string;
    subcategory: string;
    parentId?: number;
  }) {
    return this.request<any>('api/materials', {
      method: 'POST',
      body: JSON.stringify(materialData),
    });
  }

  async updateMaterial(id: string, materialData: {
    name: string;
    category: string;
    subcategory: string;
  }) {
    return this.request<any>(`api/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(materialData),
    });
  }

  async deleteMaterial(id: string) {
    return this.request<any>(`api/materials/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategories() {
    return this.request<string[]>('api/materials/categories');
  }

  // Task endpoints
  async getTasks() {
    return this.request<any[]>('api/tasks');
  }

  async createTask(taskData: {
    title: string;
    description: string;
    userId: number;
    vanId?: number;
    scheduledAt?: string;
  }) {
    return this.request<any>('api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id: string, taskData: Partial<{
    title: string;
    description: string;
    userId: number;
    vanId?: number;
    scheduledAt?: string;
  }>) {
    return this.request<any>(`api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id: string) {
    return this.request<any>(`api/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Task Load endpoints
  async createTaskLoad(taskLoadData: {
    taskId: number;
    vanId: number;
    userIds: number[];
  }) {
    return this.request<any>('api/task-loads', {
      method: 'POST',
      body: JSON.stringify(taskLoadData),
    });
  }

  async addMaterialToTaskLoad(taskLoadId: string, materialData: {
    materialId: number;
    quantity?: number;
  }) {
    return this.request<any>(`api/task-loads/${taskLoadId}/materials`, {
      method: 'POST',
      body: JSON.stringify(materialData),
    });
  }

  async getTaskLoadMaterials(taskLoadId: string) {
    return this.request<any[]>(`api/task-loads/${taskLoadId}/materials`);
  }

  async getTaskLoadUsers(taskLoadId: string) {
    return this.request<any[]>(`api/task-loads/${taskLoadId}/users`);
  }

  async getTaskLoadDetails(taskLoadId: string) {
    return this.request<any>(`api/task-loads/${taskLoadId}/details`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;