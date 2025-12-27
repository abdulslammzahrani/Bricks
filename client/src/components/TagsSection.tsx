import { useState } from 'react';

interface Tag {
  label: string;
  type?: 'buyer' | 'seller';
}

interface TagsSectionProps {
  title: string;
  icon: string;
  tags: Tag[];
}

export function TagsSection({ title, icon, tags }: TagsSectionProps) {
  const [isVerified, setIsVerified] = useState(false);

  // Safety check for tags
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white relative">
      {/* Watermark when verified */}
      {isVerified && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-green-500 opacity-10 transform -rotate-12">
            <div className="text-4xl font-bold whitespace-nowrap">
              ✓ تم التأكد من البيانات
            </div>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border-b border-amber-100">
        <span className="text-sm">{icon}</span>
        <span className="font-medium text-xs flex-1">{title}</span>
        
        {/* Verification Checkbox */}
        <label className="flex items-center gap-1.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={isVerified}
            onChange={(e) => setIsVerified(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
          />
          <span className="text-xs text-gray-600 group-hover:text-gray-900">
            تأكيد
          </span>
        </label>
      </div>

      {/* Tags Content */}
      <div className="p-3">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border ${
                tag.type === 'buyer'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : tag.type === 'seller'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              {tag.type && (
                <span className="font-medium">
                  {tag.type === 'buyer' ? 'المشتري:' : 'البائع:'}
                </span>
              )}
              <span>{tag.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


