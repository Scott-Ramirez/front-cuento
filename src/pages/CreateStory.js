import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Plus, Bold, Italic, List, AlignLeft } from 'lucide-react';
import api from '../services/api';
import { showSuccess, showError, showWarning, showLoading, closeLoading } from '../utils/alerts';

const CreateStory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [chapters, setChapters] = useState([
    { chapter_number: 1, title: '', content: '', image: null, imagePreview: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeChapter, setActiveChapter] = useState(0);
  const [showChapters, setShowChapters] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const removeCover = () => {
    setCoverImage(null);
    setCoverPreview('');
  };

  const handleChapterChange = (index, field, value) => {
    const newChapters = [...chapters];
    newChapters[index][field] = value;
    setChapters(newChapters);
  };

  const handleChapterImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newChapters = [...chapters];
      newChapters[index].image = file;
      newChapters[index].imagePreview = URL.createObjectURL(file);
      setChapters(newChapters);
    }
  };

  const removeChapterImage = (index) => {
    const newChapters = [...chapters];
    newChapters[index].image = null;
    newChapters[index].imagePreview = '';
    setChapters(newChapters);
  };

  const addChapter = () => {
    setChapters([
      ...chapters,
      {
        chapter_number: chapters.length + 1,
        title: '',
        content: '',
        image: null,
        imagePreview: ''
      }
    ]);
    setActiveChapter(chapters.length);
  };

  const removeChapter = (index) => {
    if (chapters.length === 1) {
      showWarning('Debe haber al menos un capítulo');
      return;
    }
    const newChapters = chapters.filter((_, i) => i !== index);
    // Renumerar capítulos
    newChapters.forEach((chapter, i) => {
      chapter.chapter_number = i + 1;
    });
    setChapters(newChapters);
    if (activeChapter >= newChapters.length) {
      setActiveChapter(newChapters.length - 1);
    }
  };

  const insertFormatting = (index, format) => {
    const textarea = document.getElementById(`chapter-content-${index}`);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = chapters[index].content;
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
    handleChapterChange(index, 'content', newContent);
    
    // Restaurar el foco
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const insertDescriptionFormatting = (format) => {
    const textarea = document.getElementById('description-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.description;
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
    setFormData({ ...formData, description: newContent });
    
    // Restaurar el foco
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    showLoading('Creando cuento...', 'Por favor espera mientras subimos las imágenes y guardamos los capítulos');

    try {
      let coverImagePath = '';

      // Upload cover image if exists
      if (coverImage) {
        const formDataImg = new FormData();
        formDataImg.append('file', coverImage);
        
        const uploadRes = await api.post('/upload/cover', formDataImg, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        coverImagePath = uploadRes.data.path;
      }

      // Create story
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const storyData = {
        title: formData.title,
        description: formData.description,
        cover_image: coverImagePath,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      };

      const response = await api.post('/stories', storyData);
      const storyId = response.data.id;

      // Upload chapter images and create chapters only if user added chapters
      if (showChapters) {
        for (const chapter of chapters) {
          let chapterImagePath = '';
          
          if (chapter.image) {
            const formDataChapter = new FormData();
            formDataChapter.append('file', chapter.image);
            
            const uploadRes = await api.post('/upload/chapter-image', formDataChapter, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            chapterImagePath = uploadRes.data.path;
          }

          await api.post(`/stories/${storyId}/chapters`, {
            chapter_number: chapter.chapter_number,
            title: chapter.title,
            content: chapter.content,
            image: chapterImagePath || undefined,
          });
        }
      }

      closeLoading();
      await showSuccess(
        'Tu cuento ha sido creado exitosamente. Puedes encontrarlo en tu dashboard.',
        '¡Cuento creado!'
      );
      
      // Navegar al dashboard en lugar de al detalle del cuento
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating story:', error);
      closeLoading();
      const errorMessage = error.response?.data?.message || 'Error al crear el cuento. Por favor intenta de nuevo.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Crear Nuevo Cuento</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="El título de tu cuento"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
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
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows="5"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono"
            placeholder="Describe tu cuento..."
            style={{ whiteSpace: 'pre-wrap' }}
          />
          <p className="mt-1 text-sm text-gray-500">
            Usa **texto** para negrita, *texto* para cursiva, - para listas
          </p>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen de Portada
          </label>
          
          {coverPreview ? (
            <div className="relative">
              <img
                src={coverPreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeCover}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click para subir</span> o arrastra la imagen
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleCoverChange}
              />
            </label>
          )}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags (separados por comas)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="aventura, fantasía, drama"
          />
          <p className="mt-1 text-sm text-gray-500">
            Ejemplo: aventura, fantasía, infantil
          </p>
        </div>

        {/* Chapters Section */}
        <div className="border-t border-gray-200 pt-6">
          {!showChapters ? (
            // Botón inicial para mostrar la sección de capítulos
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowChapters(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mx-auto"
              >
                <Plus size={20} />
                Agregar Capítulos
              </button>
              <p className="mt-2 text-sm text-gray-500">Opcional: Agrega capítulos a tu cuento</p>
            </div>
          ) : (
            // Sección completa de capítulos
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Capítulos</h2>
                <button
                  type="button"
                  onClick={addChapter}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={20} />
                  Agregar Capítulo
                </button>
              </div>

              {/* Chapter Tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {chapters.map((chapter, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveChapter(index)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                        activeChapter === index
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Capítulo {chapter.chapter_number}
                    </button>
                    {chapters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChapter(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar capítulo"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Active Chapter Content */}
              {chapters.map((chapter, index) => (
                <div
                  key={index}
                  className={`space-y-4 ${activeChapter === index ? 'block' : 'hidden'}`}
                >
              {/* Chapter Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Capítulo {chapter.chapter_number} *
                </label>
                <input
                  type="text"
                  required
                  value={chapter.title}
                  onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Título del capítulo"
                />
              </div>

              {/* Chapter Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del Capítulo (opcional)
                </label>
                
                {chapter.imagePreview ? (
                  <div className="relative">
                    <img
                      src={chapter.imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeChapterImage(index)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Agregar imagen</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleChapterImageChange(index, e)}
                    />
                  </label>
                )}
              </div>

              {/* Text Formatting Toolbar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenido del Capítulo *
                </label>
                <div className="flex gap-2 mb-2 p-2 bg-gray-50 rounded-lg border border-gray-300">
                  <button
                    type="button"
                    onClick={() => insertFormatting(index, 'bold')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Negrita (**texto**)"
                  >
                    <Bold size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting(index, 'italic')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Cursiva (*texto*)"
                  >
                    <Italic size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting(index, 'list')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Lista (- item)"
                  >
                    <List size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting(index, 'paragraph')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Nuevo párrafo"
                  >
                    <AlignLeft size={18} />
                  </button>
                </div>
                <textarea
                  id={`chapter-content-${index}`}
                  required
                  value={chapter.content}
                  onChange={(e) => handleChapterChange(index, 'content', e.target.value)}
                  rows="12"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                  placeholder="Escribe el contenido del capítulo...&#10;&#10;**Usa negrita con doble asterisco**&#10;*Cursiva con asterisco simple*&#10;- Listas con guión&#10;&#10;Los saltos de línea se preservarán automáticamente."
                  style={{ whiteSpace: 'pre-wrap' }}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Usa **texto** para negrita, *texto* para cursiva, - para listas
                </p>
              </div>
            </div>
          ))}
            </>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? 'Creando...' : 'Crear Cuento'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStory;
