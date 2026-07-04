import Modal from './Modal';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
        {message}
      </p>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-danger" onClick={onConfirm}>🗑️ Confirmar Exclusão</button>
      </div>
    </Modal>
  );
}
