import ChapterItem from './ChapterItem';

const ChapterList = ({ chapters, onEditTitle, onEditContent, onEditImage, editingChapter, editingChapterContent, newChapterTitle, newChapterContent, savingChapter, savingChapterContent, uploadingChapterImage, setEditingChapter, setNewChapterTitle, setEditingChapterContent, setNewChapterContent }) => (
  <div className="space-y-6 mb-12">
    {chapters.sort((a, b) => a.chapter_number - b.chapter_number).map((ch) => (
      <ChapterItem
        key={ch.id}
        chapter={ch}
        onEditTitle={onEditTitle}
        onEditContent={onEditContent}
        onEditImage={onEditImage}
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
    ))}
  </div>
);

export default ChapterList;
