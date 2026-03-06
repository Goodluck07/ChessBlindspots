import { Link, useLocation } from "react-router-dom";

const pages = [
  { id: "analyze" as const, label: "Analyze", path: "/analyze" },
  { id: "insights" as const, label: "Insights", path: "/insights" },
  {
    id: "practice" as const,
    label: "Practice",
    path: "/practice",
    comingSoon: true,
  },
];

export function DashboardNavbar() {
  const location = useLocation();

  return (
    <>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-linear-to-b from-[rgba(39,37,34,0.98)] to-[rgba(39,37,34,0.95)] backdrop-blur-md border-b border-[#3d3a37] py-3 px-5">
        <div className="max-w-240 mx-auto flex items-center justify-between gap-4 flex-col md:flex-row flex-wrap">
          {/* Logo */}
          <Link className="flex items-center gap-2.5" to="/">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-green-400 to-green-700 flex items-center justify-center text-lg shadow-md">
              &#9816;
            </div>
            <span className="font-bold text-xl text-white ">
              Chess Blindspots
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center justify-center gap-0.5 bg-[#1e1c1a] rounded-lg p-1 border border-[#3d3a37]">
            {pages.map((page) => {
              const isActive = location.pathname === page.path;
              return (
                <Link
                  key={page.id}
                  to={page.path}
                  className={`px-5 py-1 rounded-md text-sm transition-all duration-150 relative cursor-pointer no-underline
                   ${
                     isActive
                       ? "bg-green-600 text-black font-semibold"
                       : "text-gray-400 hover:text-green-400 hover:bg-green-100 font-medium"
                   }`}
                >
                  {page.label}
                  {page.comingSoon && (
                    <span
                      className={`ml-1 text-[0.6em] uppercase tracking-wider font-semibold 
                       ${isActive ? "text-black/70" : "text-green-600"}`}
                    >
                      soon
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}
