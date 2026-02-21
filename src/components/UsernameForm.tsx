import { useState, type FormEvent } from 'react';

interface UsernameFormProps {
  onSubmit: (username: string) => void;
  loading: boolean;
}

export function UsernameForm({ onSubmit, loading }: UsernameFormProps) {
  const [username, setUsername] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim() && !loading) {
      onSubmit(username.trim());
    }
  };

  const isDisabled = loading || !username.trim();

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter chess.com username"
        disabled={loading}
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
        style={{
          padding: '12px 16px',
          fontSize: '16px',
          backgroundColor: '#1e1c1a',
          border: `2px solid ${inputFocused ? '#81b64c' : '#3d3a37'}`,
          borderRadius: '6px',
          flex: '1 1 200px',
          minWidth: '0',
          color: '#bababa',
          outline: 'none',
          transition: 'border-color 0.2s ease',
        }}
      />
      <button
        type="submit"
        disabled={isDisabled}
        onMouseEnter={() => setButtonHovered(true)}
        onMouseLeave={() => setButtonHovered(false)}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 600,
          backgroundColor: isDisabled
            ? '#3d3a37'
            : buttonHovered
            ? '#9bc968'
            : '#81b64c',
          color: isDisabled ? '#989795' : '#ffffff',
          border: 'none',
          borderRadius: '6px',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s ease',
        }}
      >
        {loading ? 'Analyzing...' : 'Find Blunders'}
      </button>
    </form>
  );
}
