import './Menu.css';

export default function About({ onBack }: { onBack: () => void }) {
  return (
    <div className="menu-root">
      <div className="menu-content">
        <div className="menu-logo">
          <span className="menu-logo-piece">♟</span>
          <h1 className="menu-title">About</h1>
        </div>
        <p className="menu-subtitle about-text">
          A chess game built with React and TypeScript. Play locally against a friend or
          the computer, or challenge someone online with an invite code. Games are
          auto-saved so you can pick up right where you left off.
        </p>
        <button className="btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}