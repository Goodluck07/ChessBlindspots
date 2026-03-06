interface NavigationProps {
  currentPage: "analyze" | "insights" | "practice";
  onNavigate: (page: "analyze" | "insights" | "practice") => void;
}

const pages = [
  { id: "analyze" as const, label: "Analyze" },
  { id: "insights" as const, label: "Insights" },
  { id: "practice" as const, label: "Practice", comingSoon: true },
];

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <nav className="flex gap-0.5 bg-[#1e1c1a] rounded-lg p-1 border border-[#3d3a37]">
      {pages.map((page) => {
        const isActive = currentPage === page.id;
        return (
          <button
            key={page.id}
            onClick={() => onNavigate(page.id)}
            className={`px-5 py-2.5 rounded-md text-sm transition-all duration-150 relative cursor-pointer
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
          </button>
        );
      })}
    </nav>
  );
}
