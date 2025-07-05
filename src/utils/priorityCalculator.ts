import { Service } from '../types';

export const calculatePriority = (submissionDate: string): 'High' | 'Medium' | 'Low' => {
  const today = new Date();
  const submission = new Date(submissionDate);
  const diffTime = submission.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return 'High';
  if (diffDays <= 14) return 'Medium';
  return 'Low';
};

export const getDaysUntilSubmission = (submissionDate: string): number => {
  const today = new Date();
  const submission = new Date(submissionDate);
  const diffTime = submission.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const sortServicesByPriority = (services: Service[]): Service[] => {
  const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
  
  return [...services].sort((a, b) => {
    // First sort by priority
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by submission date (closest first)
    const dateA = new Date(a.submissionDate);
    const dateB = new Date(b.submissionDate);
    return dateA.getTime() - dateB.getTime();
  });
};

export const getPriorityColor = (priority: 'High' | 'Medium' | 'Low'): string => {
  switch (priority) {
    case 'High': return 'text-red-600 bg-red-50 border-red-200';
    case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Low': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};