"use client";

import { useRef } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { ChartSpec } from "@/lib/chart-spec";

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

function exportChartAsPng(container: HTMLDivElement, title: string) {
  const svg = container.querySelector("svg");
  if (!svg) return;

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const width = svg.clientWidth || 600;
  const height = svg.clientHeight || 350;

  const canvas = document.createElement("canvas");
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.scale(2, 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, width, height);
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };
  img.src =
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
}

function exportTableAsCsv(
  columns: { key: string; label: string }[],
  data: Record<string, string | number>[],
  title: string
) {
  const rows = [
    columns.map((c) => JSON.stringify(c.label)).join(","),
    ...data.map((row) =>
      columns.map((c) => JSON.stringify(row[c.key] ?? "")).join(",")
    ),
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  spec: ChartSpec;
}

export default function ChartRenderer({ spec }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const header = (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
        {spec.title}
      </h3>
      {spec.type !== "table" ? (
        <button
          onClick={() => containerRef.current && exportChartAsPng(containerRef.current, spec.title)}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Download PNG"
        >
          ↓ PNG
        </button>
      ) : (
        <button
          onClick={() => exportTableAsCsv(spec.columns, spec.data, spec.title)}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Download CSV"
        >
          ↓ CSV
        </button>
      )}
    </div>
  );

  if (spec.type === "bar") {
    return (
      <div
        ref={containerRef}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 my-3"
      >
        {header}
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={spec.data} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey={spec.xKey}
              label={spec.xLabel ? { value: spec.xLabel, position: "insideBottom", offset: -28, fontSize: 12 } : undefined}
              tick={{ fontSize: 11 }}
              angle={spec.data.length > 6 ? -35 : 0}
              textAnchor={spec.data.length > 6 ? "end" : "middle"}
              interval={0}
            />
            <YAxis
              label={spec.yLabel ? { value: spec.yLabel, angle: -90, position: "insideLeft", offset: 10, fontSize: 12 } : undefined}
              tick={{ fontSize: 11 }}
              width={50}
            />
            <Tooltip />
            {spec.yKeys.length > 1 && <Legend verticalAlign="top" height={28} />}
            {spec.yKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[i % COLORS.length]}
                stackId={spec.stacked ? "stack" : undefined}
                radius={[3, 3, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (spec.type === "line") {
    return (
      <div
        ref={containerRef}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 my-3"
      >
        {header}
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={spec.data} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey={spec.xKey}
              label={spec.xLabel ? { value: spec.xLabel, position: "insideBottom", offset: -28, fontSize: 12 } : undefined}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              label={spec.yLabel ? { value: spec.yLabel, angle: -90, position: "insideLeft", offset: 10, fontSize: 12 } : undefined}
              tick={{ fontSize: 11 }}
              width={50}
            />
            <Tooltip />
            {spec.yKeys.length > 1 && <Legend verticalAlign="top" height={28} />}
            {spec.yKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (spec.type === "scatter") {
    return (
      <div
        ref={containerRef}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 my-3"
      >
        {header}
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey={spec.xKey}
              name={spec.xLabel ?? spec.xKey}
              label={spec.xLabel ? { value: spec.xLabel, position: "insideBottom", offset: -28, fontSize: 12 } : undefined}
              tick={{ fontSize: 11 }}
              type="number"
            />
            <YAxis
              dataKey={spec.yKey}
              name={spec.yLabel ?? spec.yKey}
              label={spec.yLabel ? { value: spec.yLabel, angle: -90, position: "insideLeft", offset: 10, fontSize: 12 } : undefined}
              tick={{ fontSize: 11 }}
              width={50}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload as Record<string, string | number>;
                return (
                  <div className="rounded-lg border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 px-3 py-2 text-xs shadow-md">
                    {spec.nameKey && <div className="font-semibold mb-1">{d[spec.nameKey]}</div>}
                    <div>{spec.xLabel ?? spec.xKey}: {d[spec.xKey]}</div>
                    <div>{spec.yLabel ?? spec.yKey}: {d[spec.yKey]}</div>
                  </div>
                );
              }}
            />
            <Scatter data={spec.data} fill={COLORS[0]} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (spec.type === "table") {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 my-3">
        {header}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {spec.columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {spec.data.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {spec.columns.map((col) => (
                    <td key={col.key} className="py-2 px-3 text-gray-800 dark:text-gray-200">
                      {row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}
