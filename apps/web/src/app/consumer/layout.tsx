import { auth } from "@clerk/nextjs/server";
import { ConsumerSidebar } from "@/components/layout/consumer-sidebar";

export default async function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <ConsumerSidebar userId={userId ?? undefined} />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
