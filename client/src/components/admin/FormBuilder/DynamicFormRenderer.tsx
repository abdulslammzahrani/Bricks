import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Search, FileText, Armchair, Briefcase } from "lucide-react";
import * as icons from "lucide-react";
import type { CompleteFormConfig } from "./types";
import type { FormField, FieldOption } from "@shared/schema";
import { saudiCities, directionLabels, Direction } from "@shared/saudi-locations";

interface DynamicFormRendererProps {
  formConfig: CompleteFormConfig;
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
  renderFieldsOnly?: boolean;
}

export default function DynamicFormRenderer({
  formConfig,
  values,
  onChange,
  errors = {},
  renderFieldsOnly = false,
}: DynamicFormRendererProps) {
  const [selectedDirection, setSelectedDirection] = useState<Direction | "all">("all");
  
  // Fetch cities from API (fallback to hardcoded if API fails)
  const { data: citiesFromAPI } = useQuery({
    queryKey: ["/api/form-builder/cities"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/form-builder/cities");
        if (!res.ok) throw new Error("Failed to fetch cities");
        return await res.json();
      } catch (error) {
        console.warn("Failed to fetch cities from API, using hardcoded:", error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Use API cities if available, otherwise fallback to hardcoded
  const availableCities = citiesFromAPI || saudiCities;

  // ScrollableOptions Component - نفس تصميم الفورم الحقيقي
  const ScrollableOptions = ({ label, options, selected, onSelect, unit = "" }: { 
    label: string, 
    options: FieldOption[], 
    selected: string, 
    onSelect: (val: string) => void, 
    unit?: string 
  }) => (
    <div className="mb-5">
      <Label className="text-sm font-semibold mb-3 block">{label}</Label>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.value)}
            className={`
              flex-shrink-0 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all whitespace-nowrap
              ${selected === opt.value 
                ? "bg-primary text-white border-primary shadow-sm scale-105" 
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}
            `}
          >
            {opt.label} {unit}
          </button>
        ))}
      </div>
    </div>
  );

  // Helper function to check if field should be shown based on showCondition
  const shouldShowField = (field: FormField): boolean => {
    if (!field.showCondition) return true;
    
    const condition = field.showCondition as { field?: string; operator?: string; value?: any };
    if (!condition.field || !condition.operator || condition.value === undefined) return true;
    
    const fieldValue = values[condition.field];
    
    switch (condition.operator) {
      case "equals":
        return fieldValue === condition.value || (Array.isArray(fieldValue) && fieldValue.includes(condition.value));
      case "not_equals":
        return fieldValue !== condition.value && (!Array.isArray(fieldValue) || !fieldValue.includes(condition.value));
      case "contains":
        return String(fieldValue).includes(String(condition.value));
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case "not_in":
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      default:
        return true;
    }
  };

  const renderField = (field: FormField, options: FieldOption[]) => {
    // Check if field should be shown based on conditional logic
    if (!shouldShowField(field)) {
      return null;
    }
    
    const value = values[field.name] || "";
    const error = errors[field.name];

    // Special handling for propertyCategory field - render as icon cards
    if (field.name === "propertyCategory" && options.length > 0) {
      return (
        <div key={field.id} className="mb-5">
          <Label className="text-sm font-semibold mb-3 block text-center">
            {field.label} {field.required && <span className="text-destructive">*</span>}
          </Label>
          <div className="grid grid-cols-2 gap-4">
            {options.map((option) => {
              const isSelected = value === option.value;
              // Map option values to icons
              const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
                residential: Armchair,
                commercial: Briefcase,
              };
              // Try to get icon from option.icon or use default
              const IconComponent = option.value in iconMap 
                ? iconMap[option.value] 
                : (option.icon ? (icons[option.icon as keyof typeof icons] as React.ComponentType<{ className?: string }>) : FileText);
              
              // Map option values to colors
              const colorMap: Record<string, { border: string; bg: string }> = {
                residential: {
                  border: isSelected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-gray-200 bg-white hover:border-blue-200",
                  bg: isSelected ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600",
                },
                commercial: {
                  border: isSelected ? "border-amber-500 bg-amber-50 ring-2 ring-amber-200" : "border-gray-200 bg-white hover:border-amber-200",
                  bg: isSelected ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-600",
                },
              };
              const colors = colorMap[option.value] || {
                border: isSelected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-gray-200 bg-white hover:border-primary/20",
                bg: isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-600",
              };

              return (
                <div
                  key={option.id}
                  onClick={() => {
                    onChange(field.name, option.value);
                    // إعادة تعيين propertyType إذا كان لا ينتمي للفئة الجديدة
                    const currentPropertyType = values.propertyType;
                    const residentialTypes = ["apartment", "villa", "floor", "townhouse", "residential_building", "residential_land", "rest_house", "chalet", "room"];
                    const commercialTypes = ["commercial_building", "tower", "complex", "commercial_land", "industrial_land", "farm", "warehouse", "factory", "school", "health_center", "gas_station", "showroom", "office"];
                    
                    if (option.value === "residential" && currentPropertyType && !residentialTypes.includes(currentPropertyType)) {
                      onChange("propertyType", "");
                    } else if (option.value === "commercial" && currentPropertyType && !commercialTypes.includes(currentPropertyType)) {
                      onChange("propertyType", "");
                    }
                  }}
                  className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg h-36 ${colors.border}`}
                >
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${colors.bg}`}>
                    {IconComponent && <IconComponent className="h-6 w-6" />}
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-lg">{option.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {field.helpText && (
            <p className="text-sm text-muted-foreground mt-2 text-center">{field.helpText}</p>
          )}
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
      );
    }

    switch (field.type) {
      case "text":
        return (
          <div key={field.id} className="mb-5">
            <Label className="text-sm font-semibold mb-2 block">{field.label}</Label>
            <Input
              value={value}
              onChange={(e) => onChange(field.name, e.target.value)}
              placeholder={field.placeholder || field.label}
              className={`h-12 text-base rounded-lg ${error ? "border-destructive" : ""}`}
            />
            {field.helpText && (
              <p className="text-sm text-muted-foreground mt-2">{field.helpText}</p>
            )}
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="mb-5">
            <Label className="text-sm font-semibold mb-2 block">{field.label}</Label>
            <Input
              type="number"
              value={value}
              onChange={(e) => onChange(field.name, e.target.value)}
              placeholder={field.placeholder || field.label}
              className={`h-12 text-base rounded-lg ${error ? "border-destructive" : ""}`}
            />
            {field.helpText && (
              <p className="text-sm text-muted-foreground mt-2">{field.helpText}</p>
            )}
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
        );

      case "select":
        // Use ScrollableOptions for select fields with options
        if (options.length > 0) {
          return (
            <div key={field.id} className="mb-5">
              <ScrollableOptions
                label={field.label + (field.required ? " *" : "")}
                options={options}
                selected={value}
                onSelect={(val) => onChange(field.name, val)}
              />
              {field.helpText && (
                <p className="text-sm text-muted-foreground mt-2">{field.helpText}</p>
              )}
              {error && <p className="text-sm text-destructive mt-1">{error}</p>}
            </div>
          );
        }
        // Fallback to regular select if no options
        return (
          <div key={field.id} className="mb-5">
            <Label className="text-sm font-semibold mb-3 block">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => onChange(field.name, val)}>
              <SelectTrigger className={`h-12 text-base ${error ? "border-destructive" : ""}`}>
                <SelectValue placeholder={field.placeholder || "اختر..."} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helpText && (
              <p className="text-sm text-muted-foreground mt-2">{field.helpText}</p>
            )}
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
        );

      case "multi_select":
        return (
          <div key={field.id} className="mb-5">
            <Label className="text-sm font-semibold mb-3 block">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              {options.map((option) => {
                const isSelected = Array.isArray(value) && value.includes(option.value);
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      const current = Array.isArray(value) ? value : [];
                      const newValue = isSelected
                        ? current.filter((v) => v !== option.value)
                        : [...current, option.value];
                      onChange(field.name, newValue);
                    }}
                    className={`
                      flex-shrink-0 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all whitespace-nowrap
                      ${isSelected 
                        ? "bg-primary text-white border-primary shadow-sm scale-105" 
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}
                    `}
                  >
                    {isSelected && <Check className="inline w-4 h-4 mr-1.5" />}
                    {option.label}
                  </button>
                );
              })}
            </div>
            {field.helpText && (
              <p className="text-sm text-muted-foreground mt-2">{field.helpText}</p>
            )}
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
        );

      case "chips":
        return (
          <div key={field.id} className="mb-5">
            <Label className="text-sm font-semibold mb-3 block">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              {options.map((option) => {
                const isSelected = Array.isArray(value) && value.includes(option.value);
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      const current = Array.isArray(value) ? value : [];
                      const newValue = isSelected
                        ? current.filter((v) => v !== option.value)
                        : [...current, option.value];
                      onChange(field.name, newValue);
                    }}
                    className={`
                      flex-shrink-0 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all whitespace-nowrap
                      ${isSelected 
                        ? "bg-primary text-white border-primary shadow-sm scale-105" 
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}
                    `}
                  >
                    {isSelected && <Check className="inline w-4 h-4 mr-1.5" />}
                    {option.label}
                  </button>
                );
              })}
            </div>
            {field.helpText && (
              <p className="text-sm text-muted-foreground mt-2">{field.helpText}</p>
            )}
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
        );

      case "city_picker":
        const selectedCity = Array.isArray(value) ? value[0] : value || "";
        const city = availableCities.find((c: { name: string }) => c.name === selectedCity);
        const availableDistricts = city?.neighborhoods || [];
        const hasDirections = availableDistricts.some((d: { direction?: string }) => d.direction);
        
        // Reset direction when city changes
        const currentCity = availableCities.find((c: { name: string }) => c.name === selectedCity);
        const currentDistricts = currentCity?.neighborhoods || [];
        const currentHasDirections = currentDistricts.some((d: { direction?: string }) => d.direction);
        
        const filteredDistricts = useMemo(() => {
          let districts = availableDistricts;
          if (selectedDirection !== "all" && hasDirections) {
            districts = districts.filter((d: { direction?: string }) => d.direction === selectedDirection);
          }
          return districts;
        }, [availableDistricts, selectedDirection, hasDirections]);

        return (
          <div key={field.id} className="mb-4">
            <label className="block text-xs font-bold mb-2 text-gray-700">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </label>
            <div className="relative mb-2">
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Select
                value={selectedCity}
                onValueChange={(val) => {
                  onChange(field.name, [val]);
                  onChange("districts", []);
                  setSelectedDirection("all");
                }}
              >
                <SelectTrigger className="h-10 pr-8">
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((c: { name: string }) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hasDirections && city && (
              <div className="flex flex-wrap gap-1.5 justify-center mb-2">
                <button
                  onClick={() => setSelectedDirection("all")}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                    selectedDirection === "all" ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  الكل
                </button>
                {(["north", "south", "east", "west", "center"] as Direction[]).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => setSelectedDirection(dir)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                      selectedDirection === dir ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {directionLabels[dir]}
                  </button>
                ))}
              </div>
            )}
            {city && (
              <div className="h-[160px] overflow-y-auto pr-1 custom-scrollbar border rounded-lg p-2 bg-muted/5">
                <div className="grid grid-cols-3 gap-2">
                  {filteredDistricts.map((district: { name: string }) => {
                    const districts = Array.isArray(values.districts) ? values.districts : [];
                    const isSelected = districts.includes(district.name);
                    return (
                      <button
                        key={district.name}
                        onClick={() => {
                          const current = Array.isArray(values.districts) ? values.districts : [];
                          const newValue = isSelected
                            ? current.filter((d) => d !== district.name)
                            : [...current, district.name];
                          onChange("districts", newValue);
                        }}
                        className={`py-2.5 px-1 rounded border text-[10px] font-bold ${
                          isSelected ? "bg-primary text-white" : "bg-white hover:bg-muted border-border"
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 inline mr-1" />}
                        <span className="truncate">{district.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {field.helpText && (
              <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
            )}
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        );

      case "range":
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-xs font-bold mb-2 text-gray-700">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </label>
            <Slider
              value={[value || 0]}
              onValueChange={([val]) => onChange(field.name, val)}
              max={10000000}
              step={10000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0</span>
              <span className="font-bold">{value?.toLocaleString() || 0} ريال</span>
              <span>10,000,000</span>
            </div>
            {field.helpText && (
              <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
            )}
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="mb-4">
            <Input
              type="date"
              value={value}
              onChange={(e) => onChange(field.name, e.target.value)}
              className={`h-10 text-center rounded-lg ${error ? "border-destructive" : ""}`}
            />
            {field.helpText && (
              <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
            )}
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        );

      case "district_picker":
        // District picker depends on city selection
        const selectedCityForDistricts = Array.isArray(values.cities) ? values.cities[0] : values.cities || "";
        const cityForDistricts = availableCities.find((c: { name: string }) => c.name === selectedCityForDistricts);
        const availableDistrictsForPicker = cityForDistricts?.neighborhoods || [];
        const hasDirectionsForDistricts = availableDistrictsForPicker.some((d: { direction?: string }) => d.direction);
        
        const filteredDistrictsForPicker = useMemo(() => {
          let districts = availableDistrictsForPicker;
          if (selectedDirection !== "all" && hasDirectionsForDistricts) {
            districts = districts.filter((d: { direction?: string }) => d.direction === selectedDirection);
          }
          return districts;
        }, [availableDistrictsForPicker, selectedDirection, hasDirectionsForDistricts]);

        if (!selectedCityForDistricts) {
          return (
            <div key={field.id} className="mb-4">
              <Label className="block text-xs font-bold mb-2 text-gray-700">
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </Label>
              <p className="text-xs text-muted-foreground">يرجى اختيار المدينة أولاً</p>
            </div>
          );
        }

        return (
          <div key={field.id} className="mb-4">
            <Label className="block text-xs font-bold mb-2 text-gray-700">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            {hasDirectionsForDistricts && (
              <div className="flex flex-wrap gap-1.5 justify-center mb-2">
                <button
                  onClick={() => setSelectedDirection("all")}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                    selectedDirection === "all" ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  الكل
                </button>
                {(["north", "south", "east", "west", "center"] as Direction[]).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => setSelectedDirection(dir)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                      selectedDirection === dir ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {directionLabels[dir]}
                  </button>
                ))}
              </div>
            )}
            <div className="h-[160px] overflow-y-auto pr-1 custom-scrollbar border rounded-lg p-2 bg-muted/5">
              <div className="grid grid-cols-3 gap-2">
                {filteredDistrictsForPicker.map((district: { name: string }) => {
                  const districts = Array.isArray(value) ? value : [];
                  const isSelected = districts.includes(district.name);
                  return (
                    <button
                      key={district.name}
                      onClick={() => {
                        const current = Array.isArray(value) ? value : [];
                        const newValue = isSelected
                          ? current.filter((d) => d !== district.name)
                          : [...current, district.name];
                        onChange(field.name, newValue);
                      }}
                      className={`py-2.5 px-1 rounded border text-[10px] font-bold ${
                        isSelected ? "bg-primary text-white" : "bg-white hover:bg-muted border-border"
                      }`}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5 inline mr-1" />}
                      <span className="truncate">{district.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {field.helpText && (
              <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
            )}
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        );

      case "property_type_picker":
        // Filter property types based on propertyCategory
        const propertyCategory = values.propertyCategory || "";
        const filteredPropertyTypes = filterPropertyTypeOptions(options, propertyCategory);
        
        return (
          <div key={field.id} className="mb-4">
            <Label className="block text-xs font-bold mb-2 text-gray-700">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            {!propertyCategory && (
              <p className="text-xs text-muted-foreground mb-2">يرجى اختيار نوع العقار (سكني/تجاري) أولاً</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredPropertyTypes.map((option) => {
                const isSelected = value === option.value;
                return (
                  <button
                    key={option.id}
                    onClick={() => onChange(field.name, option.value)}
                    className={`p-3 rounded-lg border text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {field.helpText && (
              <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
            )}
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        );

      case "smart_tags_picker":
        // Smart tags filtered by propertyType
        const propertyType = values.propertyType || "";
        const availableTags = options; // Can be filtered based on propertyType if needed
        
        return (
          <div key={field.id} className="mb-4">
            <Label className="block text-xs font-bold mb-2 text-gray-700">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((option) => {
                const selectedTags = Array.isArray(value) ? value : [];
                const isSelected = selectedTags.includes(option.value);
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      const current = Array.isArray(value) ? value : [];
                      const newValue = isSelected
                        ? current.filter((t) => t !== option.value)
                        : [...current, option.value];
                      onChange(field.name, newValue);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 border"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 inline mr-1" />}
                    {option.label}
                  </button>
                );
              })}
            </div>
            {field.helpText && (
              <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
            )}
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        );

      case "location_map":
        // Location map picker - simplified version (can be enhanced with actual map component)
        return (
          <div key={field.id} className="mb-4">
            <Label className="block text-xs font-bold mb-2 text-gray-700">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">خط العرض</Label>
                  <Input
                    type="number"
                    step="any"
                    value={value?.latitude || ""}
                    onChange={(e) => onChange(field.name, { ...value, latitude: parseFloat(e.target.value) || null })}
                    placeholder="24.7136"
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">خط الطول</Label>
                  <Input
                    type="number"
                    step="any"
                    value={value?.longitude || ""}
                    onChange={(e) => onChange(field.name, { ...value, longitude: parseFloat(e.target.value) || null })}
                    placeholder="46.6753"
                    className="h-9"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                يمكن إضافة خريطة تفاعلية هنا لاحقاً
              </p>
            </div>
            {field.helpText && (
              <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
            )}
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  // Card colors for each step (matching the real form)
  const stepColors = [
    { bg: "bg-emerald-500", light: "bg-emerald-100" },
    { bg: "bg-amber-500", light: "bg-amber-100" },
    { bg: "bg-blue-500", light: "bg-blue-100" },
    { bg: "bg-teal-500", light: "bg-teal-100" },
    { bg: "bg-purple-500", light: "bg-purple-100" },
    { bg: "bg-orange-500", light: "bg-orange-100" },
    { bg: "bg-indigo-500", light: "bg-indigo-100" },
    { bg: "bg-pink-500", light: "bg-pink-100" },
  ];

  // Filter fields based on conditional logic before rendering
  const getVisibleFields = (fields: Array<{ field: FormField; options: FieldOption[] }>) => {
    return fields.filter(({ field }) => shouldShowField(field));
  };

  // Helper to filter propertyType options based on propertyCategory
  const filterPropertyTypeOptions = (options: FieldOption[], propertyCategory: string | undefined): FieldOption[] => {
    if (!propertyCategory) return options;
    
    const residentialTypes = ["apartment", "villa", "floor", "townhouse", "residential_building", "residential_land", "rest_house", "chalet", "room"];
    const commercialTypes = ["commercial_building", "tower", "complex", "commercial_land", "industrial_land", "farm", "warehouse", "factory", "school", "health_center", "gas_station", "showroom", "office"];
    
    if (propertyCategory === "commercial") {
      return options.filter(opt => commercialTypes.includes(opt.value));
    } else if (propertyCategory === "residential") {
      return options.filter(opt => residentialTypes.includes(opt.value));
    }
    
    return options;
  };

  // If renderFieldsOnly is true, render only fields without card/header
  if (renderFieldsOnly) {
    return (
      <div className="space-y-5">
        {formConfig.steps.map(({ step, fields }) => {
          const visibleFields = getVisibleFields(fields);
          // Special handling for propertyType - filter options based on propertyCategory
          const fieldsWithFilteredOptions = visibleFields.map(({ field, options }) => {
            if (field.name === "propertyType") {
              const filteredOptions = filterPropertyTypeOptions(options, values.propertyCategory);
              return { field, options: filteredOptions };
            }
            return { field, options };
          });
          
          return (
            <div key={step.id}>
              {fieldsWithFilteredOptions.map(({ field, options }) => renderField(field, options))}
            </div>
          );
        })}
      </div>
    );
  }

  // Default behavior: render full cards with headers
  return (
    <div className="space-y-6">
      {formConfig.steps.map(({ step, fields }, index) => {
        const color = stepColors[index % stepColors.length];
        return (
          <div key={step.id} className="bg-white border shadow-lg rounded-xl overflow-hidden">
            {/* Card Header - matching real form */}
            <div className="flex items-center justify-between p-6 border-b bg-muted/10">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${color.light} flex items-center justify-center`}>
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">الخطوة {index + 1} من {formConfig.steps.length}</p>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6">
              <div className="space-y-5">
                {(() => {
                  const visibleFields = getVisibleFields(fields);
                  // Special handling for propertyType - filter options based on propertyCategory
                  const fieldsWithFilteredOptions = visibleFields.map(({ field, options }) => {
                    if (field.name === "propertyType") {
                      const filteredOptions = filterPropertyTypeOptions(options, values.propertyCategory);
                      return { field, options: filteredOptions };
                    }
                    return { field, options };
                  });
                  
                  return fieldsWithFilteredOptions.map(({ field, options }) => renderField(field, options));
                })()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

