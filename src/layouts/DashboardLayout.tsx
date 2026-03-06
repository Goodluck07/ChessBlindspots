import { DashboardNavbar } from "../components/layout/DashboardNavbar";
import { Footer } from "../components/layout/Footer";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <DashboardNavbar />
      <main className="px-5 py-8 flex-1">
        <div className="max-w-240 mx-auto">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
