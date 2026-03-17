export interface ReportCategory {
  id: string;
  name: string;
  icon: string | null;
  displayOrder: number;
}

export interface Report {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  jasperUrl: string;
  thumbnailUrl: string | null;
  isActive: boolean;
  displayOrder: number;
}