export type TabType = 'views' | 'likes' | 'subscribers' | 'embed';

export interface Order {
  id: string;       // External ID for display purposes
  mainID: string;   // Internal ID for API references
  startCount: string | number;
  count: string | number;
  link: string;     // URL to check
  mainLink?: string; // Original link for reference
}

export interface ApiOrder {
  id: string;             // Internal ID from API
  external_id: string;    // External ID for systems
  start_count: number;    // Start count
  count: string;          // Ordered count
  link_url: string;       // URL
  link?: string;          // Alternative URL field
  user?: string;
  status_name?: string;
  created?: string;
  service_name?: string;
}

export interface RefillItem {
  id: string;
  mainID: string;
  count: string | number;
  currentCount: number;
  errorReason?: string;
  link?: string;
  mainLink?: string;
}