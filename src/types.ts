export type TabType = 'views' | 'likes' | 'subscribers'| 'embed';

export interface Order {
  id: string;
  mainID: string;
  startCount: string | number;
  count: string | number;
  link: string;
  mainLink:any
}

export interface ApiOrder {
  id: string;
  external_id: string;
  start_count: number;
  count: string;
  link_url: string;
  user?: string;
  status_name?: string;
  created?: string;
  service_name?: string;
  link?: string;
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