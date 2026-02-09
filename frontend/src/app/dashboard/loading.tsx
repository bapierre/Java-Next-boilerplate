export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#FFBE18] border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );
}
