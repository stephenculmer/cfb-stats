export interface DataPoint {
  [key: string]: string | number;
}

export interface LineChartSpec {
  type: "line";
  title: string;
  xKey: string;
  yKeys: string[];
  data: DataPoint[];
  xLabel?: string;
  yLabel?: string;
}

export interface BarChartSpec {
  type: "bar";
  title: string;
  xKey: string;
  yKeys: string[];
  data: DataPoint[];
  xLabel?: string;
  yLabel?: string;
  stacked?: boolean;
}

export interface ScatterChartSpec {
  type: "scatter";
  title: string;
  xKey: string;
  yKey: string;
  nameKey?: string;
  data: DataPoint[];
  xLabel?: string;
  yLabel?: string;
}

export interface TableSpec {
  type: "table";
  title: string;
  columns: { key: string; label: string }[];
  data: DataPoint[];
}

export type ChartSpec = LineChartSpec | BarChartSpec | ScatterChartSpec | TableSpec;
