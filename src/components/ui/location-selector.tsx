import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { SAUDI_REGIONS, getCitiesByRegion } from "@/lib/saudi-regions.ts";
import { MapPin } from "lucide-react";

interface LocationSelectorProps {
  region: string;
  city: string;
  onRegionChange: (region: string) => void;
  onCityChange: (city: string) => void;
  required?: boolean;
}

export default function LocationSelector({
  region,
  city,
  onRegionChange,
  onCityChange,
  required = false,
}: LocationSelectorProps) {
  const cities = region ? getCitiesByRegion(region) : [];

  const handleRegionChange = (value: string) => {
    onRegionChange(value === "none" ? "" : value);
    onCityChange(""); // Reset city when region changes
  };

  const handleCityChange = (value: string) => {
    onCityChange(value === "none" ? "" : value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Region */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          المنطقة{required && <span className="text-destructive">*</span>}
        </label>
        <Select value={region || "none"} onValueChange={handleRegionChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="اختر المنطقة..." />
          </SelectTrigger>
          <SelectContent>
            {!required && <SelectItem value="none">كل المناطق</SelectItem>}
            {SAUDI_REGIONS.map((r) => (
              <SelectItem key={r.name} value={r.name}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          المدينة{required && <span className="text-destructive">*</span>}
        </label>
        <Select
          value={city || "none"}
          onValueChange={handleCityChange}
          disabled={cities.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={cities.length === 0 ? "اختر المنطقة أولاً" : "اختر المدينة..."} />
          </SelectTrigger>
          <SelectContent>
            {!required && <SelectItem value="none">كل المدن</SelectItem>}
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
