interface Props {
  moveHistory: string[];
}

export default function MoveHistory({ moveHistory }: Props) {
  return (
    <div className="move-history">
      <h3>Move history</h3>
      <div className="moves-grid">
        {moveHistory.length === 0 && (
          <span className="no-moves">No moves yet</span>
        )}
        {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
          <div key={i} className="move-pair">
            <span className="move-num">{i + 1}.</span>
            <span className="move">{moveHistory[i * 2]}</span>
            <span className="move">{moveHistory[i * 2 + 1] || ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
}