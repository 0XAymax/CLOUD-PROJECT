// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

// Format date
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

// Format date short
export const formatDateShort = (date: string | Date): string => {
  return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
};

// Format number
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};
