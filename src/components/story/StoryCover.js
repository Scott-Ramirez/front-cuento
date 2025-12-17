import { Camera } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

const StoryCover = ({ coverImage, title, uploading, onChange }) => (
  <div className="h-64 md:h-96 rounded-lg overflow-hidden bg-gray-200 mb-8">
    <div className="relative h-full w-full">
      {coverImage ? (
        <img
          src={getMediaUrl(coverImage)}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-6xl">📖</div>
      )}
      <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow cursor-pointer hover:bg-gray-100" title="Cambiar portada">
        <Camera size={22} className={uploading ? 'animate-spin' : ''} />
        <input type="file" accept="image/*" className="hidden" onChange={onChange} disabled={uploading} />
      </label>
    </div>
  </div>
);

export default StoryCover;
