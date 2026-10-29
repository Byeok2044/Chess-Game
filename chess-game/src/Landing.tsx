import { useState } from 'react';
import Leaderboard from './Leaderboard.tsx';
import './Menu.css';
import './Landing.css';

interface Props {
  onPlay: () => void;
  onSettings: () => void;
  onAbout: () => void;
  onPuzzles: () => void;
}

export default function Landing({ onPlay, onSettings, onAbout, onPuzzles }: Props) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  return (
    <div className="landing">
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      <header className="landing-masthead">
        <span className="brand-mark"><span aria-hidden="true">♞</span> CHESS / REIMAGINED</span>
        <span className="masthead-note">64 SQUARES. NO ALIBIS.</span>
      </header>
      <div className="landing-art" aria-hidden="true">
        <div className="art-orbit" />
        <div className="art-star" />
        <img className="hero-knight" src="/rebel-knight.svg" alt="" />
        <span className="art-caption">YOUR NEXT MOVE<br />CHANGES EVERYTHING.</span>
        <span className="art-cross cross-one">✦</span>
        <span className="art-cross cross-two">✦</span>
      </div>
      <main className="landing-content">
        <p className="landing-eyebrow">A BATTLE OF WITS</p>
        <h1 className="landing-title">CH<span>E</span>SS<span className="title-period">.</span></h1>
        <p className="landing-tagline"><span>TAKE THE KING.</span><br />OWN THE BOARD.</p>
        <nav className="landing-actions" aria-label="Main menu">
          <button className="landing-action primary" onClick={onPlay}><span className="command-number">01</span><span>Play</span><span className="command-arrow" aria-hidden="true">↗</span></button>
          <button className="landing-action" onClick={onPuzzles}><span className="command-number">02</span><span>Puzzles</span><span className="command-arrow" aria-hidden="true">↗</span></button>
          <button className="landing-action" onClick={onSettings}><span className="command-number">03</span><span>Settings</span><span className="command-arrow" aria-hidden="true">↗</span></button>
          <button className="landing-action" onClick={onAbout}><span className="command-number">04</span><span>About</span><span className="command-arrow" aria-hidden="true">↗</span></button>
        </nav>
      </main>
      <footer className="landing-footer"><span>LOCAL / COMPUTER / ONLINE</span><button className="rankings-link" onClick={() => setShowLeaderboard(true)}>↗ Leaderboard</button><span>MAKE YOUR MOVE <span aria-hidden="true">✦</span></span></footer>
    </div>
  );
}
