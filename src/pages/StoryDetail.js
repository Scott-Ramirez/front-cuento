import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useStoryDetail from '../hooks/useStoryDetail';
import { useAuth } from '../context/AuthContext';

import ShareButton from '../components/story/ShareButton';
import CommentsSection from '../components/story/CommentsSection';
import ChapterList from '../components/story/ChapterList';
import StoryDescription from '../components/story/StoryDescription';
import AddChapterForm from '../components/story/AddChapterForm';
import StoryCover from '../components/story/StoryCover';
import StoryTitle from '../components/story/StoryTitle';
import StoryMeta from '../components/story/StoryMeta';

const StoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requireAuth } = useAuth();

  // Hook personalizado
  const {
    story,
    setStory,
    comments,
    likes,
    loading,
    loadData,
    addComment,
  } = useStoryDetail(id, requireAuth, navigate);

  /* ================= ESTADOS ================= */
  const [savingTitle, setSavingTitle] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [editingChapter, setEditingChapter] = useState(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [savingChapter, setSavingChapter] = useState(false);

  const [editingChapterContent, setEditingChapterContent] = useState(null);
  const [newChapterContent, setNewChapterContent] = useState('');
  const [savingChapterContent, setSavingChapterContent] = useState(false);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingChapterImage, setUploadingChapterImage] = useState({});

  const [addingChapter, setAddingChapter] = useState(false);
  const [showAddChapter, setShowAddChapter] = useState(false);

  // Respuestas a comentarios
  const [replyingId, setReplyingId] = useState(null);
  const [replyingLoading, setReplyingLoading] = useState(false);
  const [repliesByComment, setRepliesByComment] = useState({});

  /* ================= EFFECTS ================= */
  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [id]);

  // Agrupar replies por comment_id
  useEffect(() => {
    if (!comments) return;
    const replies = {};
    comments.forEach((c) => {
      if (c.parent_comment_id) {
        if (!replies[c.parent_comment_id]) replies[c.parent_comment_id] = [];
        replies[c.parent_comment_id].push(c);
      }
    });
    setRepliesByComment(replies);
  }, [comments]);

  /* ================= TITLE ================= */
  const handleSaveTitle = async (newTitleValue) => {
    if (!newTitleValue.trim() || newTitleValue === story.title) return;
    setSavingTitle(true);
    try {
      await api.put(`/stories/${id}`, { title: newTitleValue });
      setStory({ ...story, title: newTitleValue });
    } catch {}
    finally {
      setSavingTitle(false);
    }
  };

  /* ================= DESCRIPTION ================= */
  const handleSaveDescription = async (newDescriptionValue) => {
    if (!newDescriptionValue.trim() || newDescriptionValue === story.description) return;
    try {
      await api.put(`/stories/${id}`, { description: newDescriptionValue });
      setStory({ ...story, description: newDescriptionValue });
    } catch {}
  };

  /* ================= COMMENTS ================= */
  const handleComment = async (e) => {
    e.preventDefault();
    await addComment(newComment, () => setNewComment(''));
  };

  const handleReply = async (parentId, replyText) => {
    setReplyingLoading(true);
    try {
      await api.post(`/stories/${id}/comments`, {
        comment: replyText,
        parent_comment_id: parentId,
      });
      loadData();
      setReplyingId(null);
    } catch {}
    setReplyingLoading(false);
  };

  /* ================= CHAPTERS ================= */
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

  const handleAddChapter = async ({ title, content }) => {
    setAddingChapter(true);
    try {
      await api.post(`/stories/${id}/chapters`, { title, content });
      loadData();
      setShowAddChapter(false);
    } catch {}
    finally {
      setAddingChapter(false);
    }
  };

  const handleChapterImageChange = async (ch, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingChapterImage((prev) => ({ ...prev, [ch.id]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/upload/chapter-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await api.put(`/stories/${id}/chapters/${ch.id}`, {
        image: uploadRes.data.path,
      });
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
      const uploadRes = await api.post('/upload/cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await api.put(`/stories/${id}`, { cover_image: uploadRes.data.path });
      loadData();
    } catch {}
    setUploadingCover(false);
  };

  /* ================= RENDER ================= */
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
      <StoryCover
        coverImage={story.cover_image}
        title={story.title}
        uploading={uploadingCover}
        onChange={handleCoverImageChange}
      />

      <StoryTitle
        title={story.title}
        onSave={handleSaveTitle}
        saving={savingTitle}
      />

      <StoryMeta
        username={story.user?.username}
        views={story.views_count}
        likes={likes.length}
        comments={comments.length}
      />

      <StoryDescription
        description={story.description}
        onSave={handleSaveDescription}
      />

      {story.chapters?.length > 0 && (
        <ChapterList
          chapters={story.chapters}
          onEditTitle={handleSaveChapterTitle}
          onEditContent={handleSaveChapterContent}
          onEditImage={handleChapterImageChange}
          editingChapter={editingChapter}
          editingChapterContent={editingChapterContent}
          newChapterTitle={newChapterTitle}
          newChapterContent={newChapterContent}
          savingChapter={savingChapter}
          savingChapterContent={savingChapterContent}
          uploadingChapterImage={uploadingChapterImage}
          setEditingChapter={setEditingChapter}
          setNewChapterTitle={setNewChapterTitle}
          setEditingChapterContent={setEditingChapterContent}
          setNewChapterContent={setNewChapterContent}
        />
      )}

      <div className="mb-6">
        {!showAddChapter ? (
          <button
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            onClick={() => setShowAddChapter(true)}
          >
            Agregar capítulo
          </button>
        ) : (
          <AddChapterForm onAdd={handleAddChapter} loading={addingChapter} />
        )}
      </div>

      <CommentsSection
        comments={comments.filter((c) => !c.parent_comment_id)}
        newComment={newComment}
        setNewComment={setNewComment}
        onAddComment={handleComment}
        loading={loading || replyingLoading}
        onReply={handleReply}
        replyingId={replyingId}
        setReplyingId={setReplyingId}
        repliesByComment={repliesByComment}
      />

      <div className="flex justify-end mt-8">
        <ShareButton url={window.location.href} />
      </div>
    </div>
  );
};

export default StoryDetail;
