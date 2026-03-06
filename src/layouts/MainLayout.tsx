import { Footer } from "../components/layout/Footer";
import { MainNavbar } from "../components/layout/MainNavbar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <MainNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
