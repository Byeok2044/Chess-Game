interface Props {
  moveHistory: string[];
}

export default function MoveHistory({ moveHistory }: Props) {
  if (moveHistory.length === 0) return <p className="no-moves">No moves yet</p>;

  return (
    <ol className="moves-grid">
      {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
        <li key={i} className="move-pair">
          <span className="move-num">{i + 1}.</span>
          <span>{moveHistory[i * 2]}</span>
          <span>{moveHistory[i * 2 + 1] ?? ''}</span>
        </li>
      ))}
    </ol>
  );
}