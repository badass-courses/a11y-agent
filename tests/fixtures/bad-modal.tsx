import { useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <span className="close-btn" onClick={onClose} style={{ cursor: "pointer" }}>
            &times;
          </span>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button onClick={onClose}>Save</button>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)}>Open Settings</button>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <p>Settings content here...</p>
      </Modal>
    </div>
  );
}
