import type { DownloadRecord } from "@/lib/actions/dashboard-actions";

interface DownloadTableProps {
  downloads: DownloadRecord[];
}

export function TransactionTable({ downloads }: DownloadTableProps) {
  if (!downloads.length) {
    return (
      <div className="text-center py-12">
        <p className="font-mono text-sm text-text-muted">No downloads yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-bg-border">
      <table className="w-full font-mono text-sm">
        <thead className="bg-bg-surface border-b border-bg-border">
          <tr>
            <th className="text-left px-4 py-3 text-[10px] font-medium text-text-muted uppercase tracking-wide">Agent</th>
            <th className="text-left px-4 py-3 text-[10px] font-medium text-text-muted uppercase tracking-wide">Version</th>
            <th className="text-right px-4 py-3 text-[10px] font-medium text-text-muted uppercase tracking-wide">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-bg-border">
          {downloads.map((dl) => (
            <tr key={dl.id} className="hover:bg-bg-surface/50 transition-colors">
              <td className="px-4 py-3 text-text-primary text-xs">
                {dl.agentId.slice(0, 8)}…
              </td>
              <td className="px-4 py-3 text-[10px] text-text-tertiary">
                {dl.version}
              </td>
              <td className="px-4 py-3 text-right text-text-muted text-[10px]">
                {new Date(dl.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
