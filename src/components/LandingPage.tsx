import { DemoBlunder } from './DemoBlunder';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#bababa' }}>

      {/* ─── HEADER ─── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(39, 37, 34, 0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #3d3a37',
        padding: '14px 24px',
      }}>
        <div style={{
          maxWidth: '960px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #81b64c 0%, #6a9a3d 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              boxShadow: '0 2px 8px rgba(129,182,76,0.3)',
            }}>&#9816;</div>
            <span style={{ fontWeight: 700, fontSize: '1.2em', color: '#fff' }}>
              Chess Blindspots
            </span>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#how-it-works" className="landing-nav-link" style={{ color: '#989795', fontSize: '0.9em', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#989795')}>
              How It Works
            </a>
            <a href="#features" className="landing-nav-link" style={{ color: '#989795', fontSize: '0.9em', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#989795')}>
              Features
            </a>
            <button
              onClick={onGetStarted}
              style={{
                backgroundColor: '#81b64c',
                color: '#1a1a1a',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontWeight: 700,
                fontSize: '0.9em',
                cursor: 'pointer',
              }}
            >
              Try It Free
            </button>
          </nav>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section style={{
        padding: '100px 24px 80px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(129,182,76,0.06) 0%, transparent 100%)',
        borderBottom: '1px solid #3d3a37',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(129,182,76,0.12)',
            color: '#81b64c',
            border: '1px solid rgba(129,182,76,0.3)',
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '0.82em',
            fontWeight: 600,
            letterSpacing: '0.5px',
            marginBottom: '28px',
            textTransform: 'uppercase',
          }}>
            Powered by Stockfish
          </div>

          <h1 style={{
            fontSize: 'clamp(2em, 5vw, 3.4em)',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.15,
            margin: '0 0 24px',
            letterSpacing: '-0.5px',
          }}>
            Stop Repeating the{' '}
            <span style={{ color: '#81b64c' }}>Same Mistakes</span>
          </h1>

          <p style={{
            fontSize: '1.15em',
            color: '#989795',
            lineHeight: 1.7,
            margin: '0 0 40px',
            maxWidth: '560px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Chess Blindspots analyzes your recent games, finds your worst blunders,
            and shows you exactly what you should have played instead.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onGetStarted}
              style={{
                backgroundColor: '#81b64c',
                color: '#1a1a1a',
                border: 'none',
                borderRadius: '10px',
                padding: '14px 32px',
                fontWeight: 700,
                fontSize: '1.05em',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(129,182,76,0.35)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(129,182,76,0.45)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(129,182,76,0.35)';
              }}
            >
              Analyze My Games
            </button>
            <a
              href="#how-it-works"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'transparent',
                color: '#bababa',
                border: '1px solid #3d3a37',
                borderRadius: '10px',
                padding: '14px 28px',
                fontWeight: 500,
                fontSize: '1.05em',
                textDecoration: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#81b64c')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#3d3a37')}
            >
              See How It Works
            </a>
          </div>

          <p style={{ marginTop: '20px', fontSize: '0.82em', color: '#5a5856' }}>
            Free · No account needed · Works with chess.com
          </p>
        </div>
      </section>

      {/* ─── SECTION 1: HOW IT WORKS ─── */}
      <section id="how-it-works" style={{
        padding: '80px 24px',
        borderBottom: '1px solid #3d3a37',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '2em', fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>
              How It Works
            </h2>
            <p style={{ color: '#989795', fontSize: '1.05em', margin: 0 }}>
              Three steps to finding your blindspots
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
          }}>
            {[
              {
                step: '01',
                icon: '♟',
                title: 'Enter Your Username',
                description: 'Type in your Chess.com username. No login or API key required.',
              },
              {
                step: '02',
                icon: '⚙',
                title: 'We Analyze Your Games',
                description: 'Stockfish evaluates your last 10 games move-by-move, flagging any moment where you dropped 2+ pawns of evaluation.',
              },
              {
                step: '03',
                icon: '♛',
                title: 'See Your Worst Blunders',
                description: 'Your top mistakes appear as interactive boards showing what you played vs. what you should have played.',
              },
            ].map(({ step, icon, title, description }) => (
              <div key={step} style={{
                backgroundColor: '#1e1c1a',
                border: '1px solid #3d3a37',
                borderRadius: '12px',
                padding: '28px 24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(129,182,76,0.12)',
                    border: '1px solid rgba(129,182,76,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                  }}>
                    {icon}
                  </div>
                  <span style={{ color: '#5a5856', fontSize: '0.75em', fontWeight: 700, letterSpacing: '1px' }}>
                    STEP {step}
                  </span>
                </div>
                <h3 style={{ color: '#fff', fontWeight: 600, fontSize: '1.1em', margin: '0 0 10px' }}>
                  {title}
                </h3>
                <p style={{ color: '#989795', fontSize: '0.95em', lineHeight: 1.6, margin: 0 }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: SEE IT IN ACTION ─── */}
      <section id="features" style={{
        padding: '80px 24px',
        borderBottom: '1px solid #3d3a37',
        backgroundColor: 'rgba(0,0,0,0.15)',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2em', fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>
              See It In Action
            </h2>
            <p style={{ color: '#989795', fontSize: '1.05em', margin: 0 }}>
              An interactive example — toggle between the mistake and the best move
            </p>
          </div>
          <DemoBlunder />
        </div>
      </section>

      {/* ─── SECTION 3: WHO IT'S FOR ─── */}
      <section style={{ padding: '80px 24px', borderBottom: '1px solid #3d3a37' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2em', fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>
              Built for Players Who Want to Improve
            </h2>
            <p style={{ color: '#989795', fontSize: '1.05em', margin: 0, maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
              Whether you're a casual weekend player or grinding to hit your next rating milestone.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            {[
              {
                quote: '"I kept hanging the same piece in the endgame and had no idea. This showed me the pattern immediately."',
                label: 'Club Player, 1100 Elo',
              },
              {
                quote: '"Filter by blitz games only? Yes please. My rapid blunders are totally different from my bullet mistakes."',
                label: 'Blitz Enthusiast, 1450 Elo',
              },
              {
                quote: '"Free, no sign-up, just paste your username and go. Exactly what I needed."',
                label: 'Casual Player',
              },
            ].map(({ quote, label }) => (
              <div key={label} style={{
                backgroundColor: '#1e1c1a',
                border: '1px solid #3d3a37',
                borderRadius: '12px',
                padding: '24px',
              }}>
                <div style={{
                  fontSize: '1.5em',
                  color: '#81b64c',
                  marginBottom: '12px',
                  lineHeight: 1,
                }}>
                  "
                </div>
                <p style={{
                  color: '#bababa',
                  fontSize: '0.95em',
                  lineHeight: 1.65,
                  margin: '0 0 16px',
                  fontStyle: 'italic',
                }}>
                  {quote.slice(1, -1)}
                </p>
                <span style={{
                  fontSize: '0.78em',
                  color: '#5a5856',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  — {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER CTA ─── */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, transparent 0%, rgba(129,182,76,0.05) 100%)',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2em', fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>
            Ready to Find Your Blindspots?
          </h2>
          <p style={{ color: '#989795', fontSize: '1.05em', margin: '0 0 36px' }}>
            It takes 30 seconds. Enter your username and see exactly where your games fall apart.
          </p>
          <button
            onClick={onGetStarted}
            style={{
              backgroundColor: '#81b64c',
              color: '#1a1a1a',
              border: 'none',
              borderRadius: '10px',
              padding: '16px 40px',
              fontWeight: 700,
              fontSize: '1.1em',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(129,182,76,0.4)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'}
          >
            Analyze My Games — It's Free
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 20px',
        borderTop: '1px solid #3d3a37',
        color: '#5a5856',
        fontSize: '0.85em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontWeight: 600 }}>
          &#9816; Chess Blindspots
        </span>
        <span style={{ color: '#3d3a37' }}>|</span>
        <span>Built with Stockfish + React</span>
        <span style={{ color: '#3d3a37' }}>|</span>
        <a
          href="https://github.com/Goodluck07/ChessBlindspots"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#81b64c', textDecoration: 'none' }}
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
}
