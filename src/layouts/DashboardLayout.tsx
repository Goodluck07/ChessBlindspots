import { DashboardNavbar } from "../components/layout/DashboardNavbar";
import { Footer } from "../components/layout/Footer";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(129,182,76,0.06) 0%, #1a1816 68%)",
      }}
    >
      <DashboardNavbar />
      <main className="px-5 py-8 flex-1">
        <div className="max-w-240 mx-auto">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
