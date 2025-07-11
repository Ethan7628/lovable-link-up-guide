// Enhanced API client with improved connection monitoring and error handling

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://bodyconnect-backend.vercel.app/api' 
  : 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  environment: string;
  database: {
    status: string;
    isConnected: boolean;
    error?: string;
  };
}

// Connection state management
class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private connectionStatus: 'connected' | 'disconnected' | 'checking' = 'checking';
  private lastChecked: Date | null = null;
  private listeners: Array<(status: string) => void> = [];

  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }

  getStatus(): string {
    return this.connectionStatus;
  }

  addListener(callback: (status: string) => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: (status: string) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.connectionStatus));
  }

  async checkConnection(force = false): Promise<boolean> {
    // Don't check too frequently unless forced
    if (!force && this.lastChecked && Date.now() - this.lastChecked.getTime() < 5000) {
      return this.connectionStatus === 'connected';
    }

    try {
      this.connectionStatus = 'checking';
      this.notifyListeners();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const health: HealthResponse = await response.json();
        this.connectionStatus = health.database?.status === 'connected' ? 'connected' : 'disconnected';
      } else {
        this.connectionStatus = 'disconnected';
      }
    } catch (error) {
      console.log('Connection check failed:', error);
      this.connectionStatus = 'disconnected';
    }

    this.lastChecked = new Date();
    this.notifyListeners();
    return this.connectionStatus === 'connected';
  }
}

class ApiClient {
  private connectionMonitor = ConnectionMonitor.getInstance();

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      ...(token && { 'x-auth-token': token }),
    };
  }

  private getMultipartHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Cache-Control': 'no-cache',
      ...(token && { 'x-auth-token': token }),
    };
  }

  private async handleNetworkError(error: Error): Promise<string> {
    // Check if it's a network error
    if (error instanceof TypeError && (
      error.message.includes('fetch') || 
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    )) {
      // Try to determine if backend is reachable
      const isConnected = await this.connectionMonitor.checkConnection(true);
      if (!isConnected) {
        return 'Cannot connect to BodyConnect servers. Please check your internet connection and try again.';
      }
      return 'Network error occurred. Please try again.';
    }

    if (error.name === 'AbortError') {
      return 'Request timed out. Please check your connection and try again.';
    }

    return error.message || 'An unexpected error occurred';
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      console.log(`🌐 Making API request to: ${API_BASE_URL}${endpoint}`);
      
      // Set up request timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.getHeaders(),
          ...options?.headers,
        },
      });

      clearTimeout(timeoutId);

      console.log(`📡 API response status: ${response.status} for ${endpoint}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          msg: `HTTP ${response.status} - ${response.statusText}` 
        }));
        
        // Handle specific HTTP status codes
        if (response.status === 401) {
          // Clear invalid token
          localStorage.removeItem('token');
          throw new Error('Authentication required. Please sign in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You don\'t have permission for this action.');
        } else if (response.status === 404) {
          throw new Error('Resource not found. The requested endpoint may not exist.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        throw new Error(errorData.msg || errorData.message || errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API response received for:', endpoint);

      return { success: true, data };
    } catch (error) {
      console.error('❌ API request failed:', error);
      
      const errorMessage = await this.handleNetworkError(error as Error);
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  async uploadRequest<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      console.log(`📤 Making upload request to: ${API_BASE_URL}${endpoint}`);
      
      // Set up request timeout (longer for uploads)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for uploads

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        signal: controller.signal,
        headers: this.getMultipartHeaders(),
        body: formData,
      });

      clearTimeout(timeoutId);

      console.log(`📡 Upload response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ msg: 'Upload failed' }));
        throw new Error(errorData.msg || errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Upload completed successfully');

      return { success: true, data };
    } catch (error) {
      console.error('❌ Upload request failed:', error);
      
      const errorMessage = await this.handleNetworkError(error as Error);
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  // Health check methods
  async checkBackendHealth(): Promise<ApiResponse<HealthResponse>> {
    return this.request<HealthResponse>('/health');
  }

  async checkDatabaseHealth(): Promise<ApiResponse<any>> {
    return this.request('/health/database');
  }

  // Connection monitoring
  getConnectionStatus(): string {
    return this.connectionMonitor.getStatus();
  }

  onConnectionStatusChange(callback: (status: string) => void): void {
    this.connectionMonitor.addListener(callback);
  }

  offConnectionStatusChange(callback: (status: string) => void): void {
    this.connectionMonitor.removeListener(callback);
  }

  async checkConnection(): Promise<boolean> {
    return this.connectionMonitor.checkConnection();
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
    console.log('👤 Registering user:', { ...userData, password: '[HIDDEN]' });
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email: string, password: string) {
    console.log('🔐 Logging in user:', email);
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

  async uploadProfilePicture(formData: FormData) {
    return this.uploadRequest('/auth/upload-profile-picture', formData);
  }

  // Posts endpoints
  async getPosts(params?: { page?: number; limit?: number; category?: string; location?: string }) {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    
    return this.request(`/posts${queryString}`);
  }

  async createPost(formData: FormData) {
    return this.uploadRequest('/posts', formData);
  }

  async getMyPosts() {
    return this.request('/posts/my-posts');
  }

  async likePost(postId: string) {
    return this.request(`/posts/${postId}/like`, {
      method: 'PUT',
    });
  }

  async addComment(postId: string, comment: string) {
    return this.request(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  async deletePost(postId: string) {
    return this.request(`/posts/${postId}`, {
      method: 'DELETE',
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

  async getProviderBookings() {
    return this.request('/bookings/provider-bookings');
  }

  async createBooking(bookingData: any) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBookingStatus(bookingId: string, status: string) {
    return this.request(`/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async cancelBooking(bookingId: string, cancellationReason?: string) {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancellationReason }),
    });
  }

  // Payment endpoints
  async createPaymentIntent(amount: number, serviceId?: string, providerId?: string) {
    return this.request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, serviceId, providerId }),
    });
  }

  async confirmPayment(paymentIntentId: string) {
    return this.request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
  }

  async getPaymentHistory() {
    return this.request('/payments/history');
  }
}

export const apiClient = new ApiClient();
