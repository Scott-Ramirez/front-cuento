import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Eye, User, Pencil, Check, X, Camera, Share2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../utils/media';

const StoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, requireAuth } = useAuth();

  // Estados
  const [story, setStory] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [newComment, setNewComment] = useState('');

  const [loading, setLoading] = useState(true);
  const [viewCounted, setViewCounted] = useState(false);

  const [editingChapter, setEditingChapter] = useState(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [savingChapter, setSavingChapter] = useState(false);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingChapterImage, setUploadingChapterImage] = useState({});

  const [editingChapterContent, setEditingChapterContent] = useState(null);
  const [newChapterContent, setNewChapterContent] = useState('');
  const [savingChapterContent, setSavingChapterContent] = useState(false);

  // Carga inicial de datos
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
      setNewTitle(storyRes.data.title);
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // TITULO
  const handleEditTitle = () => {
    setEditingTitle(true);
    setNewTitle(story.title);
  };

  const handleCancelEditTitle = () => {
    setEditingTitle(false);
    setNewTitle(story.title);
  };

  const handleSaveTitle = async () => {
    if (!newTitle.trim() || newTitle === story.title) {
      setEditingTitle(false);
      return;
    }
    setSavingTitle(true);
    try {
      await api.put(`/stories/${id}`, { title: newTitle });
      setStory({ ...story, title: newTitle });
      setEditingTitle(false);
    } catch (err) {
      // Manejo de error opcional
    } finally {
      setSavingTitle(false);
    }
  };

  // COMENTARIOS
  const handleComment = requireAuth(async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await api.post(`/stories/${id}/comments`, { comment: newComment });
    setNewComment('');
    loadData();
  });

  // CAPÍTULOS
  const handleEditChapterTitle = (ch) => {
    setEditingChapter(ch.id);
    setNewChapterTitle(ch.title);
  };

  const handleCancelEditChapter = () => {
    setEditingChapter(null);
    setNewChapterTitle('');
  };

  const handleSaveChapterTitle = async (ch) => {
    if (!newChapterTitle.trim() || newChapterTitle === ch.title) {
      setEditingChapter(null);
      return;
    }
    setSavingChapter(true);
    try {
      await api.put(`/stories/${id}/chapters/${ch.id}`, { title: newChapterTitle });
      loadData();
      setEditingChapter(null);
    } catch {}
    setSavingChapter(false);
  };

  const handleEditChapterContent = (ch) => {
    setEditingChapterContent(ch.id);
    setNewChapterContent(ch.content);
  };

  const handleCancelEditChapterContent = () => {
    setEditingChapterContent(null);
    setNewChapterContent('');
  };

  const handleSaveChapterContent = async (ch) => {
    if (!newChapterContent.trim() || newChapterContent === ch.content) {
      setEditingChapterContent(null);
      return;
    }
    setSavingChapterContent(true);
    try {
      await api.put(`/stories/${id}/chapters/${ch.id}`, { content: newChapterContent });
      loadData();
      setEditingChapterContent(null);
    } catch {}
    setSavingChapterContent(false);
  };

  const handleChapterImageChange = async (ch, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingChapterImage((prev) => ({ ...prev, [ch.id]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/upload/chapter-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const imagePath = uploadRes.data.path;
      await api.put(`/stories/${id}/chapters/${ch.id}`, { image: imagePath });
      loadData();
    } catch {}
    setUploadingChapterImage((prev) => ({ ...prev, [ch.id]: false }));
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/upload/cover', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const coverPath = uploadRes.data.path;
      await api.put(`/stories/${id}`, { cover_image: coverPath });
      loadData();
    } catch {}
    setUploadingCover(false);
  };

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
        <div className="relative h-full w-full">
          {story.cover_image ? (
            <img
              src={getMediaUrl(story.cover_image)}
              alt={story.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">📖</div>
          )}
          <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow cursor-pointer hover:bg-gray-100" title="Cambiar portada">
            <Camera size={22} className={uploadingCover ? 'animate-spin' : ''} />
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageChange} disabled={uploadingCover} />
          </label>
        </div>
      </div>

      {/* TITLE */}
      <div className="flex items-center gap-2 mb-4">
        {editingTitle ? (
          <>
            <input
              className="text-4xl font-bold border-b-2 border-primary-600 focus:outline-none px-2 py-1 mr-2 bg-white"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              disabled={savingTitle}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') handleCancelEditTitle();
              }}
              maxLength={100}
              style={{ minWidth: '200px' }}
            />
            <button onClick={handleSaveTitle} disabled={savingTitle} className="ml-1 text-green-600 hover:text-green-800">
              <Check size={22} />
            </button>
            <button onClick={handleCancelEditTitle} disabled={savingTitle} className="ml-1 text-red-600 hover:text-red-800">
              <X size={22} />
            </button>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold">{story.title}</h1>
            <button onClick={handleEditTitle} className="ml-2 text-gray-500 hover:text-primary-600" title="Editar título">
              <Pencil size={22} />
            </button>
          </>
        )}
      </div>

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
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl font-semibold">Capítulo {ch.chapter_number}:</span>
                  {editingChapter === ch.id ? (
                    <>
                      <input
                        className="text-xl font-semibold border-b-2 border-primary-600 focus:outline-none px-2 py-1 mr-2 bg-white"
                        value={newChapterTitle}
                        onChange={e => setNewChapterTitle(e.target.value)}
                        disabled={savingChapter}
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveChapterTitle(ch);
                          if (e.key === 'Escape') handleCancelEditChapter();
                        }}
                        maxLength={100}
                        style={{ minWidth: '120px' }}
                      />
                      <button onClick={() => handleSaveChapterTitle(ch)} disabled={savingChapter} className="ml-1 text-green-600 hover:text-green-800">
                        <Check size={20} />
                      </button>
                      <button onClick={handleCancelEditChapter} disabled={savingChapter} className="ml-1 text-red-600 hover:text-red-800">
                        <X size={20} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{ch.title}</span>
                      <button onClick={() => handleEditChapterTitle(ch)} className="ml-2 text-gray-500 hover:text-primary-600" title="Editar título de capítulo">
                        <Pencil size={20} />
                      </button>
                    </>
                  )}
                </div>
                <div className="relative w-full h-64 mb-4">
                  {ch.image ? (
                    <img
                      src={getMediaUrl(ch.image)}
                      alt={ch.title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-100 rounded">🖼️</div>
                  )}
                  <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow cursor-pointer hover:bg-gray-100" title="Cambiar imagen de capítulo">
                    <Camera size={20} className={uploadingChapterImage[ch.id] ? 'animate-spin' : ''} />
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleChapterImageChange(ch, e)} disabled={uploadingChapterImage[ch.id]} />
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  {editingChapterContent === ch.id ? (
                    <>
                      <textarea
                        className="flex-1 border-b-2 border-primary-600 focus:outline-none px-2 py-1 bg-white text-gray-700"
                        value={newChapterContent}
                        onChange={e => setNewChapterContent(e.target.value)}
                        rows={4}
                        disabled={savingChapterContent}
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Escape') handleCancelEditChapterContent();
                        }}
                        maxLength={5000}
                        style={{ minWidth: '120px' }}
                      />
                      <button onClick={() => handleSaveChapterContent(ch)} disabled={savingChapterContent} className="ml-1 text-green-600 hover:text-green-800">
                        <Check size={20} />
                      </button>
                      <button onClick={handleCancelEditChapterContent} disabled={savingChapterContent} className="ml-1 text-red-600 hover:text-red-800">
                        <X size={20} />
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-700 whitespace-pre-wrap flex-1">{ch.content}</p>
                      <button onClick={() => handleEditChapterContent(ch)} className="ml-2 text-gray-500 hover:text-primary-600" title="Editar contenido de capítulo">
                        <Pencil size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* BOTÓN DE COMPARTIR */}
      <div className="flex justify-end mt-8">
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Share2 size={20} />
          Compartir
        </button>
      </div>
    </div>
  );
};

export default StoryDetail;
