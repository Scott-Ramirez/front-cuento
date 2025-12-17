import { useState } from 'react';

const AddChapterForm = ({ onAdd, loading }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Título y contenido requeridos');
      return;
    }
    setError('');
    await onAdd({ title, content });
    setTitle('');
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 bg-white rounded shadow flex flex-col gap-3">
      <h3 className="text-lg font-semibold mb-2">Agregar nuevo capítulo</h3>
      <input
        className="border px-3 py-2 rounded"
        type="text"
        placeholder="Título del capítulo"
        value={title}
        onChange={e => setTitle(e.target.value)}
        disabled={loading}
        maxLength={100}
      />
      <textarea
        className="border px-3 py-2 rounded"
        placeholder="Contenido del capítulo"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={4}
        disabled={loading}
        maxLength={5000}
      />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        type="submit"
        className="self-end bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        disabled={loading}
      >
        Agregar capítulo
      </button>
    </form>
  );
};

export default AddChapterForm;
