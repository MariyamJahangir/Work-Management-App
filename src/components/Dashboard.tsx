import React, { useState, useMemo } from 'react';
import { Calendar, Clock, AlertCircle, Edit, Trash2, Filter, Users, Building2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  sortServicesByPriority, 
  getDaysUntilSubmission, 
  formatDateForDisplay, 
  getPriorityColor
} from '../utils/priorityCalculator';
import EditServiceModal from './EditServiceModal';
import { Service } from '../types';

const Dashboard: React.FC = () => {
  const { services, deleteService, clients, loading, error, refreshData } = useApp();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [filterPriority, setFilterPriority] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Completed' | 'On Hold'>('All');
  const [filterClient, setFilterClient] = useState<string>('All');
  const [groupByClient, setGroupByClient] = useState<boolean>(false);

  // Use services directly from database without recalculating priorities
  const filteredAndSortedServices = useMemo(() => {
    let filtered = services;
    
    if (filterPriority !== 'All') {
      filtered = filtered.filter(service => service.priority === filterPriority);
    }
    
    if (filterStatus !== 'All') {
      filtered = filtered.filter(service => service.status === filterStatus);
    }

    if (filterClient !== 'All') {
      filtered = filtered.filter(service => service.clientName === filterClient);
    }
    
    return sortServicesByPriority(filtered);
  }, [services, filterPriority, filterStatus, filterClient]);

  // Group services by client
  const groupedServices = useMemo(() => {
    if (!groupByClient) return null;
    
    const grouped = filteredAndSortedServices.reduce((acc, service) => {
      if (!acc[service.clientName]) {
        acc[service.clientName] = [];
      }
      acc[service.clientName].push(service);
      return acc;
    }, {} as Record<string, Service[]>);

    return grouped;
  }, [filteredAndSortedServices, groupByClient]);

  const uniqueClients = useMemo(() => {
    return Array.from(new Set(services.map(service => service.clientName))).sort();
  }, [services]);

  const getDaysUntilText = (submissionDate: string) => {
    const days = getDaysUntilSubmission(submissionDate);
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day remaining';
    return `${days} days remaining`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Completed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'On Hold': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      try {
        await deleteService(serviceId);
      } catch (error) {
        alert('Failed to delete service. Please try again.');
      }
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
    } catch (error) {
      alert('Failed to refresh data. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Connection Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-3 flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ServiceRow: React.FC<{ service: Service; showClient?: boolean }> = ({ service, showClient = true }) => (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{service.workName}</div>
          <div className="text-sm text-gray-500">{service.serviceName}</div>
        </div>
      </td>
      {showClient && (
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
            <div className="text-sm font-medium text-gray-900">{service.clientName}</div>
          </div>
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formatDateForDisplay(service.submissionDate)}</div>
        <div className={`text-xs ${getDaysUntilSubmission(service.submissionDate) < 0 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
          {getDaysUntilText(service.submissionDate)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(service.priority)}`}>
          {service.priority}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(service.status)}`}>
          {service.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingService(service)}
            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            title="Edit service"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteService(service.id)}
            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete service"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Project Dashboard</h2>
          <p className="text-gray-600">Track all client work and deadlines in one place</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter(s => s.priority === 'High').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Medium Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter(s => s.priority === 'Medium').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-lg">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter(s => s.status === 'Active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{uniqueClients.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all"
              >
                <option value="All">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Client</label>
              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all"
              >
                <option value="All">All Clients</option>
                {uniqueClients.map(client => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={groupByClient}
                onChange={(e) => setGroupByClient(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Group by Client</span>
            </label>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {groupByClient && groupedServices ? (
            // Grouped view
            <div className="divide-y divide-gray-200">
              {Object.entries(groupedServices).map(([clientName, clientServices]) => (
                <div key={clientName}>
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                        {clientName}
                      </h3>
                      <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                        {clientServices.length} service{clientServices.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Work Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submission Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clientServices.map((service) => (
                        <ServiceRow key={service.id} service={service} showClient={false} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            // Regular table view
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedServices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-medium">No projects found</p>
                      <p className="text-sm">Start by adding your first client project</p>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedServices.map((service) => (
                    <ServiceRow key={service.id} service={service} />
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editingService && (
        <EditServiceModal
          service={editingService}
          onClose={() => setEditingService(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;