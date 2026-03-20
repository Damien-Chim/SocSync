export type UserRole = 'student' | 'host';

export type EventCategory = 'Tech' | 'Finance' | 'Industry' | 'Social' | 'Networking';

export interface Society {
  id: string;
  name: string;
  logo: string;
  category: EventCategory;
  description: string;
  followerCount: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  society: Society;
  date: string;
  time: string;
  location: string;
  coordinates: { lat: number; lng: number };
  price: number | 'Free';
  hasFreeFood: boolean;
  registrationLink: string;
  bannerImage: string;
  category: EventCategory;
  saveCount: number;
}

export interface Notification {
  id: string;
  societyName: string;
  eventTitle: string;
  timestamp: string;
  read: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  societyId?: string;
  likedSocieties: string[];
  savedEvents: string[];
}
