import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { getActivityLogs } from "@/lib/data/admin-activity";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Activity Logs" };

export default async function ActivityLogsPage() {
  const logs = await getActivityLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-charcoal">Activity Logs</h1>
        <p className="text-sm text-muted-foreground">A record of admin actions across the platform.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => {
              const actor = (log as unknown as { actor: { full_name: string | null; email: string } | null }).actor;
              return (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-charcoal">{actor?.full_name || actor?.email || "System"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="capitalize">{log.action.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.entity_type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(log.created_at)}</td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No activity recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
