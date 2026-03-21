"use client";

import { useRef, useCallback } from "react";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";

const libraries: ("places")[] = ["places"];

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string, lat: number | null, lng: number | null) => void;
  required?: boolean;
  placeholder?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  required,
  placeholder = "Search for a location...",
}: LocationAutocompleteProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries,
  });

  const onLoad = useCallback(
    (autocomplete: google.maps.places.Autocomplete) => {
      autocompleteRef.current = autocomplete;
    },
    []
  );

  const onPlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address ?? place.name ?? "";
      onChange(address, lat, lng);

      if (inputRef.current) {
        inputRef.current.value = address;
      }
    }
  }, [onChange]);

  if (!isLoaded) {
    return (
      <div className="relative">
        <Input
          placeholder="Loading maps..."
          disabled
          className="h-11 pr-10"
        />
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          defaultValue={value}
          onChange={(e) => onChange(e.target.value, null, null)}
          required={required}
          className="h-11 pr-10"
        />
        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
      </div>
    </Autocomplete>
  );
}
