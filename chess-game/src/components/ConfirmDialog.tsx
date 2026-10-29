import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export function useConfirm() {
  const [message, setMessage] = useState<string | null>(null);
  const pending = useRef<((answer: boolean) => void) | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (message) dialog.current?.showModal();
  }, [message]);
  useEffect(() => () => pending.current?.(false), []);

  function finish(answer: boolean) {
    dialog.current?.close();
    pending.current?.(answer);
    pending.current = null;
    setMessage(null);
  }

  function confirm(text: string) {
    return new Promise<boolean>((resolve) => {
      pending.current = resolve;
      setMessage(text);
    });
  }

  const confirmation = message && createPortal(
    <dialog ref={dialog} className="confirm-dialog" aria-labelledby="confirm-title" aria-describedby="confirm-message" onCancel={(event) => { event.preventDefault(); finish(false); }}>
      <span className="dialog-eyebrow">ONE MORE THING</span>
      <h2 id="confirm-title">Make the call.</h2>
      <p id="confirm-message">{message}</p>
      <div className="confirm-actions">
        <button className="btn-ghost" autoFocus onClick={() => finish(false)}>Stay here</button>
        <button className="btn-primary" onClick={() => finish(true)}>Continue</button>
      </div>
    </dialog>, document.body,
  );
  return { confirm, confirmation };
}
