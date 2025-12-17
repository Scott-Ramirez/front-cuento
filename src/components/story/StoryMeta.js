import { User, Eye, Heart, MessageCircle } from 'lucide-react';

const StoryMeta = ({ username, views, likes, comments }) => (
  <div className="flex gap-6 text-gray-600 mb-6">
    <span className="flex items-center gap-1">
      <User size={18} /> {username}
    </span>
    <span className="flex items-center gap-1">
      <Eye size={18} /> {views}
    </span>
    <span className="flex items-center gap-1">
      <Heart size={18} /> {likes}
    </span>
    <span className="flex items-center gap-1">
      <MessageCircle size={18} /> {comments}
    </span>
  </div>
);

export default StoryMeta;
