export interface HomeCategory {
  id: number;
  name: string;
}

export interface HomeCategoryListResult {
  items: HomeCategory[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type HomeCategoryId = "all" | number;
