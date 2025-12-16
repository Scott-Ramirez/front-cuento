import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Eye, User } from 'lucide-react';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../utils/media';

const StoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, requireAuth } = useAuth();

  const [story, setStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewCounted, setViewCounted] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && story && !viewCounted) {
      api.post(`/stories/${id}/view`).finally(() => setViewCounted(true));
    }
    // eslint-disable-next-line
  }, [story, isAuthenticated]);

  const loadData = async () => {
    try {
      const [storyRes, commentsRes, likesRes] = await Promise.all([
        api.get(`/stories/${id}`),
        api.get(`/stories/${id}/comments`),
        api.get(`/stories/${id}/likes`),
      ]);

      setStory(storyRes.data);
      setComments(commentsRes.data);
      setLikes(likesRes.data);
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleComment = requireAuth(async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await api.post(`/stories/${id}/comments`, { comment: newComment });
    setNewComment('');
    loadData();
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!story) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* COVER */}
      <div className="h-64 md:h-96 rounded-lg overflow-hidden bg-gray-200 mb-8">
        {story.cover_image ? (
          <img
            src={getMediaUrl(story.cover_image)}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            📖
          </div>
        )}
      </div>

      {/* TITLE */}
      <h1 className="text-4xl font-bold mb-4">{story.title}</h1>

      {/* META */}
      <div className="flex gap-6 text-gray-600 mb-6">
        <span className="flex items-center gap-1">
          <User size={18} /> {story.user?.username}
        </span>
        <span className="flex items-center gap-1">
          <Eye size={18} /> {story.views_count}
        </span>
        <span className="flex items-center gap-1">
          <Heart size={18} /> {likes.length}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle size={18} /> {comments.length}
        </span>
      </div>

      {/* DESCRIPTION */}
      <p className="text-lg text-gray-700 mb-10 whitespace-pre-wrap">
        {story.description}
      </p>

      {/* CHAPTERS */}
      {story.chapters?.length > 0 && (
        <div className="space-y-6 mb-12">
          {story.chapters
            .sort((a, b) => a.chapter_number - b.chapter_number)
            .map((ch) => (
              <div key={ch.id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">
                  Capítulo {ch.chapter_number}: {ch.title}
                </h3>

                {ch.image && (
                  <img
                    src={getMediaUrl(ch.image)}
                    alt={ch.title}
                    className="w-full h-64 object-cover rounded mb-4"
                  />
                )}

                <p className="text-gray-700 whitespace-pre-wrap">
                  {ch.content}
                </p>
              </div>
            ))}
        </div>
      )}

      {/* COMMENTS */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">
          Comentarios ({comments.length})
        </h2>

        {isAuthenticated ? (
          <form onSubmit={handleComment} className="mb-6">
            <textarea
              className="w-full border rounded p-3"
              rows="3"
              placeholder="Escribe un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button className="mt-2 bg-primary-600 text-white px-4 py-2 rounded">
              Comentar
            </button>
          </form>
        ) : (
          <p className="text-primary-600 font-medium">
            Inicia sesión para comentar
          </p>
        )}

        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <img
                src={getMediaUrl(c.user?.avatar)}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{c.user?.username}</p>
                <p className="text-gray-700">{c.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryDetail;
