"use client";

import { useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";
import Image from "next/image";
import {
  Calendar,
  Clock,
  ExternalLink,
  UtensilsCrossed,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/types";

interface EventMapProps {
  events: Event[];
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "500px",
  borderRadius: "0.75rem",
};

const center = { lat: 51.5074, lng: -0.1278 };

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

function createMarkerIcon(event: Event): string {
  const color = event.hasFreeFood ? "%23f59e0b" : "%237c3aed";
  const label = event.price === "Free" ? "F" : "$";
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
      <path d="M20 0C9 0 0 9 0 20c0 15 20 30 20 30s20-15 20-30C40 9 31 0 20 0z" fill="${color.replace(/%23/g, '#')}" stroke="white" stroke-width="2.5"/>
      <text x="20" y="24" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="sans-serif">${label}</text>
    </svg>
  `)}`;
}

export function EventMap({ events }: EventMapProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const openInGoogleMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`;
    window.open(url, "_blank");
  };

  if (loadError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted rounded-xl">
        <div className="text-destructive text-center p-6">
          <p className="font-medium">Failed to load Google Maps</p>
          <p className="text-sm text-muted-foreground mt-1">
            Check that your API key is set in <code>.env.local</code>
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted rounded-xl min-h-[500px]">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={13}
      options={mapOptions}
      onLoad={onLoad}
      onClick={() => setSelectedEvent(null)}
    >
      {events.map((event) => (
        <MarkerF
          key={event.id}
          position={{
            lat: event.coordinates.lat,
            lng: event.coordinates.lng,
          }}
          icon={{
            url: createMarkerIcon(event),
            scaledSize: new google.maps.Size(40, 50),
            anchor: new google.maps.Point(20, 50),
          }}
          onClick={() => setSelectedEvent(event)}
        />
      ))}

      {selectedEvent && (
        <InfoWindowF
          position={{
            lat: selectedEvent.coordinates.lat,
            lng: selectedEvent.coordinates.lng,
          }}
          options={{ pixelOffset: new google.maps.Size(0, -50), maxWidth: 320 }}
          onCloseClick={() => setSelectedEvent(null)}
        >
          <div className="p-1" style={{ minWidth: 250 }}>
            {/* Society Info */}
            <div className="flex items-center gap-2 mb-2">
              <Image
                src={selectedEvent.society.logo}
                alt={selectedEvent.society.name}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm font-medium text-muted-foreground">
                {selectedEvent.society.name}
              </span>
            </div>

            {/* Event Title */}
            <h3 className="font-semibold text-foreground mb-2 text-base">
              {selectedEvent.title}
            </h3>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge
                className={
                  selectedEvent.price === "Free"
                    ? "bg-emerald-500 text-white text-xs"
                    : "bg-accent text-accent-foreground text-xs"
                }
              >
                {selectedEvent.price === "Free"
                  ? "Free"
                  : `$${selectedEvent.price}`}
              </Badge>
              {selectedEvent.hasFreeFood && (
                <Badge className="bg-amber-500 text-white text-xs">
                  <UtensilsCrossed className="h-3 w-3 mr-1" />
                  Free Food
                </Badge>
              )}
            </div>

            {/* Details */}
            <div className="space-y-1 mb-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(selectedEvent.date)}</span>
                <Clock className="h-3.5 w-3.5 ml-1" />
                <span>{selectedEvent.time}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button size="sm" asChild className="flex-1 text-xs h-8">
                <a
                  href={selectedEvent.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Details
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8"
                onClick={() =>
                  openInGoogleMaps(
                    selectedEvent.coordinates.lat,
                    selectedEvent.coordinates.lng,
                    selectedEvent.location
                  )
                }
              >
                <Navigation className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}
