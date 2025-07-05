export interface Client {
  id: string;
  name: string;
  createdAt: string;
}

export interface Service {
  id: string;
  clientId: string;
  clientName: string;
  serviceName: string;
  workName: string;
  submissionDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Completed' | 'On Hold';
  createdAt: string;
}

export interface ServiceFormData {
  serviceName: string;
  workName: string;
  submissionDate: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ClientFormData {
  clientName: string;
  services: ServiceFormData[];
}

export type ServiceType = 'Branding' | 'Web Development' | 'SEO' | 'SMM' | 'Google Ads' | 'Meta Ads';

export const SERVICE_OPTIONS: ServiceType[] = [
  'Branding',
  'Web Development', 
  'SEO',
  'SMM',
  'Google Ads',
  'Meta Ads'
];