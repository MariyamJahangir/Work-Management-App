import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Client, Service } from '../types';
import { clientApi, serviceApi } from '../services/api';

interface AppContextType {
  clients: Client[];
  services: Service[];
  loading: boolean;
  error: string | null;
  addClient: (client: Omit<Client, 'createdAt'>) => Promise<void>;
  addService: (service: Omit<Service, 'id' | 'createdAt'>) => Promise<void>;
  updateService: (id: string, updates: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [clientsData, servicesData] = await Promise.all([
        clientApi.getAll(),
        serviceApi.getAll()
      ]);
      
      setClients(clientsData);
      setServices(servicesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addClient = async (clientData: Omit<Client, 'createdAt'>) => {
    try {
      const newClient = await clientApi.create(clientData);
      setClients(prev => {
        const existingClient = prev.find(c => c.id === newClient.id);
        if (existingClient) {
          return prev;
        }
        return [...prev, newClient];
      });
    } catch (err) {
      console.error('Error adding client:', err);
      throw new Error('Failed to add client');
    }
  };

  const addService = async (serviceData: Omit<Service, 'id' | 'createdAt'>) => {
    try {
      const newService = await serviceApi.create(serviceData);
      setServices(prev => [...prev, newService]);
    } catch (err) {
      console.error('Error adding service:', err);
      throw new Error('Failed to add service');
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      const updatedService = await serviceApi.update(id, updates);
      setServices(prev => prev.map(service => 
        service.id === id ? updatedService : service
      ));
    } catch (err) {
      console.error('Error updating service:', err);
      throw new Error('Failed to update service');
    }
  };

  const deleteService = async (id: string) => {
    try {
      await serviceApi.delete(id);
      setServices(prev => prev.filter(service => service.id !== id));
    } catch (err) {
      console.error('Error deleting service:', err);
      throw new Error('Failed to delete service');
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await clientApi.delete(id);
      setClients(prev => prev.filter(client => client.id !== id));
      setServices(prev => prev.filter(service => service.clientId !== id));
    } catch (err) {
      console.error('Error deleting client:', err);
      throw new Error('Failed to delete client');
    }
  };

  const value: AppContextType = {
    clients,
    services,
    loading,
    error,
    addClient,
    addService,
    updateService,
    deleteService,
    deleteClient,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};