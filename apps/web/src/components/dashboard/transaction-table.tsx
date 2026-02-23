import type { Transaction } from "@repo/types";
import { formatUSDC, truncateAddress } from "@/lib/utils";

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (!transactions.length) {
    return (
      <div className="text-center py-12">
        <p className="font-mono text-sm text-text-muted">No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-bg-border">
      <table className="w-full font-mono text-sm">
        <thead className="bg-bg-surface border-b border-bg-border">
          <tr>
            <th className="text-left px-4 py-3 text-[10px] font-medium text-text-muted uppercase tracking-wide">Agent</th>
            <th className="text-left px-4 py-3 text-[10px] font-medium text-text-muted uppercase tracking-wide">Consumer</th>
            <th className="text-right px-4 py-3 text-[10px] font-medium text-text-muted uppercase tracking-wide">Amount</th>
            <th className="text-right px-4 py-3 text-[10px] font-medium text-text-muted uppercase tracking-wide">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-bg-border">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-bg-surface/50 transition-colors">
              <td className="px-4 py-3 text-text-primary text-xs">
                {tx.agentId.slice(0, 8)}…
              </td>
              <td className="px-4 py-3 text-[10px] text-text-tertiary">
                {truncateAddress(tx.consumerWallet)}
              </td>
              <td className="px-4 py-3 text-right text-lime text-xs font-medium">
                +{formatUSDC(tx.creatorPayout)}
              </td>
              <td className="px-4 py-3 text-right text-text-muted text-[10px]">
                {new Date(tx.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
