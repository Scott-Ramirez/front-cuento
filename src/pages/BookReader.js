import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, X, Send, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { showSuccess, showError, showWarning } from '../utils/alerts';
import { getMediaUrl } from '../utils/media';

const BookReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageFlipping, setPageFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('');

  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [displayedComments, setDisplayedComments] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isOwnStory, setIsOwnStory] = useState(false);

  useEffect(() => {
    fetchStory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (story && user) {
      const isOwn = story.user_id === user.id;
      setIsOwnStory(isOwn);
      if (!isOwn) incrementView();
      checkIfLiked();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, user?.id]);

  const fetchStory = async () => {
    try {
      const response = await api.get(`/stories/${id}`);
      setStory(response.data);
      setChapters(response.data.chapters || []);

      const likesRes = await api.get(`/stories/${id}/likes/count`);
      setLikesCount(likesRes.data.count || 0);

      fetchComments();
    } catch (error) {
      console.error('Error fetching story:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const commentsRes = await api.get(`/stories/${id}/comments`);
      setComments(commentsRes.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const incrementView = async () => {
    try {
      const response = await api.post(`/stories/${id}/view`);
      if (response.data.views_count && story) {
        setStory({ ...story, views_count: response.data.views_count });
      }
    } catch (error) {
      console.error('Error incrementing view:', error);
    }
  };

  const checkIfLiked = async () => {
    try {
      const response = await api.get(`/stories/${id}/likes`);
      const userLike = response.data.find(like => like.user_id === user.id);
      setHasLiked(!!userLike);
    } catch (error) {
      console.error('Error checking like:', error);
    }
  };

  const handleLike = async () => {
    if (isOwnStory) return;
    try {
      await api.post(`/stories/${id}/likes`);
      setHasLiked(!hasLiked);
      setLikesCount(prev => hasLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error toggling like:', error);
      showError('Error al procesar el like');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (isOwnStory) return;
    if (!newComment.trim()) {
      showWarning('Por favor escribe un comentario');
      return;
    }

    try {
      const commentData = { comment: newComment };
      if (replyTo) commentData.parent_comment_id = replyTo.id;

      await api.post(`/stories/${id}/comments`, commentData);
      setNewComment('');
      setReplyTo(null);
      fetchComments();
      showSuccess(replyTo ? 'Respuesta enviada' : 'Comentario publicado');
    } catch (error) {
      console.error('Error posting comment:', error);
      showError('Error al publicar el comentario');
    }
  };

  const handleReply = (commentId, username) => {
    setReplyTo({ id: commentId, username });
    setShowComments(true);
  };

  const cancelReply = () => {
    setReplyTo(null);
    setNewComment('');
  };

  const loadMoreComments = () => setDisplayedComments(prev => prev + 5);

  const organizeComments = () => {
    const parentComments = comments.filter(c => !c.parent_comment_id);
    const childComments = comments.filter(c => c.parent_comment_id);
    return parentComments.map(parent => ({
      ...parent,
      replies: childComments.filter(child => child.parent_comment_id === parent.id)
    }));
  };

  const commentTree = organizeComments();
  const visibleComments = commentTree.slice(0, displayedComments);

  const handleShare = async (platform) => {
    const url = window.location.href;
    const text = `Lee "${story.title}" en StoryForge`;

    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        showSuccess('Enlace copiado');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      default:
        break;
    }
    setShowShareMenu(false);
  };

  const nextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setFlipDirection('next');
      setPageFlipping(true);
      setTimeout(() => {
        setCurrentChapterIndex(prev => prev + 1);
        setPageFlipping(false);
      }, 600);
    }
  };

  const prevChapter = () => {
    if (currentChapterIndex > 0) {
      setFlipDirection('prev');
      setPageFlipping(true);
      setTimeout(() => {
        setCurrentChapterIndex(prev => prev - 1);
        setPageFlipping(false);
      }, 600);
    }
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let listItems = [];

    lines.forEach((line, index) => {
      if (line.trim().startsWith('-')) {
        const content = line.trim().substring(1).trim();
        listItems.push(<li key={`list-${index}`} className="ml-6">{renderInlineFormatting(content)}</li>);
      } else {
        if (listItems.length > 0) {
          elements.push(<ul key={`ul-${index}`} className="list-disc mb-4">{listItems}</ul>);
          listItems = [];
        }
        if (line.trim()) {
          elements.push(<p key={`p-${index}`} className="mb-2">{renderInlineFormatting(line)}</p>);
        } else {
          elements.push(<div key={`space-${index}`} className="h-2" />);
        }
      }
    });
    if (listItems.length > 0) {
      elements.push(<ul key="ul-final" className="list-disc mb-4">{listItems}</ul>);
    }
    return elements;
  };

  const renderInlineFormatting = (text) => {
    const parts = [];
    let currentText = text;
    let key = 0;

    while (currentText.length > 0) {
      const boldMatch = currentText.match(/\*\*(.+?)\*\*/);
      if (boldMatch) {
        const beforeBold = currentText.substring(0, boldMatch.index);
        if (beforeBold) parts.push(<span key={key++}>{beforeBold}</span>);
        parts.push(<strong key={key++} className="font-bold">{boldMatch[1]}</strong>);
        currentText = currentText.substring(boldMatch.index + boldMatch[0].length);
        continue;
      }

      const italicMatch = currentText.match(/\*(.+?)\*/);
      if (italicMatch) {
        const beforeItalic = currentText.substring(0, italicMatch.index);
        if (beforeItalic) parts.push(<span key={key++}>{beforeItalic}</span>);
        parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
        currentText = currentText.substring(italicMatch.index + italicMatch[0].length);
        continue;
      }

      parts.push(<span key={key++}>{currentText}</span>);
      break;
    }
    return parts.length > 0 ? parts : text;
  };

  // Función para abrir el modal de comentarios
  const openCommentsModal = () => {
    console.log('Abriendo modal de comentarios');
    setShowComments(true);
  };

  // Función para cerrar el modal de comentarios
  const closeCommentsModal = () => {
    console.log('Cerrando modal de comentarios');
    setShowComments(false);
    setReplyTo(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Cuento no encontrado</p>
      </div>
    );
  }

  const currentChapter = chapters[currentChapterIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8 px-4">
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          Volver a Explorar
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 min-h-[600px]">
            {/* Left Page */}
            <div className="p-8 bg-gradient-to-br from-amber-50 to-white border-r-2 border-amber-200">
              <div className="h-full flex flex-col">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                  {story.title}
                </h1>

                {story.cover_image && (
                  <img
                    src={getMediaUrl(story.cover_image)}
                    alt={story.title}
                    className="w-full h-64 object-cover rounded-lg mb-4 shadow-md"
                  />
                )}

                <div className="text-gray-700 font-serif leading-relaxed mb-4">
                  {renderFormattedText(story.description)}
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Por: <span className="font-medium">{story.user?.username || 'Anónimo'}</span>
                </p>

                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {story.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                      >
                        {tag.tag_name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span>{chapters.length} capítulos</span>
                    <span>•</span>
                    <span>{story.views || 0} vistas</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleLike}
                      disabled={!isAuthenticated || story.user_id === user?.id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        hasLiked
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Heart size={18} fill={hasLiked ? 'currentColor' : 'none'} />
                      <span>{likesCount}</span>
                    </button>

                    <button
                      onClick={openCommentsModal}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <MessageCircle size={18} />
                      <span>{comments.length}</span>
                    </button>

                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors relative"
                    >
                      <Share2 size={18} />
                      <span>Compartir</span>

                      {showShareMenu && (
                        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10 min-w-[150px]">
                          <button
                            onClick={() => handleShare('copy')}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                          >
                            Copiar enlace
                          </button>
                          <button
                            onClick={() => handleShare('whatsapp')}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                          >
                            WhatsApp
                          </button>
                          <button
                            onClick={() => handleShare('facebook')}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                          >
                            Facebook
                          </button>
                          <button
                            onClick={() => handleShare('twitter')}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                          >
                            Twitter
                          </button>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Page */}
            <div className="p-8 bg-white relative">
              <div
                className={`h-full flex flex-col transition-all duration-600 ${
                  pageFlipping
                    ? flipDirection === 'next'
                      ? 'animate-flip-out-right'
                      : 'animate-flip-out-left'
                    : 'animate-flip-in'
                }`}
              >
                {currentChapter ? (
                  <>
                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                      Capítulo {currentChapter.chapter_number}
                    </h2>
                    <h3 className="text-xl font-serif text-gray-700 mb-6">
                      {currentChapter.title}
                    </h3>

                    {currentChapter.image && (
                      <img
                        src={getMediaUrl(currentChapter.image)}
                        alt={currentChapter.title}
                        className="w-full h-48 object-cover rounded-lg mb-6 shadow-md"
                      />
                    )}

                    <div className="flex-1 overflow-y-auto text-gray-800 font-serif leading-relaxed pr-4">
                      {renderFormattedText(currentChapter.content)}
                    </div>

                    <div className="mt-4 text-center text-sm text-gray-500">
                      Página {currentChapterIndex + 1} de {chapters.length}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 font-serif text-lg">
                      Este cuento aún no tiene capítulos
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          {chapters.length > 0 && (
            <div className="flex justify-between items-center p-4 bg-amber-50 border-t-2 border-amber-200">
              <button
                onClick={prevChapter}
                disabled={currentChapterIndex === 0}
                className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
                Anterior
              </button>
              <span className="text-gray-700 font-medium">
                Capítulo {currentChapterIndex + 1} de {chapters.length}
              </span>
              <button
                onClick={nextChapter}
                disabled={currentChapterIndex === chapters.length - 1}
                className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Siguiente
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Modal - MOVIDO FUERA DEL CONTENEDOR PRINCIPAL */}
      {showComments && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={closeCommentsModal}
        >
          <div
            className="bg-white w-full max-w-3xl max-h-[90vh] rounded-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">
                Comentarios ({comments.length})
              </h3>
              <button
                onClick={closeCommentsModal}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {visibleComments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay comentarios aún. ¡Sé el primero en comentar!
                </p>
              ) : (
                <div className="space-y-4">
                  {visibleComments.map((comment) => (
                    <div key={comment.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-gray-300 flex items-center justify-center">
                          {comment.user?.avatar ? (
                            <img
                              src={getMediaUrl(comment.user.avatar)}
                              alt={comment.user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-medium">
                              {comment.user?.username?.[0]?.toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900">
                              {comment.user?.username || 'Usuario'}
                            </p>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="text-gray-800 mb-2">{comment.comment}</p>
                          {!isOwnStory && (
                            <button
                              onClick={() => handleReply(comment.id, comment.user?.username)}
                              className="text-xs text-primary-600 hover:text-primary-800"
                            >
                              Responder
                            </button>
                          )}

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-8 mt-3 space-y-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-gray-300 flex items-center justify-center">
                                    {reply.user?.avatar ? (
                                      <img
                                        src={getMediaUrl(reply.user.avatar)}
                                        alt={reply.user.username}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-white text-sm font-medium">
                                        {reply.user?.username?.[0]?.toUpperCase() || 'U'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0 bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="text-sm font-semibold">
                                        {reply.user?.username || 'Usuario'}
                                      </p>
                                      <span className="text-xs text-gray-500">
                                        {new Date(reply.created_at).toLocaleDateString('es-ES', {
                                          day: 'numeric',
                                          month: 'short',
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-800">{reply.comment}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {visibleComments.length < commentTree.length && (
                <button
                  onClick={loadMoreComments}
                  className="w-full text-center text-primary-600 hover:text-primary-800 mt-4 py-2"
                >
                  Cargar más comentarios
                </button>
              )}
            </div>

            {/* Comment Input */}
            {isAuthenticated && !isOwnStory && (
              <div className="p-6 border-t bg-gray-50">
                {replyTo && (
                  <div className="mb-2 text-sm text-gray-600 flex items-center gap-2">
                    <span>Respondiendo a <strong>{replyTo.username}</strong></span>
                    <button
                      type="button"
                      onClick={cancelReply}
                      className="text-red-500 hover:text-red-700"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                <form onSubmit={handleComment} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    <Send size={18} />
                    Enviar
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes flip-out-right {
          0% {
            transform: rotateY(0deg);
            opacity: 1;
          }
          100% {
            transform: rotateY(-90deg);
            opacity: 0;
          }
        }
        @keyframes flip-out-left {
          0% {
            transform: rotateY(0deg);
            opacity: 1;
          }
          100% {
            transform: rotateY(90deg);
            opacity: 0;
          }
        }
        @keyframes flip-in {
          0% {
            transform: rotateY(90deg);
            opacity: 0;
          }
          100% {
            transform: rotateY(0deg);
            opacity: 1;
          }
        }
        .animate-flip-out-right {
          animation: flip-out-right 0.6s ease-in-out;
        }
        .animate-flip-out-left {
          animation: flip-out-left 0.6s ease-in-out;
        }
        .animate-flip-in {
          animation: flip-in 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default BookReader;