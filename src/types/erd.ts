export interface Column {
  id: string;
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
  length?: string;
}

export interface TableData extends Record<string, unknown> {
  label: string;
  columns: Column[];
  animationDelay?: number;
}
