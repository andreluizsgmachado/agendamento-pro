/**
 * Common TypeScript types and interfaces for the application
 * This will be expanded as the application grows
 */

// App-wide types
export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'test' | 'production';
}

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  time: string;
  service: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentStatus {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  updatedAt: string;
}

// Placeholder for future types:

// Supabase related types
// export interface User { ... }
// export interface Profile { ... }

// Stripe related types
// export interface PaymentMethod { ... }
// export interface SubscriptionPlan { ... }