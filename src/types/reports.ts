export interface ReportCategory {
  report_count: number;
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
  is_active: boolean;
  displayOrder: number;
}