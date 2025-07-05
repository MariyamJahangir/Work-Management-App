import React, { useState } from 'react';
import { Plus, X, Calendar, User, Briefcase, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SERVICE_OPTIONS, ServiceFormData, ServiceType } from '../types';
import { getDaysUntilSubmission } from '../utils/priorityCalculator';

const AddClientForm: React.FC = () => {
  const { addClient, addService } = useApp();
  const [clientName, setClientName] = useState('');
  const [selectedServices, setSelectedServices] = useState<Set<ServiceType>>(new Set());
  const [serviceDetails, setServiceDetails] = useState<Record<ServiceType, ServiceFormData>>({} as any);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleServiceToggle = (service: ServiceType) => {
    const newSelected = new Set(selectedServices);
    
    if (newSelected.has(service)) {
      newSelected.delete(service);
      const newDetails = { ...serviceDetails };
      delete newDetails[service];
      setServiceDetails(newDetails);
    } else {
      newSelected.add(service);
      setServiceDetails(prev => ({
        ...prev,
        [service]: {
          serviceName: service,
          workName: '',
          submissionDate: '',
          priority: 'Medium'
        }
      }));
    }
    
    setSelectedServices(newSelected);
  };

  const handleServiceDetailChange = (
    service: ServiceType, 
    field: keyof ServiceFormData, 
    value: string
  ) => {
    setServiceDetails(prev => {
      const newDetails = {
        ...prev,
        [service]: {
          ...prev[service],
          [field]: value
        }
      };

      // If submission date changes and becomes less than 8 days, force priority to High
      if (field === 'submissionDate' && value) {
        const daysUntil = getDaysUntilSubmission(value);
        if (daysUntil < 8) {
          newDetails[service].priority = 'High';
        }
      }

      return newDetails;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    if (selectedServices.size === 0) {
      newErrors.services = 'Please select at least one service';
    }

    selectedServices.forEach(service => {
      const details = serviceDetails[service];
      if (!details.workName.trim()) {
        newErrors[`${service}_workName`] = 'Work name is required';
      }
      if (!details.submissionDate) {
        newErrors[`${service}_submissionDate`] = 'Submission date is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a unique client ID
      const clientId = crypto.randomUUID();
      
      // Add client first
      await addClient({ 
        name: clientName.trim(),
        id: clientId
      });

      // Add each selected service with the same client ID
      for (const service of selectedServices) {
        const details = serviceDetails[service];
        // If less than 8 days, force priority to High
        const daysUntil = getDaysUntilSubmission(details.submissionDate);
        const finalPriority = daysUntil < 8 ? 'High' : details.priority;
        
        await addService({
          clientName: clientName.trim(),
          clientId: clientId,
          serviceName: service,
          workName: details.workName.trim(),
          submissionDate: details.submissionDate,
          priority: finalPriority,
          status: 'Active'
        });
      }

      // Reset form
      setClientName('');
      setSelectedServices(new Set());
      setServiceDetails({} as any);
      setErrors({});
      
      // Show success message
      alert(`Client "${clientName.trim()}" added successfully with ${selectedServices.size} service(s)!`);
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Error adding client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const isPriorityEditable = (service: ServiceType) => {
    const details = serviceDetails[service];
    if (!details?.submissionDate) return true;
    const daysUntil = getDaysUntilSubmission(details.submissionDate);
    return daysUntil >= 8; // 8+ days = editable
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Add New Client</h2>
        <p className="text-gray-600">Create a new client profile and assign multiple services with individual deadlines</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Client Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Client Information</h3>
          </div>
          
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
              Client Name *
            </label>
            <input
              type="text"
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.clientName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Enter client name"
            />
            {errors.clientName && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <X className="w-4 h-4 mr-1" />
                {errors.clientName}
              </p>
            )}
          </div>
        </div>

        {/* Service Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-6">
            <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Services *</h3>
            <span className="ml-2 text-sm text-gray-500">
              ({selectedServices.size} selected)
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {SERVICE_OPTIONS.map((service) => (
              <label 
                key={service} 
                className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedServices.has(service) 
                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedServices.has(service)}
                  onChange={() => handleServiceToggle(service)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className={`text-sm font-medium ${
                  selectedServices.has(service) ? 'text-blue-900' : 'text-gray-700'
                }`}>
                  {service}
                </span>
              </label>
            ))}
          </div>
          
          {errors.services && (
            <p className="mb-4 text-sm text-red-600 flex items-center">
              <X className="w-4 h-4 mr-1" />
              {errors.services}
            </p>
          )}

          {/* Service Details */}
          {selectedServices.size > 0 && (
            <div className="space-y-6">
              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-6 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Service Details
                </h4>
                
                <div className="space-y-6">
                  {Array.from(selectedServices).map((service) => {
                    const details = serviceDetails[service];
                    const isEditable = isPriorityEditable(service);
                    const daysUntil = details?.submissionDate ? getDaysUntilSubmission(details.submissionDate) : null;
                    
                    return (
                      <div key={service} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-semibold text-gray-900 text-lg flex items-center">
                            <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                            {service}
                          </h5>
                          <button
                            type="button"
                            onClick={() => handleServiceToggle(service)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-white transition-all"
                            title="Remove service"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Work Name *
                            </label>
                            <input
                              type="text"
                              value={serviceDetails[service]?.workName || ''}
                              onChange={(e) => handleServiceDetailChange(service, 'workName', e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                errors[`${service}_workName`] ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'
                              }`}
                              placeholder="e.g., Logo Design, Website Redesign"
                            />
                            {errors[`${service}_workName`] && (
                              <p className="mt-1 text-xs text-red-600 flex items-center">
                                <X className="w-3 h-3 mr-1" />
                                {errors[`${service}_workName`]}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Submission Date *
                            </label>
                            <input
                              type="date"
                              value={serviceDetails[service]?.submissionDate || ''}
                              onChange={(e) => handleServiceDetailChange(service, 'submissionDate', e.target.value)}
                              min={getTodayDate()}
                              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                errors[`${service}_submissionDate`] ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'
                              }`}
                            />
                            {errors[`${service}_submissionDate`] && (
                              <p className="mt-1 text-xs text-red-600 flex items-center">
                                <X className="w-3 h-3 mr-1" />
                                {errors[`${service}_submissionDate`]}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Priority
                            </label>
                            <div className="space-y-2">
                              <select
                                value={serviceDetails[service]?.priority || 'Medium'}
                                onChange={(e) => handleServiceDetailChange(service, 'priority', e.target.value)}
                                disabled={!isEditable}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                  !isEditable 
                                    ? 'border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed' 
                                    : 'border-gray-300 hover:border-gray-400 bg-white'
                                }`}
                              >
                                <option value="High">High Priority</option>
                                <option value="Medium">Medium Priority</option>
                                <option value="Low">Low Priority</option>
                              </select>
                              {!isEditable && daysUntil !== null && daysUntil < 8 && (
                                <div className="flex items-start space-x-2 p-2 bg-red-50 border border-red-200 rounded-md">
                                  <AlertCircle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-red-700">
                                    Auto-set to High (due within 7 days)
                                  </p>
                                </div>
                              )}
                              {isEditable && daysUntil !== null && daysUntil >= 8 && (
                                <div className="flex items-start space-x-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                  <AlertCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-green-700">
                                    You can set any priority level
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setClientName('');
              setSelectedServices(new Set());
              setServiceDetails({} as any);
              setErrors({});
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Adding Client...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-3" />
                Add Client & Services
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClientForm;