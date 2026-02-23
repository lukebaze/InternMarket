import { getMyTransactions } from "@/lib/actions/dashboard-actions";
import { TransactionTable } from "@/components/dashboard/transaction-table";

export default async function TransactionsPage() {
  const { transactions } = await getMyTransactions({ limit: 50 });

  return (
    <>
      <div className="flex items-center justify-between h-14 px-8 border-b border-bg-border shrink-0">
        <h1 className="font-ui text-base font-semibold text-text-primary">Transactions</h1>
        <p className="font-mono text-[11px] text-text-muted">All payments received for your agents</p>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        <TransactionTable transactions={transactions} />
      </div>
    </>
  );
}
