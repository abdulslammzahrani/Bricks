import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Icon, LatLng } from "leaflet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Check } from "lucide-react";
import "leaflet/dist/leaflet.css";

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

function LocationMarker({ 
  position, 
  setPosition 
}: { 
  position: LatLng | null; 
  setPosition: (pos: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

export function LocationPicker({ 
  open, 
  onOpenChange, 
  onLocationSelect,
  initialLat = 24.7136,
  initialLng = 46.6753
}: LocationPickerProps) {
  const [position, setPosition] = useState<LatLng | null>(null);

  useEffect(() => {
    if (open && initialLat && initialLng) {
      setPosition(new LatLng(initialLat, initialLng));
    }
  }, [open, initialLat, initialLng]);

  const handleConfirm = () => {
    if (position) {
      onLocationSelect(position.lat, position.lng);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0" dir="rtl">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            حدد موقع العقار على الخريطة
          </DialogTitle>
          <DialogDescription>
            انقر على الخريطة لتحديد الموقع الدقيق للعقار
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 px-4">
          <div className="h-full rounded-lg overflow-hidden border">
            <MapContainer
              center={[initialLat, initialLng]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
        </div>

        <DialogFooter className="p-4 pt-2 gap-2 sm:gap-0">
          <div className="flex-1 text-sm text-muted-foreground">
            {position ? (
              <span className="text-primary">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </span>
            ) : (
              "انقر على الخريطة لتحديد الموقع"
            )}
          </div>
          <Button
            onClick={handleConfirm}
            disabled={!position}
            data-testid="button-confirm-location"
          >
            <Check className="h-4 w-4 ml-2" />
            تأكيد الموقع
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
