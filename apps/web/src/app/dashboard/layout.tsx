import { auth } from "@clerk/nextjs/server";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ensureCreatorOnLogin } from "@/lib/actions/creator-actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  // Auto-create creator row on first dashboard visit
  if (userId) {
    await ensureCreatorOnLogin();
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <DashboardSidebar userId={userId ?? undefined} />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
