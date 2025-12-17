import { useState } from 'react';
import { Share2 } from 'lucide-react';

const ShareButton = ({ url }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {}
    }
  };

  return (
    <button
      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      onClick={handleShare}
      title="Compartir historia"
    >
      <Share2 size={20} />
      {copied ? '¡Enlace copiado!' : 'Compartir'}
    </button>
  );
};

export default ShareButton;
