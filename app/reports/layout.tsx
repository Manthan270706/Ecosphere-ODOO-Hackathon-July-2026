import Sidebar from "@/components/layout/Sidebar";

export default function reportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-h-screen bg-slate-50 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
