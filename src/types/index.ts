export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
}

export interface OrderStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
  revenue: number;
}
