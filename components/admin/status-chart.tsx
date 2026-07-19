"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PROPERTY_STATUS_LABEL } from "@/lib/utils";
import type { PropertyStatus } from "@/types";

const COLORS: Record<PropertyStatus, string> = {
  draft: "#6F745D",
  available: "#A47C48",
  reserved: "#D8C5A5",
  rented: "#8A9A7E",
  sold: "#151816",
  archived: "#C4C4C4",
};

export function StatusChart({ byStatus }: { byStatus: Record<PropertyStatus, number> }) {
  const data = (Object.keys(byStatus) as PropertyStatus[]).map((status) => ({
    status: PROPERTY_STATUS_LABEL[status],
    count: byStatus[status],
    key: status,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="status" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
            cursor={{ fill: "var(--muted)" }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={COLORS[entry.key]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
