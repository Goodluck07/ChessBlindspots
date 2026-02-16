import { useState } from 'react';
import { BlunderCard } from './BlunderCard';
import type { Blunder } from '../types';

interface GameCardProps {
  gameUrl: string;
  blunders: Blunder[];
}

export function GameCard({ gameUrl, blunders }: GameCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const game = blunders[0];

  const worstDrop = Math.max(...blunders.map(b => b.evalDrop)) / 100;

  return (
    <div
      className="fade-in"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#1e1c1a',
        borderRadius: '10px',
        border: '1px solid #3d3a37',
        overflow: 'hidden',
        boxShadow: hovered ? '0 6px 20px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.15)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      {/* Clickable Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '16px 20px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Opponent */}
          <span style={{ color: '#e0e0e0', fontSize: '1em', fontWeight: 600 }}>
            vs {game.opponent}
          </span>

          {/* Pills */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{
              padding: '3px 10px',
              backgroundColor: '#3d3a37',
              borderRadius: '12px',
              fontSize: '0.75em',
              color: '#bababa',
              textTransform: 'capitalize',
            }}>
              {game.timeClass}
            </span>
            <span style={{
              padding: '3px 10px',
              backgroundColor: game.gameResult === 'win' ? '#2d3a29' :
                               game.gameResult === 'loss' ? '#3d2522' : '#3d3a37',
              borderRadius: '12px',
              fontSize: '0.75em',
              color: game.gameResult === 'win' ? '#81b64c' :
                     game.gameResult === 'loss' ? '#fa412d' : '#bababa',
            }}>
              {game.gameResult === 'win' ? 'Won' :
               game.gameResult === 'loss' ? 'Lost' : 'Draw'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Stats */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#fa412d', fontSize: '0.9em', fontWeight: 600 }}>
              {blunders.length} blunder{blunders.length > 1 ? 's' : ''}
            </div>
            <div style={{ color: '#989795', fontSize: '0.75em' }}>
              worst: -{worstDrop.toFixed(1)}
            </div>
          </div>

          {/* Chevron */}
          <span style={{
            color: '#989795',
            fontSize: '1.2em',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}>
            ▼
          </span>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div style={{
          padding: '0 20px 20px',
          borderTop: '1px solid #3d3a37',
        }}>
          {/* View Game Link */}
          <div style={{
            padding: '12px 0',
            marginBottom: '12px',
          }}>
            <a
              href={gameUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#81b64c',
                fontSize: '0.85em',
                textDecoration: 'none',
              }}
            >
              View full game on chess.com →
            </a>
          </div>

          {/* Blunders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {blunders.map((blunder) => (
              <BlunderCard
                key={`${blunder.gameUrl}-${blunder.moveNumber}`}
                blunder={blunder}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
