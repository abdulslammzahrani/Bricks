import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, User, Phone, Home, Building2, ChevronDown, ChevronUp } from "lucide-react";
import { saudiCities } from "@shared/saudi-locations";

interface SearchFilters {
  name: string;
  phone: string;
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
  { value: "floor", label: "دور" },
  { value: "residential_land", label: "أرض" },
];

const commercialTypes = [
  { value: "office", label: "مكتب" },
  { value: "commercial_building", label: "عمارة" },
  { value: "warehouse", label: "مستودع" },
  { value: "commercial_land", label: "أرض تجارية" },
];

interface AdvancedSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  onSwitchToChat: () => void;
}

export function AdvancedSearchForm({ onSearch, onSwitchToChat }: AdvancedSearchFormProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    name: "",
    phone: "",
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

  const [showMore, setShowMore] = useState(false);

  const propertyTypes = filters.propertyCategory === "residential" ? residentialTypes : commercialTypes;

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Name and Phone - Always visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="الاسم"
            value={filters.name}
            onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))}
            className="pr-10 text-right h-12 text-base"
            data-testid="input-name"
          />
        </div>
        <div className="relative">
          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="tel"
            placeholder="رقم الجوال"
            value={filters.phone}
            onChange={(e) => setFilters(f => ({ ...f, phone: e.target.value }))}
            className="pr-10 text-right h-12 text-base"
            dir="ltr"
            data-testid="input-phone"
          />
        </div>
      </div>

      {/* Sale/Rent Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          size="lg"
          variant={filters.transactionType === "sale" ? "default" : "outline"}
          onClick={() => setFilters(f => ({ ...f, transactionType: "sale" }))}
          className="flex-1 h-12 text-base"
          data-testid="button-filter-sale"
        >
          للبيع
        </Button>
        <Button
          type="button"
          size="lg"
          variant={filters.transactionType === "rent" ? "default" : "outline"}
          onClick={() => setFilters(f => ({ ...f, transactionType: "rent" }))}
          className="flex-1 h-12 text-base"
          data-testid="button-filter-rent"
        >
          للإيجار
        </Button>
      </div>

      {/* Location */}
      <div className="relative">
        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Select
          value={filters.location}
          onValueChange={(value) => setFilters(f => ({ ...f, location: value }))}
        >
          <SelectTrigger className="pr-10 text-right h-12 text-base" data-testid="select-location">
            <SelectValue placeholder="اختر المدينة" />
          </SelectTrigger>
          <SelectContent className="z-[100]">
            {saudiCities.map((city) => (
              <SelectItem key={city.name} value={city.name} className="text-base">
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Property Category Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={filters.propertyCategory === "residential" ? "default" : "outline"}
          onClick={() => setFilters(f => ({ ...f, propertyCategory: "residential", propertyType: "" }))}
          className="flex-1 h-11 gap-2"
          data-testid="button-category-residential"
        >
          <Home className="h-4 w-4" />
          سكني
        </Button>
        <Button
          type="button"
          variant={filters.propertyCategory === "commercial" ? "default" : "outline"}
          onClick={() => setFilters(f => ({ ...f, propertyCategory: "commercial", propertyType: "" }))}
          className="flex-1 h-11 gap-2"
          data-testid="button-category-commercial"
        >
          <Building2 className="h-4 w-4" />
          تجاري
        </Button>
      </div>

      {/* Property Type - Simple Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {propertyTypes.map((type) => (
          <Button
            key={type.value}
            type="button"
            variant={filters.propertyType === type.value ? "default" : "outline"}
            onClick={() => setFilters(f => ({ ...f, propertyType: f.propertyType === type.value ? "" : type.value }))}
            className="h-11 text-base"
            data-testid={`button-type-${type.value}`}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Show More Options */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => setShowMore(!showMore)}
        className="w-full text-muted-foreground gap-2"
        data-testid="button-show-more"
      >
        {showMore ? (
          <>
            <ChevronUp className="h-4 w-4" />
            إخفاء الخيارات
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            المزيد من الخيارات
          </>
        )}
      </Button>

      {/* Additional Options - Collapsible */}
      {showMore && (
        <div className="space-y-4 pt-2 border-t">
          {/* Rooms */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">عدد الغرف</label>
            <div className="flex gap-2 flex-wrap">
              {["1", "2", "3", "4", "5", "6+"].map((num) => (
                <Button
                  key={num}
                  type="button"
                  size="sm"
                  variant={filters.rooms === num ? "default" : "outline"}
                  onClick={() => setFilters(f => ({ ...f, rooms: f.rooms === num ? "" : num }))}
                  className="flex-1 min-w-[48px]"
                  data-testid={`button-rooms-${num}`}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">نطاق السعر (ر.س)</label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="من"
                value={filters.minPrice}
                onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                className="text-right h-11"
                data-testid="input-min-price"
              />
              <Input
                type="number"
                placeholder="إلى"
                value={filters.maxPrice}
                onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                className="text-right h-11"
                data-testid="input-max-price"
              />
            </div>
          </div>

          {/* Area Range */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">المساحة (م²)</label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="من"
                value={filters.minArea}
                onChange={(e) => setFilters(f => ({ ...f, minArea: e.target.value }))}
                className="text-right h-11"
                data-testid="input-min-area"
              />
              <Input
                type="number"
                placeholder="إلى"
                value={filters.maxArea}
                onChange={(e) => setFilters(f => ({ ...f, maxArea: e.target.value }))}
                className="text-right h-11"
                data-testid="input-max-area"
              />
            </div>
          </div>
        </div>
      )}

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        size="lg"
        className="w-full h-14 text-lg gap-3"
        data-testid="button-search"
      >
        <Search className="h-5 w-5" />
        ابحث الآن
      </Button>

      {/* Chat Alternative */}
      <p className="text-center text-sm text-muted-foreground">
        أو{" "}
        <button
          onClick={onSwitchToChat}
          className="text-primary underline hover:no-underline"
          data-testid="button-switch-to-chat"
        >
          تحدث مع المساعد الذكي
        </button>
      </p>
    </div>
  );
}
