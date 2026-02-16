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
  return (
    <nav style={{
      display: 'flex',
      gap: '2px',
      backgroundColor: '#1e1c1a',
      borderRadius: '8px',
      padding: '3px',
    }}>
      {pages.map((page) => (
        <button
          key={page.id}
          onClick={() => onNavigate(page.id)}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: currentPage === page.id ? '#81b64c' : 'transparent',
            color: currentPage === page.id ? '#1a1a1a' : '#bababa',
            cursor: 'pointer',
            fontWeight: currentPage === page.id ? 600 : 400,
            fontSize: '0.9em',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
        >
          {page.label}
          {page.comingSoon && (
            <span style={{
              marginLeft: '6px',
              fontSize: '0.65em',
              color: currentPage === page.id ? '#1a1a1a' : '#81b64c',
              fontWeight: 500,
              opacity: 0.8,
            }}>
              SOON
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
