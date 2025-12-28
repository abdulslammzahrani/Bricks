import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, TrendingUp, BarChart3, MapPin, DollarSign, Bed, Bath, Ruler, Phone, Mail, Calendar } from "lucide-react";
import type { Notification } from "./NotificationCard";

interface NotificationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
  onEdit: () => void;
  onDelete: () => void;
  onPromote: () => void;
  onStats: () => void;
}

export function NotificationPreviewModal({
  isOpen,
  onClose,
  notification,
  onEdit,
  onDelete,
  onPromote,
  onStats,
}: NotificationPreviewModalProps) {
  if (!notification) return null;

  const formatPrice = (price: number | null) => {
    if (!price) return "غير محدد";
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}م`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)}ألف`;
    return price.toLocaleString('ar-SA');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{notification.title}</DialogTitle>
          <DialogDescription>
            {notification.city} - {notification.district}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Images */}
          {notification.images && notification.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {notification.images.slice(0, 4).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${notification.title} - ${idx + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ))}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span className="text-2xl font-bold">
              {notification.price 
                ? `${formatPrice(notification.price)} ريال`
                : notification.budgetMin && notification.budgetMax
                ? `${formatPrice(notification.budgetMin)} - ${formatPrice(notification.budgetMax)} ريال`
                : 'غير محدد'}
            </span>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">الوصف</h4>
            <p className="text-gray-700">{notification.description}</p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-3 gap-4">
            {notification.bedrooms && (
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-gray-600" />
                <span>{notification.bedrooms} غرف</span>
              </div>
            )}
            {notification.bathrooms && (
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-gray-600" />
                <span>{notification.bathrooms} حمامات</span>
              </div>
            )}
            {notification.area && (
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-gray-600" />
                <span>{notification.area} م²</span>
              </div>
            )}
          </div>

          {/* Features */}
          {notification.features && notification.features.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">المميزات</h4>
              <div className="flex flex-wrap gap-2">
                {notification.features.map((feature, idx) => (
                  <Badge key={idx} variant="outline">{feature}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">معلومات الاتصال</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">الاسم:</span>
                <span>{notification.contactName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{notification.contactPhone}</span>
              </div>
              {notification.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{notification.contactEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="border-t pt-4 flex items-center gap-6 text-sm text-gray-600">
            {(notification.views || notification.viewsCount) && (
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{notification.views || notification.viewsCount || 0} مشاهدة</span>
              </div>
            )}
            {notification.inquiries !== undefined && (
              <div className="flex items-center gap-1">
                <span>{notification.inquiries} استفسار</span>
              </div>
            )}
            {notification.createdAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(notification.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={onStats}>
              <BarChart3 className="w-4 h-4 ml-2" />
              الإحصائيات
            </Button>
            <Button variant="outline" onClick={onPromote}>
              <TrendingUp className="w-4 h-4 ml-2" />
              ترقية
            </Button>
            <Button variant="outline" onClick={onEdit}>
              <Edit className="w-4 h-4 ml-2" />
              تعديل
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="w-4 h-4 ml-2" />
              حذف
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

