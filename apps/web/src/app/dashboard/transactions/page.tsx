import { getMyTransactions } from "@/lib/actions/dashboard-actions";
import { TransactionTable } from "@/components/dashboard/transaction-table";

export default async function TransactionsPage() {
  const { transactions } = await getMyTransactions({ limit: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-500 mt-1">All payments received for your agents.</p>
      </div>
      <TransactionTable transactions={transactions} />
    </div>
  );
}
