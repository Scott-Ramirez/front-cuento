import { useState } from 'react';

const ReplyCommentForm = ({ onReply, loading, onCancel }) => {
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reply.trim()) {
      setError('Respuesta requerida');
      return;
    }
    setError('');
    await onReply(reply);
    setReply('');
    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
      <textarea
        className="border px-2 py-1 rounded"
        placeholder="Escribe una respuesta..."
        value={reply}
        onChange={e => setReply(e.target.value)}
        rows={2}
        disabled={loading}
        maxLength={300}
      />
      {error && <div className="text-red-600 text-xs">{error}</div>}
      <div className="flex gap-2">
        <button type="submit" className="bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700" disabled={loading}>
          Responder
        </button>
        {onCancel && (
          <button type="button" className="text-gray-600 px-3 py-1 rounded hover:bg-gray-200" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default ReplyCommentForm;
