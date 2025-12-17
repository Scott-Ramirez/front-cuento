import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

const StoryTitle = ({ title, onSave, saving }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditing(false);
    setValue(title);
  };
  const handleSave = async () => {
    if (!value.trim() || value === title) {
      setEditing(false);
      return;
    }
    await onSave(value);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      {editing ? (
        <>
          <input
            className="text-4xl font-bold border-b-2 border-primary-600 focus:outline-none px-2 py-1 mr-2 bg-white"
            value={value}
            onChange={e => setValue(e.target.value)}
            disabled={saving}
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            maxLength={100}
            style={{ minWidth: '200px' }}
          />
          <button onClick={handleSave} disabled={saving} className="ml-1 text-green-600 hover:text-green-800">
            <Check size={22} />
          </button>
          <button onClick={handleCancel} disabled={saving} className="ml-1 text-red-600 hover:text-red-800">
            <X size={22} />
          </button>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold">{title}</h1>
          <button onClick={handleEdit} className="ml-2 text-gray-500 hover:text-primary-600" title="Editar título">
            <Pencil size={22} />
          </button>
        </>
      )}
    </div>
  );
};

export default StoryTitle;
