export type UserRole = 'student' | 'host';

export const EVENT_CATEGORIES = [
  'Tech',
  'Finance',
  'Career',
  'Workshop',
  'Competition',
  'Social',
  'Arts & Culture',
  'Networking',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface Society {
  id: string;
  name: string;
  logo: string;
  category: EventCategory;
  description: string;
  followerCount: number;
  /** ISO timestamp from DB; used to prioritize new societies in recommendations */
  createdAt?: string;
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
