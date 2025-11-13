import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Eye, User, Send, Edit2, Check, X, Bold, Italic, List, AlignLeft, Upload } from 'lucide-react';
import api, { API_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StoryDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated, requireAuth } = useAuth();
  const navigate = useNavigate();
  
  const [story, setStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Estados para edición
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [editingImage, setEditingImage] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [tempTags, setTempTags] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Estados para edición de capítulos
  const [editingChapter, setEditingChapter] = useState(null); // ID del capítulo siendo editado
  const [tempChapterTitle, setTempChapterTitle] = useState('');
  const [tempChapterContent, setTempChapterContent] = useState('');
  const [tempChapterImage, setTempChapterImage] = useState(null);
  const [uploadingChapterImage, setUploadingChapterImage] = useState(false);

  useEffect(() => {
    fetchStoryDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // Count view only if authenticated and not already counted
    if (isAuthenticated && story && !viewCounted) {
      incrementView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, story]);

  const incrementView = async () => {
    try {
      await api.post(`/stories/${id}/view`);
      setViewCounted(true);
    } catch (error) {
      console.error('Error incrementing view:', error);
    }
  };

  // Función para obtener URL completa del avatar
  const getAvatarUrl = (avatar) => {
    if (!avatar) return '';
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar;
    }
    if (avatar.startsWith('/')) {
      return `${API_URL}${avatar}`;
    }
    return `${API_URL}/${avatar}`;
  };

  // Función para renderizar texto con formato
  const renderFormattedText = (text) => {
    if (!text) return null;

    // Dividir en líneas para procesar
    const lines = text.split('\n');
    const elements = [];
    let listItems = [];

    lines.forEach((line, index) => {
      // Detectar listas
      if (line.trim().startsWith('-')) {
        const content = line.trim().substring(1).trim();
        listItems.push(
          <li key={`list-${index}`} className="ml-6">
            {renderInlineFormatting(content)}
          </li>
        );
      } else {
        // Si había items de lista previos, cerrar la lista
        if (listItems.length > 0) {
          elements.push(
            <ul key={`ul-${index}`} className="list-disc mb-4">
              {listItems}
            </ul>
          );
          listItems = [];
        }

        // Renderizar línea normal si no está vacía
        if (line.trim()) {
          elements.push(
            <p key={`p-${index}`} className="mb-2">
              {renderInlineFormatting(line)}
            </p>
          );
        } else {
          // Línea vacía = salto de párrafo
          elements.push(<div key={`space-${index}`} className="h-2" />);
        }
      }
    });

    // Cerrar lista si terminó con items
    if (listItems.length > 0) {
      elements.push(
        <ul key="ul-final" className="list-disc mb-4">
          {listItems}
        </ul>
      );
    }

    return elements;
  };

  // Función para renderizar formato inline (negrita, cursiva)
  const renderInlineFormatting = (text) => {
    const parts = [];
    let currentText = text;
    let key = 0;

    while (currentText.length > 0) {
      // Buscar negrita **text**
      const boldMatch = currentText.match(/\*\*(.+?)\*\*/);
      if (boldMatch) {
        const beforeBold = currentText.substring(0, boldMatch.index);
        if (beforeBold) parts.push(<span key={key++}>{beforeBold}</span>);
        parts.push(<strong key={key++} className="font-bold">{boldMatch[1]}</strong>);
        currentText = currentText.substring(boldMatch.index + boldMatch[0].length);
        continue;
      }

      // Buscar cursiva *text*
      const italicMatch = currentText.match(/\*(.+?)\*/);
      if (italicMatch) {
        const beforeItalic = currentText.substring(0, italicMatch.index);
        if (beforeItalic) parts.push(<span key={key++}>{beforeItalic}</span>);
        parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
        currentText = currentText.substring(italicMatch.index + italicMatch[0].length);
        continue;
      }

      // No hay más formato, agregar el resto
      parts.push(<span key={key++}>{currentText}</span>);
      break;
    }

    return parts.length > 0 ? parts : text;
  };

  const fetchStoryDetails = async () => {
    try {
      const [storyRes, commentsRes, likesRes] = await Promise.all([
        api.get(`/stories/${id}`),
        api.get(`/stories/${id}/comments`),
        api.get(`/stories/${id}/likes`)
      ]);
      
      setStory(storyRes.data);
      setComments(commentsRes.data);
      setLikes(likesRes.data);
      
      if (user) {
        setHasLiked(likesRes.data.some(like => like.user_id === user.id));
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      if (error.response?.status === 401) {
        alert('Necesitas iniciar sesión para ver este cuento');
        navigate('/login');
      } else if (error.response?.status === 404) {
        alert('Cuento no encontrado');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = requireAuth(async () => {
    // Prevent liking own story
    if (user && story.user_id === user.id) {
      return;
    }
    
    try {
      await api.post(`/stories/${id}/likes`);
      fetchStoryDetails();
    } catch (error) {
      console.error('Error liking story:', error);
    }
  });

  const handleComment = requireAuth(async (e) => {
    e.preventDefault();
    
    // Prevent commenting on own story
    if (user && story.user_id === user.id) {
      return;
    }
    
    if (!newComment.trim()) return;

    try {
      await api.post(`/stories/${id}/comments`, { comment: newComment });
      setNewComment('');
      fetchStoryDetails();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  });

  const handleReply = async (e, parentCommentId) => {
    e.preventDefault();
    
    if (!replyText.trim()) return;

    try {
      await api.post(`/stories/${id}/comments`, { 
        comment: replyText,
        parent_comment_id: parentCommentId
      });
      setReplyText('');
      setReplyingTo(null);
      fetchStoryDetails();
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  // Funciones de edición
  const handleEditTitle = () => {
    setTempTitle(story.title);
    setEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!tempTitle.trim()) {
      alert('El título no puede estar vacío');
      return;
    }
    try {
      await api.put(`/stories/${id}`, { title: tempTitle });
      setEditingTitle(false);
      fetchStoryDetails();
    } catch (error) {
      console.error('Error updating title:', error);
      alert('Error al actualizar el título');
    }
  };

  const handleCancelTitle = () => {
    setEditingTitle(false);
    setTempTitle('');
  };

  const handleEditDescription = () => {
    setTempDescription(story.description);
    setEditingDescription(true);
  };

  const handleSaveDescription = async () => {
    if (!tempDescription.trim()) {
      alert('La descripción no puede estar vacía');
      return;
    }
    try {
      await api.put(`/stories/${id}`, { description: tempDescription });
      setEditingDescription(false);
      fetchStoryDetails();
    } catch (error) {
      console.error('Error updating description:', error);
      alert('Error al actualizar la descripción');
    }
  };

  const handleCancelDescription = () => {
    setEditingDescription(false);
    setTempDescription('');
  };

  const insertDescriptionFormatting = (format) => {
    const textarea = document.getElementById('description-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = tempDescription;
    const selectedText = text.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText}`;
        break;
      case 'paragraph':
        formattedText = `\n\n${selectedText}`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newContent = text.substring(0, start) + formattedText + text.substring(end);
    setTempDescription(newContent);
    
    // Restaurar el foco
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const handleEditTags = () => {
    const currentTags = story.tags?.map(tag => tag.tag_name).join(', ') || '';
    setTempTags(currentTags);
    setEditingTags(true);
  };

  const handleSaveTags = async () => {
    try {
      const tagsArray = tempTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await api.put(`/stories/${id}`, { tags: tagsArray });
      setEditingTags(false);
      fetchStoryDetails();
    } catch (error) {
      console.error('Error updating tags:', error);
      alert('Error al actualizar los tags');
    }
  };

  const handleCancelTags = () => {
    setEditingTags(false);
    setTempTags('');
  };

  const handleEditImage = () => {
    setEditingImage(true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleSaveImage = async () => {
    if (!selectedImage) {
      alert('Por favor selecciona una imagen');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      // Primero subir la imagen
      const uploadRes = await api.post('/upload/cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Luego actualizar el cuento con la nueva imagen
      await api.put(`/stories/${id}`, { cover_image: uploadRes.data.path });
      
      setEditingImage(false);
      setSelectedImage(null);
      fetchStoryDetails();
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Error al actualizar la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCancelImage = () => {
    setEditingImage(false);
    setSelectedImage(null);
  };

  // Funciones para editar capítulos
  const handleEditChapter = (chapter) => {
    setEditingChapter(chapter.id);
    setTempChapterTitle(chapter.title);
    setTempChapterContent(chapter.content);
  };

  const handleSaveChapter = async (chapterId) => {
    try {
      await api.put(`/stories/${id}/chapters/${chapterId}`, {
        title: tempChapterTitle,
        content: tempChapterContent,
      });
      setEditingChapter(null);
      fetchStoryDetails();
    } catch (error) {
      console.error('Error updating chapter:', error);
      alert('Error al actualizar el capítulo');
    }
  };

  const handleCancelChapterEdit = () => {
    setEditingChapter(null);
    setTempChapterTitle('');
    setTempChapterContent('');
  };

  const insertChapterFormatting = (format) => {
    const textarea = document.getElementById('chapter-content-edit');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = tempChapterContent;
    const selectedText = text.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText}`;
        break;
      case 'paragraph':
        formattedText = `\n\n${selectedText}`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newContent = text.substring(0, start) + formattedText + text.substring(end);
    setTempChapterContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const handleChapterImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }
      setTempChapterImage(file);
    }
  };

  const handleSaveChapterImage = async (chapterId) => {
    if (!tempChapterImage) {
      alert('Por favor selecciona una imagen');
      return;
    }

    setUploadingChapterImage(true);
    try {
      const formData = new FormData();
      formData.append('file', tempChapterImage);

      const uploadRes = await api.post('/upload/chapter-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await api.put(`/stories/${id}/chapters/${chapterId}`, {
        image: uploadRes.data.path,
      });
      
      setTempChapterImage(null);
      fetchStoryDetails();
    } catch (error) {
      console.error('Error updating chapter image:', error);
      alert('Error al actualizar la imagen del capítulo');
    } finally {
      setUploadingChapterImage(false);
    }
  };

  const handleRemoveChapterImage = async (chapterId) => {
    if (!window.confirm('¿Estás seguro de eliminar la imagen del capítulo?')) {
      return;
    }

    try {
      await api.put(`/stories/${id}/chapters/${chapterId}`, {
        image: null,
      });
      fetchStoryDetails();
    } catch (error) {
      console.error('Error removing chapter image:', error);
      alert('Error al eliminar la imagen del capítulo');
    }
  };

  const promptLogin = () => {
    localStorage.setItem('returnUrl', window.location.pathname);
    navigate('/login');
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Cover Image with Edit */}
      <div className="relative mb-8">
        {editingImage ? (
          <div className="h-64 md:h-96 bg-gray-100 rounded-lg border-2 border-dashed border-primary-500 flex flex-col items-center justify-center p-8">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              {selectedImage ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <Check size={32} className="text-green-600" />
                  </div>
                  <p className="text-gray-700 font-medium">{selectedImage.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                    <Edit2 size={32} className="text-primary-600" />
                  </div>
                  <p className="text-gray-700 font-medium">Seleccionar nueva imagen</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Haz clic para elegir un archivo (máx. 5MB)
                  </p>
                </div>
              )}
            </label>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveImage}
                disabled={!selectedImage || uploadingImage}
                className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Guardar
                  </>
                )}
              </button>
              <button
                onClick={handleCancelImage}
                disabled={uploadingImage}
                className="flex items-center gap-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <X size={16} />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="relative h-64 md:h-96 bg-gradient-to-r from-primary-400 to-primary-600 rounded-lg overflow-hidden group">
            {story.cover_image ? (
              <img
                src={`http://localhost:3000${story.cover_image}`}
                alt={story.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                    cd c:\Users\antho\OneDrive\Documentos\APPS\FRONTEND\app_front_new_server
                npm install sweetalert2            <span className="text-white text-9xl">📖</span>
              </div>
            )}
            {/* Edit button overlay */}
            {isAuthenticated && user?.id === story.user_id && (
              <button
                onClick={handleEditImage}
                className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-black bg-opacity-60 text-white rounded-lg hover:bg-opacity-80 transition-all opacity-0 group-hover:opacity-100"
              >
                <Edit2 size={18} />
                Cambiar imagen
              </button>
            )}
          </div>
        )}
      </div>

      {/* Title and Info */}
      <div className="mb-8">
        {/* Title with Edit Button */}
        <div className="flex items-start gap-3 mb-4">
          {editingTitle ? (
            <div className="flex-1">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="w-full text-4xl font-bold text-gray-900 border-2 border-primary-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveTitle}
                  className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  <Check size={16} />
                  Guardar
                </button>
                <button
                  onClick={handleCancelTitle}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="flex-1 text-4xl font-bold text-gray-900">{story.title}</h1>
              {isAuthenticated && user?.id === story.user_id && (
                <button
                  onClick={handleEditTitle}
                  className="flex items-center gap-1 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                  title="Editar título"
                >
                  <Edit2 size={18} />
                </button>
              )}
            </>
          )}
        </div>
        
        <div className="flex items-center gap-6 text-gray-600 mb-4">
          <span className="flex items-center gap-2">
            <User size={20} />
            {story.user?.username || 'Anónimo'}
          </span>
          <span className="flex items-center gap-2">
            <Eye size={20} />
            {story.views_count || 0} vistas
          </span>
          <span className="flex items-center gap-2">
            <Heart size={20} />
            {likes.length} likes
          </span>
          <span className="flex items-center gap-2">
            <MessageCircle size={20} />
            {comments.length} comentarios
          </span>
        </div>

        {/* Tags with Edit Button */}
        <div className="mb-4">
          {editingTags ? (
            <div>
              <input
                type="text"
                value={tempTags}
                onChange={(e) => setTempTags(e.target.value)}
                placeholder="Ingresa tags separados por comas (ej: fantasía, aventura, dragones)"
                className="w-full border-2 border-primary-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveTags}
                  className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  <Check size={16} />
                  Guardar
                </button>
                <button
                  onClick={handleCancelTags}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-2 flex-1">
                {story.tags && story.tags.length > 0 ? (
                  story.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {tag.tag_name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">Sin tags</span>
                )}
              </div>
              {isAuthenticated && user?.id === story.user_id && (
                <button
                  onClick={handleEditTags}
                  className="flex items-center gap-1 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                  title="Editar tags"
                >
                  <Edit2 size={18} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Description with Edit Button */}
        <div>
          {editingDescription ? (
            <div>
              {/* Text Formatting Toolbar */}
              <div className="flex gap-2 mb-2 p-2 bg-gray-50 rounded-lg border border-gray-300">
                <button
                  type="button"
                  onClick={() => insertDescriptionFormatting('bold')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Negrita (**texto**)"
                >
                  <Bold size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => insertDescriptionFormatting('italic')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Cursiva (*texto*)"
                >
                  <Italic size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => insertDescriptionFormatting('list')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Lista (- item)"
                >
                  <List size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => insertDescriptionFormatting('paragraph')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Nuevo párrafo"
                >
                  <AlignLeft size={18} />
                </button>
              </div>
              <textarea
                id="description-textarea"
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                className="w-full border-2 border-primary-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg resize-none font-mono"
                rows="6"
                autoFocus
                style={{ whiteSpace: 'pre-wrap' }}
              />
              <p className="mt-1 text-sm text-gray-500">
                Usa **texto** para negrita, *texto* para cursiva, - para listas
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveDescription}
                  className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  <Check size={16} />
                  Guardar
                </button>
                <button
                  onClick={handleCancelDescription}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="flex-1 text-gray-700 text-lg leading-relaxed">
                {renderFormattedText(story.description)}
              </div>
              {isAuthenticated && user?.id === story.user_id && (
                <button
                  onClick={handleEditDescription}
                  className="flex items-center gap-1 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                  title="Editar descripción"
                >
                  <Edit2 size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Like Button */}
      <div className="mb-8">
        {isAuthenticated && user && story.user_id === user.id ? null : (
          <button
            onClick={isAuthenticated ? handleLike : promptLogin}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              hasLiked
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart size={20} fill={hasLiked ? 'currentColor' : 'none'} />
            {hasLiked ? 'Te gusta' : 'Me gusta'}
            {!isAuthenticated && ' (Inicia sesión)'}
          </button>
        )}
      </div>

      {/* Chapters */}
      {story.chapters && story.chapters.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Capítulos</h2>
          <div className="space-y-6">
            {story.chapters.sort((a, b) => a.chapter_number - b.chapter_number).map((chapter) => (
              <div key={chapter.id} className="bg-white p-6 rounded-lg shadow">
                {/* Chapter Title */}
                {editingChapter === chapter.id ? (
                  <div className="mb-4">
                    <input
                      type="text"
                      value={tempChapterTitle}
                      onChange={(e) => setTempChapterTitle(e.target.value)}
                      className="w-full border-2 border-primary-500 rounded-lg px-3 py-2 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex items-start gap-3 mb-4">
                    <h3 className="flex-1 text-xl font-semibold text-gray-900">
                      Capítulo {chapter.chapter_number}: {chapter.title}
                    </h3>
                    {isAuthenticated && user?.id === story.user_id && (
                      <button
                        onClick={() => handleEditChapter(chapter)}
                        className="flex items-center gap-1 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                        title="Editar capítulo"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                  </div>
                )}

                {/* Chapter Image */}
                <div className="mb-4">
                  {chapter.image && (
                    <div className="relative">
                      <img
                        src={`http://localhost:3000${chapter.image}`}
                        alt={chapter.title}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      {isAuthenticated && user?.id === story.user_id && (
                        <button
                          onClick={() => handleRemoveChapterImage(chapter.id)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Eliminar imagen"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  )}
                  {isAuthenticated && user?.id === story.user_id && !chapter.image && (
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleChapterImageSelect}
                        className="hidden"
                        id={`chapter-image-${chapter.id}`}
                      />
                      <label
                        htmlFor={`chapter-image-${chapter.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <Upload size={18} />
                        Agregar imagen
                      </label>
                      {tempChapterImage && (
                        <button
                          onClick={() => handleSaveChapterImage(chapter.id)}
                          disabled={uploadingChapterImage}
                          className="ml-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          {uploadingChapterImage ? 'Subiendo...' : 'Guardar imagen'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Chapter Content */}
                {editingChapter === chapter.id ? (
                  <div>
                    {/* Text Formatting Toolbar */}
                    <div className="flex gap-2 mb-2 p-2 bg-gray-50 rounded-lg border border-gray-300">
                      <button
                        type="button"
                        onClick={() => insertChapterFormatting('bold')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Negrita (**texto**)"
                      >
                        <Bold size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertChapterFormatting('italic')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Cursiva (*texto*)"
                      >
                        <Italic size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertChapterFormatting('list')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Lista (- item)"
                      >
                        <List size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertChapterFormatting('paragraph')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Nuevo párrafo"
                      >
                        <AlignLeft size={18} />
                      </button>
                    </div>
                    <textarea
                      id="chapter-content-edit"
                      value={tempChapterContent}
                      onChange={(e) => setTempChapterContent(e.target.value)}
                      className="w-full border-2 border-primary-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono"
                      rows="10"
                      style={{ whiteSpace: 'pre-wrap' }}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Usa **texto** para negrita, *texto* para cursiva, - para listas
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleSaveChapter(chapter.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        <Check size={16} />
                        Guardar
                      </button>
                      <button
                        onClick={handleCancelChapterEdit}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        <X size={16} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-700 leading-relaxed">
                    {renderFormattedText(chapter.content)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Comentarios ({comments.length})
        </h2>

        {/* Comment Form */}
        {isAuthenticated ? (
          user && story.user_id === user.id ? null : (
            <form onSubmit={handleComment} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows="3"
              />
              <button
                type="submit"
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Send size={18} />
                Comentar
              </button>
            </form>
          )
        ) : (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600 mb-2">Debes iniciar sesión para comentar</p>
            <button
              onClick={promptLogin}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Iniciar Sesión
            </button>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments
            .filter(comment => !comment.parent_comment_id) // Solo mostrar comentarios principales
            .map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 pb-4">
              {/* Main Comment */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                    {comment.user?.avatar ? (
                      <img
                        src={getAvatarUrl(comment.user.avatar)}
                        alt={comment.user.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full bg-primary-100 rounded-full flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-600"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-primary-600" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">{comment.user?.username}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{comment.comment}</p>
                  
                  {/* Reply Button - Solo mostrar si es el autor del cuento */}
                  {isAuthenticated && user?.id === story.user_id && (
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {replyingTo === comment.id ? 'Cancelar' : 'Responder'}
                    </button>
                  )}
                  
                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <form onSubmit={(e) => handleReply(e, comment.id)} className="mt-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escribe tu respuesta..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                        rows="2"
                      />
                      <button
                        type="submit"
                        className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                      >
                        <Send size={16} />
                        Responder
                      </button>
                    </form>
                  )}
                  
                  {/* Replies */}
                  {comments
                    .filter(reply => reply.parent_comment_id === comment.id)
                    .map((reply) => (
                      <div key={reply.id} className="mt-4 ml-8 pl-4 border-l-2 border-primary-200">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                              {reply.user?.avatar ? (
                                <img
                                  src={getAvatarUrl(reply.user.avatar)}
                                  alt={reply.user.username}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div class="w-full h-full bg-primary-100 rounded-full flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-600"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-primary-100 rounded-full flex items-center justify-center">
                                  <User size={16} className="text-primary-600" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">{reply.user?.username}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.created_at).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{reply.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryDetail;
