import { Check, X, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ComparisonItem {
  label: string;
  buyerValue: string | number;
  sellerValue: string | number;
  match: 'full' | 'partial' | 'none';
  fieldType?: 'text' | 'select';
  options?: { value: string; label: string }[];
  onMatchChange?: (match: 'full' | 'partial' | 'none') => void;
}

interface ComparisonSectionProps {
  title: string;
  icon: string;
  items: ComparisonItem[];
  onBuyerValueChange?: (index: number, newValue: string) => void;
  onSellerValueChange?: (index: number, newValue: string) => void;
}

export function ComparisonSection({ title, icon, items, onBuyerValueChange, onSellerValueChange }: ComparisonSectionProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [editingIndex, setEditingIndex] = useState<{ itemIndex: number; field: 'buyer' | 'seller' } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // دالة لحساب حالة المطابقة
  const calculateMatch = (buyerVal: string, sellerVal: string): 'full' | 'partial' | 'none' => {
    if (buyerVal === sellerVal) return 'full';
    if (buyerVal && sellerVal && buyerVal.toLowerCase() === sellerVal.toLowerCase()) return 'full';
    return 'none';
  };

  // دالة لتحديث القيمة
  const handleValueUpdate = (index: number, field: 'buyer' | 'seller', newValue: string) => {
    // استدعاء callback مباشرة
    if (field === 'buyer' && onBuyerValueChange) {
      onBuyerValueChange(index, newValue);
    } else if (field === 'seller' && onSellerValueChange) {
      onSellerValueChange(index, newValue);
    }
  };

  const getMatchIcon = (match: 'full' | 'partial' | 'none') => {
    switch (match) {
      case 'full':
        return <Check size={20} className="text-green-500" />;
      case 'partial':
        return <Minus size={20} className="text-yellow-500" />;
      case 'none':
        return <X size={20} className="text-red-500" />;
    }
  };

  const getMatchColor = (match: 'full' | 'partial' | 'none') => {
    switch (match) {
      case 'full':
        return 'bg-green-50 border-green-200';
      case 'partial':
        return 'bg-yellow-50 border-yellow-200';
      case 'none':
        return 'bg-red-50 border-red-200';
    }
  };

  if (!items || items.length === 0) return null;

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
      <div className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border-b border-gray-100">
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

      {/* Section Content */}
      <div className="p-2 space-y-1.5">
        {items.map((item, index) => {
          const isEditingBuyer = editingIndex?.itemIndex === index && editingIndex?.field === 'buyer';
          const isEditingSeller = editingIndex?.itemIndex === index && editingIndex?.field === 'seller';
          const fieldType = item.fieldType || 'text';
          const currentBuyerValue = isEditingBuyer ? editValue : String(item.buyerValue);
          const currentSellerValue = isEditingSeller ? editValue : String(item.sellerValue);
          const currentMatch = calculateMatch(currentBuyerValue, currentSellerValue);
          const borderColor = currentMatch === 'full' ? 'border-green-500' : currentMatch === 'partial' ? 'border-yellow-500' : 'border-red-500';
          
          return (
            <div
              key={index}
              className={`rounded p-1.5 ${getMatchColor(currentMatch)}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="flex-shrink-0">{getMatchIcon(currentMatch)}</span>
                <span className="font-medium text-gray-700 text-xs flex-1">{item.label}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {/* Buyer Value */}
                <div className={`bg-white/70 rounded px-2 py-1 border ${isEditingBuyer ? borderColor : currentMatch === 'full' ? 'border-green-500' : 'border-blue-100'}`}>
                  <div className="text-xs text-gray-500">المشتري:</div>
                  {isEditingBuyer ? (
                    fieldType === 'select' && item.options ? (
                      <Select
                        value={editValue}
                        onValueChange={(value) => {
                          handleValueUpdate(index, 'buyer', value);
                          setEditingIndex(null);
                          setEditValue('');
                        }}
                      >
                        <SelectTrigger className="h-6 text-xs p-1 mt-0.5">
                          <SelectValue placeholder="اختر..." />
                        </SelectTrigger>
                        <SelectContent>
                          {item.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => {
                          if (editValue.trim()) {
                            handleValueUpdate(index, 'buyer', editValue);
                          }
                          setEditingIndex(null);
                          setEditValue('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editValue.trim()) {
                              handleValueUpdate(index, 'buyer', editValue);
                            }
                            setEditingIndex(null);
                            setEditValue('');
                          } else if (e.key === 'Escape') {
                            setEditingIndex(null);
                            setEditValue('');
                          }
                        }}
                        className="h-6 text-xs p-1 mt-0.5"
                        autoFocus
                      />
                    )
                  ) : (
                    <div
                      className={`text-gray-900 cursor-pointer hover:bg-blue-50 rounded px-1 py-0.5 transition-colors ${currentMatch === 'full' ? 'text-green-700 font-medium' : ''}`}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingIndex({ itemIndex: index, field: 'buyer' });
                        setEditValue(String(item.buyerValue));
                      }}
                      title="اضغط مرتين للتعديل"
                    >
                      {item.buyerValue}
                    </div>
                  )}
                </div>
                
                {/* Seller Value */}
                <div className={`bg-white/70 rounded px-2 py-1 border ${isEditingSeller ? borderColor : currentMatch === 'full' ? 'border-green-500' : 'border-green-100'}`}>
                  <div className="text-xs text-gray-500">البائع:</div>
                  {isEditingSeller ? (
                    fieldType === 'select' && item.options ? (
                      <Select
                        value={editValue}
                        onValueChange={(value) => {
                          handleValueUpdate(index, 'seller', value);
                          setEditingIndex(null);
                          setEditValue('');
                        }}
                      >
                        <SelectTrigger className="h-6 text-xs p-1 mt-0.5">
                          <SelectValue placeholder="اختر..." />
                        </SelectTrigger>
                        <SelectContent>
                          {item.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => {
                          if (editValue.trim()) {
                            handleValueUpdate(index, 'seller', editValue);
                          }
                          setEditingIndex(null);
                          setEditValue('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editValue.trim()) {
                              handleValueUpdate(index, 'seller', editValue);
                            }
                            setEditingIndex(null);
                            setEditValue('');
                          } else if (e.key === 'Escape') {
                            setEditingIndex(null);
                            setEditValue('');
                          }
                        }}
                        className="h-6 text-xs p-1 mt-0.5"
                        autoFocus
                      />
                    )
                  ) : (
                    <div
                      className={`text-gray-900 cursor-pointer hover:bg-green-50 rounded px-1 py-0.5 transition-colors ${currentMatch === 'full' ? 'text-green-700 font-medium' : ''}`}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingIndex({ itemIndex: index, field: 'seller' });
                        setEditValue(String(item.sellerValue));
                      }}
                      title="اضغط مرتين للتعديل"
                    >
                      {item.sellerValue}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

