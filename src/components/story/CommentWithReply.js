import ReplyCommentForm from './ReplyCommentForm';

const CommentWithReply = ({ comment, onReply, replyingId, setReplyingId, loading, replies }) => {
  const isReplying = replyingId === comment.id;
  return (
    <div className="bg-gray-100 rounded p-3">
      <div className="text-sm text-gray-600 mb-1">{comment.user?.username || 'Anónimo'}</div>
      <div className="text-gray-800">{comment.comment}</div>
      <div className="mt-2">
        <button
          className="text-primary-600 text-xs hover:underline mr-2"
          onClick={() => setReplyingId(isReplying ? null : comment.id)}
        >
          {isReplying ? 'Cancelar' : 'Responder'}
        </button>
      </div>
      {isReplying && (
        <ReplyCommentForm
          onReply={reply => onReply(comment.id, reply)}
          loading={loading}
          onCancel={() => setReplyingId(null)}
        />
      )}
      {/* Mostrar respuestas si existen */}
      {replies && replies.length > 0 && (
        <div className="ml-6 mt-2 space-y-2">
          {replies.map(r => (
            <div key={r.id} className="bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-600 mb-1">{r.user?.username || 'Anónimo'}</div>
              <div className="text-gray-700 text-sm">{r.comment}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentWithReply;
