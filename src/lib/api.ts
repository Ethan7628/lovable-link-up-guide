
const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'x-auth-token': token }),
    };
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options?.headers,
        },
      });

      console.log(`API response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ msg: 'Request failed' }));
        throw new Error(errorData.msg || errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { 
          success: false, 
          error: 'Unable to connect to server. Please ensure the backend is running on http://localhost:5000' 
        };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Auth endpoints
  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
    age?: number;
    bio?: string;
    location?: string;
  }) {
    console.log('Registering user:', { ...userData, password: '[HIDDEN]' });
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email: string, password: string) {
    console.log('Logging in user:', email);
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Services endpoints
  async getServices() {
    return this.request('/services');
  }

  async createService(serviceData: any) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  // Bookings endpoints
  async getBookings() {
    return this.request('/bookings/my-bookings');
  }

  async createBooking(bookingData: any) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }
}

export const apiClient = new ApiClient();
