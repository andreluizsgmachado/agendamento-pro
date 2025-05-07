/**
 * Base API service
 * This will be expanded with Supabase and Stripe integrations in the future
 */

// Configuration object for API services
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
};

// Base service class that will be extended for specific APIs
export class BaseApiService {
  protected baseUrl: string;
  
  constructor(baseUrl: string = apiConfig.baseUrl) {
    this.baseUrl = baseUrl;
  }

  protected async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const fetchOptions: RequestInit = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }
}

// Future services:
// export class SupabaseService extends BaseApiService { ... }
// export class StripeService extends BaseApiService { ... }