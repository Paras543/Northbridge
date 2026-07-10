import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content offset by the sidebar width */}
      <div className="flex-1 md:pl-sidebar-width flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
