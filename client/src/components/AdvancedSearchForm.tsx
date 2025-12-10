import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, ChevronDown, Home, Building2, X, MessageCircle } from "lucide-react";
import { saudiCities } from "@shared/saudi-locations";

interface SearchFilters {
  transactionType: "sale" | "rent";
  location: string;
  propertyCategory: "residential" | "commercial";
  propertyType: string;
  rooms: string;
  bathrooms: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  status: "all" | "ready" | "under_construction";
  rentPeriod: "all" | "yearly" | "monthly";
}

const residentialTypes = [
  { value: "apartment", label: "شقة" },
  { value: "villa", label: "فيلا" },
  { value: "duplex", label: "دور" },
  { value: "floor", label: "دور" },
  { value: "room", label: "غرفة" },
  { value: "chalet", label: "شاليه" },
  { value: "rest_house", label: "استراحة" },
  { value: "townhouse", label: "تاون هاوس" },
  { value: "residential_building", label: "عمارة سكنية" },
  { value: "residential_land", label: "أرض سكنية" },
];

const commercialTypes = [
  { value: "office", label: "مكتب" },
  { value: "commercial_building", label: "عمارة تجارية" },
  { value: "warehouse", label: "مستودع" },
  { value: "commercial_land", label: "أرض تجارية" },
  { value: "industrial_land", label: "أرض صناعية" },
  { value: "farm", label: "مزرعة" },
  { value: "agricultural_land", label: "أرض زراعية" },
  { value: "hotel", label: "فندق" },
  { value: "workshop", label: "ورشة" },
  { value: "factory", label: "مصنع" },
  { value: "school", label: "مدرسة" },
  { value: "health_center", label: "مركز صحي" },
  { value: "station", label: "محطة" },
  { value: "showroom", label: "معرض" },
];

interface AdvancedSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  onSwitchToChat: () => void;
}

export function AdvancedSearchForm({ onSearch, onSwitchToChat }: AdvancedSearchFormProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    transactionType: "sale",
    location: "",
    propertyCategory: "residential",
    propertyType: "",
    rooms: "",
    bathrooms: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    status: "all",
    rentPeriod: "all",
  });

  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [areaOpen, setAreaOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const propertyTypes = filters.propertyCategory === "residential" ? residentialTypes : commercialTypes;

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      transactionType: "sale",
      location: "",
      propertyCategory: "residential",
      propertyType: "",
      rooms: "",
      bathrooms: "",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      status: "all",
      rentPeriod: "all",
    });
  };

  const getSelectedPropertyTypeLabel = () => {
    if (!filters.propertyType) return "سكني";
    const type = propertyTypes.find(t => t.value === filters.propertyType);
    return type?.label || "سكني";
  };

  const getRoomsLabel = () => {
    if (!filters.rooms && !filters.bathrooms) return "غرفة & دورة مياه";
    const parts = [];
    if (filters.rooms) parts.push(`${filters.rooms} غرف`);
    if (filters.bathrooms) parts.push(`${filters.bathrooms} حمام`);
    return parts.join(" - ");
  };

  const getPriceLabel = () => {
    if (!filters.minPrice && !filters.maxPrice) return "السعر (ر.س)";
    const parts = [];
    if (filters.minPrice) parts.push(`من ${Number(filters.minPrice).toLocaleString('ar-SA')}`);
    if (filters.maxPrice) parts.push(`إلى ${Number(filters.maxPrice).toLocaleString('ar-SA')}`);
    return parts.join(" ");
  };

  const getStatusLabel = () => {
    switch (filters.status) {
      case "ready": return "جاهز";
      case "under_construction": return "قيد الإنشاء";
      default: return "الجميع";
    }
  };

  return (
    <Card className="p-0 overflow-hidden shadow-xl bg-card/95 backdrop-blur-sm">
      <div className="p-4 space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex rounded-lg border p-1 bg-muted/30">
              <Button
                size="sm"
                variant={filters.transactionType === "sale" ? "default" : "ghost"}
                onClick={() => setFilters(f => ({ ...f, transactionType: "sale" }))}
                className="rounded-md px-6"
                data-testid="button-filter-sale"
              >
                للبيع
              </Button>
              <Button
                size="sm"
                variant={filters.transactionType === "rent" ? "default" : "ghost"}
                onClick={() => setFilters(f => ({ ...f, transactionType: "rent" }))}
                className="rounded-md px-6"
                data-testid="button-filter-rent"
              >
                للإيجار
              </Button>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
              <div className="relative flex-1">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Select
                  value={filters.location}
                  onValueChange={(value) => setFilters(f => ({ ...f, location: value }))}
                >
                  <SelectTrigger className="pr-10 text-right" data-testid="select-location">
                    <SelectValue placeholder="أدخل الموقع" />
                  </SelectTrigger>
                  <SelectContent>
                    {saudiCities.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSearch}
              className="gap-2 px-8"
              data-testid="button-search"
            >
              <Search className="h-4 w-4" />
              بحث
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Popover open={statusOpen} onOpenChange={setStatusOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="button-status-filter">
                  {getStatusLabel()}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-1">
                  {[
                    { value: "all", label: "الجميع" },
                    { value: "ready", label: "جاهز" },
                    { value: "under_construction", label: "قيد الإنشاء" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={filters.status === option.value ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setFilters(f => ({ ...f, status: option.value as any }));
                        setStatusOpen(false);
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={propertyTypeOpen} onOpenChange={setPropertyTypeOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="button-property-type-filter">
                  {getSelectedPropertyTypeLabel()}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <Tabs
                  value={filters.propertyCategory}
                  onValueChange={(v) => setFilters(f => ({ ...f, propertyCategory: v as any, propertyType: "" }))}
                  className="w-full"
                >
                  <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
                    <TabsTrigger value="residential" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                      سكني
                    </TabsTrigger>
                    <TabsTrigger value="commercial" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                      تجاري
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="p-3 grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {propertyTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={filters.propertyType === type.value ? "default" : "outline"}
                      className="justify-between rounded-full"
                      onClick={() => {
                        setFilters(f => ({ ...f, propertyType: type.value }));
                      }}
                    >
                      {type.label}
                      <span className={`w-4 h-4 rounded-full border-2 ${filters.propertyType === type.value ? "bg-primary-foreground border-primary-foreground" : "border-muted-foreground"}`} />
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 p-3 border-t">
                  <Button
                    className="flex-1"
                    onClick={() => setPropertyTypeOpen(false)}
                  >
                    تم
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setFilters(f => ({ ...f, propertyType: "" }))}
                  >
                    إعادة ضبط
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={roomsOpen} onOpenChange={setRoomsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="button-rooms-filter">
                  {getRoomsLabel()}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="start">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">عدد الغرف</label>
                    <div className="flex gap-2">
                      {["1", "2", "3", "4", "5", "6+"].map((num) => (
                        <Button
                          key={num}
                          size="sm"
                          variant={filters.rooms === num ? "default" : "outline"}
                          onClick={() => setFilters(f => ({ ...f, rooms: f.rooms === num ? "" : num }))}
                          className="flex-1"
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">دورات المياه</label>
                    <div className="flex gap-2">
                      {["1", "2", "3", "4", "5+"].map((num) => (
                        <Button
                          key={num}
                          size="sm"
                          variant={filters.bathrooms === num ? "default" : "outline"}
                          onClick={() => setFilters(f => ({ ...f, bathrooms: f.bathrooms === num ? "" : num }))}
                          className="flex-1"
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button className="flex-1" onClick={() => setRoomsOpen(false)}>
                      تم
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setFilters(f => ({ ...f, rooms: "", bathrooms: "" }))}
                    >
                      إعادة ضبط
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={priceOpen} onOpenChange={setPriceOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="button-price-filter">
                  {getPriceLabel()}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4" align="start">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">الحد الأدنى</label>
                      <Input
                        type="number"
                        placeholder="أقل سعر"
                        value={filters.minPrice}
                        onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                        className="text-right"
                        data-testid="input-min-price"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">الحد الأعلى</label>
                      <Input
                        type="number"
                        placeholder="أعلى سعر"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                        className="text-right"
                        data-testid="input-max-price"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button className="flex-1" onClick={() => setPriceOpen(false)}>
                      تم
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setFilters(f => ({ ...f, minPrice: "", maxPrice: "" }))}
                    >
                      إعادة ضبط
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={areaOpen} onOpenChange={setAreaOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="button-area-filter">
                  المساحة (م²)
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4" align="start">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">الحد الأدنى م²</label>
                      <Input
                        type="number"
                        placeholder="أقل مساحة"
                        value={filters.minArea}
                        onChange={(e) => setFilters(f => ({ ...f, minArea: e.target.value }))}
                        className="text-right"
                        data-testid="input-min-area"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">الحد الأعلى م²</label>
                      <Input
                        type="number"
                        placeholder="أكبر مساحة"
                        value={filters.maxArea}
                        onChange={(e) => setFilters(f => ({ ...f, maxArea: e.target.value }))}
                        className="text-right"
                        data-testid="input-max-area"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button className="flex-1" onClick={() => setAreaOpen(false)}>
                      تم
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setFilters(f => ({ ...f, minArea: "", maxArea: "" }))}
                    >
                      إعادة ضبط
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {filters.transactionType === "rent" && (
              <Select
                value={filters.rentPeriod}
                onValueChange={(value) => setFilters(f => ({ ...f, rentPeriod: value as any }))}
              >
                <SelectTrigger className="w-32" data-testid="select-rent-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الجميع</SelectItem>
                  <SelectItem value="yearly">سنوياً</SelectItem>
                  <SelectItem value="monthly">شهرياً</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center pt-2 border-t">
          <Button
            variant="ghost"
            className="gap-2 text-primary"
            onClick={onSwitchToChat}
            data-testid="button-switch-to-chat"
          >
            <MessageCircle className="h-4 w-4" />
            أو أخبرنا بما تريد بكلماتك
          </Button>
        </div>
      </div>
    </Card>
  );
}
