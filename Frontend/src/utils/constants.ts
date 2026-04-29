// API Constants
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090/api';

// Pagination
export const ITEMS_PER_PAGE = 10;
export const DEFAULT_PAGE = 1;

// Date formats
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';

// Status
export const EMPLOYEE_STATUS = {
  ACTIVE: 'ACTIF',
  INACTIVE: 'INACTIF',
  ON_LEAVE: 'EN_CONGE',
} as const;

// Colors for charts
export const CHART_COLORS = {
  primary: 'rgba(59, 130, 246, 0.8)',
  success: 'rgba(16, 185, 129, 0.8)',
  warning: 'rgba(245, 158, 11, 0.8)',
  danger: 'rgba(239, 68, 68, 0.8)',
  purple: 'rgba(168, 85, 247, 0.8)',
};

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
};
