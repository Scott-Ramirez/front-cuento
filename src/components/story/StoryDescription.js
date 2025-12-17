import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

const StoryDescription = ({ description, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(description || '');
  const [saving, setSaving] = useState(false);

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditing(false);
    setValue(description || '');
  };
  const handleSave = async () => {
    if (!value.trim() || value === description) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onSave(value);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="mb-10">
      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            className="text-lg border-b-2 border-primary-600 focus:outline-none px-2 py-1 bg-white text-gray-700 rounded"
            value={value}
            onChange={e => setValue(e.target.value)}
            rows={3}
            disabled={saving}
            autoFocus
            maxLength={1000}
            style={{ minHeight: '60px' }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <div className="flex gap-2 mt-1">
            <button onClick={handleSave} disabled={saving} className="text-green-600 hover:text-green-800">
              <Check size={22} />
            </button>
            <button onClick={handleCancel} disabled={saving} className="text-red-600 hover:text-red-800">
              <X size={22} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <p className="text-lg text-gray-700 whitespace-pre-wrap flex-1">{description}</p>
          <button onClick={handleEdit} className="ml-2 text-gray-500 hover:text-primary-600" title="Editar descripción">
            <Pencil size={22} />
          </button>
        </div>
      )}
    </div>
  );
};

export default StoryDescription;
