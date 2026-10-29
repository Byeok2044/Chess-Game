import { useEffect, useRef } from 'react';

interface Props {
  moveHistory: string[];
}

export default function MoveHistory({ moveHistory }: Props) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [moveHistory.length]);


  return (
    <section className="move-history" aria-label="Move history">
      <h3>Move history</h3>
      {moveHistory.length === 0 && <p className="no-moves">The board is set. Make the first move.</p>}
    <ol className="moves-grid" ref={listRef}>
      {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
        <li key={i} className="move-pair">
          <span className="move-num">{i + 1}.</span>
          <span className="move">{moveHistory[i * 2]}</span>
          <span className="move">{moveHistory[i * 2 + 1] ?? ''}</span>
        </li>
      ))}
    </ol>
    </section>
  );
}