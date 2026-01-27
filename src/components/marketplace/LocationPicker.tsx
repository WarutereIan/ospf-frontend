import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { Card, CardContent } from "@/components/ui/card";
import { IconMapPin, IconCheck, IconX, IconSearch, IconLoader2 } from "@tabler/icons-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  address: string;
  coordinates?: string; // "lat,lng" format
  onAddressChange: (address: string) => void;
  onCoordinatesChange: (coordinates: string | undefined) => void;
  label?: string;
  required?: boolean;
}

// Component to handle map clicks
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

export function LocationPicker({
  address,
  coordinates,
  onAddressChange,
  onCoordinatesChange,
  label = "Delivery Address",
  required = false,
}: LocationPickerProps) {
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Parse coordinates from string format "lat,lng"
  useEffect(() => {
    if (coordinates) {
      const [lat, lng] = coordinates.split(",").map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setSelectedCoords([lat, lng]);
      }
    } else {
      setSelectedCoords(null);
    }
  }, [coordinates]);

  // Default center for Machakos County, Kenya
  const defaultCenter: [number, number] = [-1.5167, 37.2667];
  const mapCenter = selectedCoords || defaultCenter;

  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'OSP-Marketplace-App',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.display_name || null;
      }
      return null;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoords([lat, lng]);
    // Address will be populated when user confirms location via handleConfirmLocation
  };

  const handleUseCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedCoords([latitude, longitude]);
          // Reverse geocode to get address immediately
          const address = await reverseGeocode(latitude, longitude);
          if (address) {
            onAddressChange(address);
          } else {
            // Fallback: use coordinates as address
            onAddressChange(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your current location. Please select a location on the map.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser. Please select a location on the map.");
    }
  };

  const handleConfirmLocation = async () => {
    if (selectedCoords) {
      onCoordinatesChange(`${selectedCoords[0]},${selectedCoords[1]}`);
      // Always reverse geocode to get/update address when confirming location
      const geocodedAddress = await reverseGeocode(selectedCoords[0], selectedCoords[1]);
      if (geocodedAddress) {
        onAddressChange(geocodedAddress);
      } else if (!address || address.trim() === "") {
        // Fallback: use coordinates as address if reverse geocoding fails
        onAddressChange(`${selectedCoords[0].toFixed(6)}, ${selectedCoords[1].toFixed(6)}`);
      }
      setMapOpen(false);
    }
  };

  const handleClearLocation = () => {
    setSelectedCoords(null);
    onCoordinatesChange(undefined);
  };


  const handleSelectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setSelectedCoords([lat, lng]);
      // Always update the address field with the display name from search result
      onAddressChange(result.display_name);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  // Debounce search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Use Nominatim (OpenStreetMap) geocoding API
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=ke&bounded=1&viewbox=36.5,-2.0,38.0,-1.0&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'OSP-Marketplace-App', // Required by Nominatim
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        } else {
          console.error("Geocoding error:", response.statusText);
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error searching location:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const MapContainerComponent = MapContainer as any;
  const TileLayerComponent = TileLayer as any;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {label} {required && "*"}
        </Label>
        <div className="flex items-center gap-2">
          {coordinates && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearLocation}
              className="text-xs h-7"
            >
              <IconX className="h-3 w-3 mr-1" />
              Clear Location
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMapOpen(true)}
            className="text-xs h-7"
          >
            <IconMapPin className="h-3 w-3 mr-1" />
            {coordinates ? "Update Location" : "Capture Location"}
          </Button>
        </div>
      </div>
      <Input
        placeholder="Enter delivery address"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        required={required}
      />
      {coordinates && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <IconMapPin className="h-3 w-3" />
          Location captured: {coordinates}
        </div>
      )}

      {/* Map Dialog */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Delivery Location</DialogTitle>
            <DialogDescription>
              Click on the map to set the delivery location, or use your current location
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Location Search */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Search Location</Label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for a location (e.g., Nairobi, Machakos Town, etc.)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {isSearching && (
                  <IconLoader2 className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
                )}
              </div>
              {searchResults.length > 0 && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      type="button"
                      onClick={() => handleSelectSearchResult(result)}
                      className="w-full text-left px-3 py-2 hover:bg-muted transition-colors border-b last:border-b-0"
                    >
                      <div className="text-sm font-medium">{result.display_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {parseFloat(result.lat).toFixed(6)}, {parseFloat(result.lon).toFixed(6)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleUseCurrentLocation}
                className="flex-1"
              >
                <IconMapPin className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>
              {selectedCoords && (
                <Button
                  type="button"
                  onClick={handleConfirmLocation}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <IconCheck className="h-4 w-4 mr-2" />
                  Confirm Location
                </Button>
              )}
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="w-full h-[400px] relative rounded-lg overflow-hidden border border-border">
                  <MapContainerComponent
                    center={mapCenter}
                    zoom={13}
                    style={{ height: "100%", width: "100%", zIndex: 0 }}
                    scrollWheelZoom={true}
                    className="z-0"
                  >
                    <TileLayerComponent
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onLocationSelect={handleMapClick} />
                    {selectedCoords && (
                      <Marker
                        {...({
                          position: selectedCoords,
                        } as any)}
                      >
                        <Popup>
                          <div className="text-sm">
                            <div className="font-semibold">Selected Location</div>
                            <div>Lat: {selectedCoords[0].toFixed(6)}</div>
                            <div>Lng: {selectedCoords[1].toFixed(6)}</div>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainerComponent>
                </div>
              </CardContent>
            </Card>
            {selectedCoords && (
              <div className="text-sm text-muted-foreground">
                Selected coordinates: {selectedCoords[0].toFixed(6)}, {selectedCoords[1].toFixed(6)}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
