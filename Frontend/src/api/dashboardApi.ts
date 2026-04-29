import axiosInstance from './axiosConfig';

export interface DashboardStats {
  totalProduits?: number;
  totalVentes?: number;
  totalClients?: number;
  chiffreAffaires?: number;
  prixMoyen?: number;
  totalCategories?: number;
  top5Produits?: any[];
  dernieresVentes?: any[];
  distributionCategories?: any[];
  // Anciens champs pour compatibilité
  totalSales?: number;
  totalRevenue?: number;
  totalProducts?: number;
  totalEmployees?: number;
  totalInvestments?: number;
  recentSales?: any[];
  topProducts?: any[];
  salesByCategory?: any[];
  monthlyRevenue?: any[];
}

export const dashboardApi = {
  getStats: () => axiosInstance.get<DashboardStats>('/dashboard/stats'),
  
  getSalesTrends: (period: string) => 
    axiosInstance.get(`/dashboard/sales-trends?period=${period}`),
  
  getTopProducts: (limit: number = 5) => 
    axiosInstance.get(`/dashboard/top-products?limit=${limit}`),
  
  getCategoryAnalysis: () => 
    axiosInstance.get('/dashboard/category-analysis'),
};
