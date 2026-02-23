import type { Transaction } from "@repo/types";
import { formatUSDC, truncateAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-50 text-green-700",
  pending: "bg-yellow-50 text-yellow-700",
  failed: "bg-red-50 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (!transactions.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm">No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Consumer</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Fee</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Payout</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {new Date(tx.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-600">
                {truncateAddress(tx.consumerWallet)}
              </td>
              <td className="px-4 py-3 text-right text-gray-900 font-medium">
                {formatUSDC(tx.amount)}
              </td>
              <td className="px-4 py-3 text-right text-gray-500">
                {formatUSDC(tx.platformFee)}
              </td>
              <td className="px-4 py-3 text-right text-green-700 font-medium">
                {formatUSDC(tx.creatorPayout)}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={cn(
                    "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                    STATUS_STYLES[tx.status] ?? "bg-gray-100 text-gray-600"
                  )}
                >
                  {tx.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
