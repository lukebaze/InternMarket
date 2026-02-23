import { auth } from "@/lib/auth";
import { ConsumerSidebar } from "@/components/layout/consumer-sidebar";

export default async function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const walletAddress = (session?.user as { address?: string })?.address;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <ConsumerSidebar walletAddress={walletAddress} />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
