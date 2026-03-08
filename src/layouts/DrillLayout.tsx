import { Link, useNavigate } from "react-router-dom";

export function DrillLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(129,182,76,0.09) 0%, #1a1816 78%)",
      }}
    >
      <header className="sticky top-0 z-50 border-b border-[#2e2b28] py-3 px-5"
        style={{ background: "rgba(26,24,22,0.92)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-240 mx-auto flex items-center justify-between">
          <Link className="flex items-center gap-2.5 no-underline" to="/">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-green-400 to-green-700 flex items-center justify-center text-base shadow-md">
              &#9816;
            </div>
            <span className="font-bold text-base text-white tracking-tight">
              Chess Blindspots
            </span>
          </Link>

          <button
            onClick={() => navigate("/practice")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#6b6864] border border-[#2e2b28] hover:text-[#989795] hover:border-[#3d3a37] transition-all cursor-pointer"
          >
            ✕ Exit drill
          </button>
        </div>
      </header>

      <main className="px-4 py-8 flex-1 flex flex-col">
        <div className="max-w-240 mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
