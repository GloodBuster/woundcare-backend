export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    totalPages: number;
    page: number;
    itemsPerPage: number;
  };
}
