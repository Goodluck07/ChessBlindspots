import { useState } from 'react';

interface NavigationProps {
  currentPage: 'analyze' | 'insights' | 'practice';
  onNavigate: (page: 'analyze' | 'insights' | 'practice') => void;
}

const pages = [
  { id: 'analyze' as const, label: 'Analyze' },
  { id: 'insights' as const, label: 'Insights', comingSoon: true },
  { id: 'practice' as const, label: 'Practice', comingSoon: true },
];

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [hoveredPage, setHoveredPage] = useState<string | null>(null);

  return (
    <nav style={{
      display: 'flex',
      gap: '2px',
      backgroundColor: '#1e1c1a',
      borderRadius: '10px',
      padding: '4px',
      border: '1px solid #3d3a37',
    }}>
      {pages.map((page) => {
        const isActive = currentPage === page.id;
        const isHovered = hoveredPage === page.id;
        return (
          <button
            key={page.id}
            onClick={() => onNavigate(page.id)}
            onMouseEnter={() => setHoveredPage(page.id)}
            onMouseLeave={() => setHoveredPage(null)}
            style={{
              padding: '10px 20px',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: isActive
                ? '#81b64c'
                : isHovered
                  ? 'rgba(129, 182, 76, 0.15)'
                  : 'transparent',
              color: isActive ? '#1a1a1a' : isHovered ? '#81b64c' : '#bababa',
              cursor: 'pointer',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.9em',
              transition: 'all 0.15s ease',
              position: 'relative',
            }}
          >
            {page.label}
            {page.comingSoon && (
              <span style={{
                marginLeft: '6px',
                fontSize: '0.6em',
                color: isActive ? 'rgba(26, 26, 26, 0.7)' : '#81b64c',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                soon
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
