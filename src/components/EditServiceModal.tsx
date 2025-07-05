import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Service } from '../types';
import { calculatePriority, getDaysUntilSubmission } from '../utils/priorityCalculator';

interface EditServiceModalProps {
  service: Service;
  onClose: () => void;
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({ service, onClose }) => {
  const { updateService } = useApp();
  const [formData, setFormData] = useState({
    workName: service.workName,
    submissionDate: service.submissionDate,
    priority: service.priority,
    status: service.status
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate days until submission and determine if priority is editable
  const daysUntilSubmission = getDaysUntilSubmission(formData.submissionDate);
  const isPriorityEditable = daysUntilSubmission >= 8; // 8+ days = editable, <8 days = locked to High

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.workName.trim()) {
      newErrors.workName = 'Work name is required';
    }

    if (!formData.submissionDate) {
      newErrors.submissionDate = 'Submission date is required';
    }

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
      // If less than 8 days, force priority to High regardless of user selection
      const finalPriority = daysUntilSubmission < 8 ? 'High' : formData.priority;
      
      await updateService(service.id, {
        workName: formData.workName.trim(),
        submissionDate: formData.submissionDate,
        priority: finalPriority,
        status: formData.status
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Error updating service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // If submission date changes and becomes less than 8 days, force priority to High
      if (field === 'submissionDate') {
        const newDaysUntil = getDaysUntilSubmission(value);
        if (newDaysUntil < 8) {
          newData.priority = 'High';
        }
      }
      
      return newData;
    });
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Edit Service</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name
            </label>
            <input
              type="text"
              value={service.clientName}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <input
              type="text"
              value={service.serviceName}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Name *
            </label>
            <input
              type="text"
              value={formData.workName}
              onChange={(e) => handleInputChange('workName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.workName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter work name"
            />
            {errors.workName && (
              <p className="mt-1 text-sm text-red-600">{errors.workName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Submission Date *
            </label>
            <input
              type="date"
              value={formData.submissionDate}
              onChange={(e) => handleInputChange('submissionDate', e.target.value)}
              min={getTodayDate()}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.submissionDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.submissionDate && (
              <p className="mt-1 text-sm text-red-600">{errors.submissionDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <div className="space-y-2">
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                disabled={!isPriorityEditable}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  !isPriorityEditable 
                    ? 'border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed' 
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              
              {!isPriorityEditable && daysUntilSubmission < 8 && (
                <div className="flex items-start space-x-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">
                    Auto-set to High (due within 7 days)
                  </p>
                </div>
              )}
              
              {isPriorityEditable && daysUntilSubmission >= 8 && (
                <div className="flex items-start space-x-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <AlertCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-700">
                    You can set any priority level
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-400 transition-all"
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceModal;