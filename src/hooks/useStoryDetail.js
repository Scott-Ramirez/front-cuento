import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

export default function useStoryDetail(id, requireAuth, navigate) {
  const [story, setStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewCounted, setViewCounted] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
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
      navigate && navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (story && !viewCounted) {
      api.post(`/stories/${id}/view`).finally(() => setViewCounted(true));
    }
    // eslint-disable-next-line
  }, [story]);

  // Comentarios
  const addComment = requireAuth(async (comment, cb) => {
    if (!comment.trim()) return;
    await api.post(`/stories/${id}/comments`, { comment });
    cb && cb();
    loadData();
  });

  // Likes (placeholder para futura lógica)
  // const likeStory = ...

  return {
    story,
    setStory,
    comments,
    setComments,
    likes,
    setLikes,
    loading,
    loadData,
    addComment,
  };
}
