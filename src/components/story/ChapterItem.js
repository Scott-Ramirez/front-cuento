import { useRef } from 'react';
import { Pencil, Check, X, Camera } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

const ChapterItem = ({
  chapter,
  onEditTitle,
  onEditContent,
  onEditImage,
  editingChapter,
  editingChapterContent,
  newChapterTitle,
  newChapterContent,
  savingChapter,
  savingChapterContent,
  uploadingChapterImage,
  setEditingChapter,
  setNewChapterTitle,
  setEditingChapterContent,
  setNewChapterContent
}) => {
  const fileInputRef = useRef();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl font-semibold">Capítulo {chapter.chapter_number}:</span>
        {editingChapter === chapter.id ? (
          <>
            <input
              className="text-xl font-semibold border-b-2 border-primary-600 focus:outline-none px-2 py-1 mr-2 bg-white"
              value={newChapterTitle}
              onChange={e => setNewChapterTitle(e.target.value)}
              disabled={savingChapter}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') onEditTitle(chapter);
                if (e.key === 'Escape') setEditingChapter(null);
              }}
              maxLength={100}
              style={{ minWidth: '120px' }}
            />
            <button onClick={() => onEditTitle(chapter)} disabled={savingChapter} className="ml-1 text-green-600 hover:text-green-800">
              <Check size={20} />
            </button>
            <button onClick={() => setEditingChapter(null)} disabled={savingChapter} className="ml-1 text-red-600 hover:text-red-800">
              <X size={20} />
            </button>
          </>
        ) : (
          <>
            <span>{chapter.title}</span>
            <button onClick={() => { setEditingChapter(chapter.id); setNewChapterTitle(chapter.title); }} className="ml-2 text-gray-500 hover:text-primary-600" title="Editar título de capítulo">
              <Pencil size={20} />
            </button>
          </>
        )}
      </div>
      <div className="relative w-full h-64 mb-4">
        {chapter.image ? (
          <img
            src={getMediaUrl(chapter.image)}
            alt={chapter.title}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-100 rounded">🖼️</div>
        )}
        <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow cursor-pointer hover:bg-gray-100" title="Cambiar imagen de capítulo">
          <Camera size={20} className={uploadingChapterImage[chapter.id] ? 'animate-spin' : ''} />
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={e => onEditImage(chapter, e)} disabled={uploadingChapterImage[chapter.id]} />
        </label>
      </div>
      <div className="flex items-start gap-2">
        {editingChapterContent === chapter.id ? (
          <>
            <textarea
              className="flex-1 border-b-2 border-primary-600 focus:outline-none px-2 py-1 bg-white text-gray-700"
              value={newChapterContent}
              onChange={e => setNewChapterContent(e.target.value)}
              rows={4}
              disabled={savingChapterContent}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Escape') setEditingChapterContent(null);
              }}
              maxLength={5000}
              style={{ minWidth: '120px' }}
            />
            <button onClick={() => onEditContent(chapter)} disabled={savingChapterContent} className="ml-1 text-green-600 hover:text-green-800">
              <Check size={20} />
            </button>
            <button onClick={() => setEditingChapterContent(null)} disabled={savingChapterContent} className="ml-1 text-red-600 hover:text-red-800">
              <X size={20} />
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-700 whitespace-pre-wrap flex-1">{chapter.content}</p>
            <button onClick={() => { setEditingChapterContent(chapter.id); setNewChapterContent(chapter.content); }} className="ml-2 text-gray-500 hover:text-primary-600" title="Editar contenido de capítulo">
              <Pencil size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChapterItem;
