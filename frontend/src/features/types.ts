//types.ts
export interface ApiError {
    message: string;
    statusCode?: number;
    errors?: Record<string, string>;
  }
  
  export interface UserProfile {
    skills?: string[];
    rating?: number;
    location?: {
      type: string;
      coordinates: number[];
    };
  }
  
  export interface User {
    id: string;
    email: string;
    role: 'artisan' | 'client';
    profile?: UserProfile;
  }
  
  export interface Bid {
    id: string;
    artisanId: string;
    amount: number;
    accepted: boolean;
    createdAt: string;
    artisanName?: string;
    artisanRating?: number;
  }
  
  export interface Job {
    id: string;
    clientId: string;
    title: string;
    description: string;
    status: 'open' | 'assigned' | 'completed';
    bids: Bid[];
    createdAt: string;
    location: {
      type: string;
      coordinates: number[];
    };
    requiredSkills: string[];
  }