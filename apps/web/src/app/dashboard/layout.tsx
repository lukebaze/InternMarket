import { auth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ensureCreatorOnLogin } from "@/lib/actions/creator-actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const walletAddress = (session?.user as { address?: string })?.address;

  // Auto-create creator row on first dashboard visit
  if (walletAddress) {
    await ensureCreatorOnLogin();
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <DashboardSidebar walletAddress={walletAddress} />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
