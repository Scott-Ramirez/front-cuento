import { MessageCircle } from 'lucide-react';

const CommentsSection = ({ comments, newComment, setNewComment, onAddComment, loading }) => (
  <div className="mt-8">
    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
      <MessageCircle size={22} /> Comentarios ({comments.length})
    </h2>
    <form onSubmit={onAddComment} className="flex gap-2 mb-4">
      <input
        className="flex-1 border rounded px-3 py-2"
        type="text"
        placeholder="Escribe un comentario..."
        value={newComment}
        onChange={e => setNewComment(e.target.value)}
        disabled={loading}
        maxLength={300}
      />
      <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700" disabled={loading || !newComment.trim()}>
        Comentar
      </button>
    </form>
    <div className="space-y-4">
      {comments.map((c) => (
        <div key={c.id} className="bg-gray-100 rounded p-3">
          <div className="text-sm text-gray-600 mb-1">{c.user?.username || 'Anónimo'}</div>
          <div className="text-gray-800">{c.comment}</div>
        </div>
      ))}
      {comments.length === 0 && <div className="text-gray-500">Sé el primero en comentar.</div>}
    </div>
  </div>
);

export default CommentsSection;
