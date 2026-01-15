import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

interface GeographicMapProps {
  title?: string;
  description?: string;
  height?: number;
  activeCoverage?: number;
  targetCoverage?: number;
  regions?: Array<{
    name: string;
    lat: number;
    lng: number;
    isActive: boolean;
    value?: number;
  }>;
}

// Component to set map view
function SetMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

export function GeographicMap({
  title,
  description,
  height = 300,
  activeCoverage = 65,
  targetCoverage = 35,
  regions,
}: GeographicMapProps) {
  // Default center for Machakos County, Kenya
  const defaultCenter: [number, number] = [-1.5167, 37.2667];
  const defaultZoom = 9;

  // Default regions if none provided (Machakos County sub-counties)
  const defaultRegions = regions || [
    { name: "Kangundo", lat: -1.3, lng: 37.35, isActive: true, value: 45 },
    { name: "Kathiani", lat: -1.5, lng: 37.3, isActive: true, value: 38 },
    { name: "Matungulu", lat: -1.4, lng: 37.25, isActive: true, value: 42 },
    { name: "Yatta", lat: -1.6, lng: 37.2, isActive: false, value: 25 },
    { name: "Masinga", lat: -1.4, lng: 37.4, isActive: false, value: 20 },
  ];

  const MapContainerComponent = MapContainer as any;
  const TileLayerComponent = TileLayer as any;
  const CircleMarkerComponent = CircleMarker as any;

  const map = (
    <div style={{ height: `${height}px`, width: "100%" }} className="rounded-lg overflow-hidden">
      <MapContainerComponent
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayerComponent
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <SetMapView center={defaultCenter} zoom={defaultZoom} />
        {defaultRegions.map((region, index) => (
          <CircleMarkerComponent
            key={index}
            center={[region.lat, region.lng]}
            radius={region.isActive ? 12 : 8}
            pathOptions={{
              color: region.isActive ? "#3B82F6" : "#94A3B8",
              fillColor: region.isActive ? "#3B82F6" : "#E5E7EB",
              fillOpacity: region.isActive ? 0.6 : 0.4,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{region.name}</p>
                <p className="text-muted-foreground">
                  Status: {region.isActive ? "Active" : "Target"}
                </p>
                {region.value !== undefined && (
                  <p className="text-muted-foreground">Coverage: {region.value}%</p>
                )}
              </div>
            </Popup>
          </CircleMarkerComponent>
        ))}
      </MapContainerComponent>
    </div>
  );

  const legend = (
    <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow"></div>
        <span className="text-sm text-muted-foreground">Active ({activeCoverage}%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-muted border-2 border-gray-400 rounded-full"></div>
        <span className="text-sm text-muted-foreground">Target ({targetCoverage}%)</span>
      </div>
    </div>
  );

  if (title) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {map}
          {legend}
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {map}
      {legend}
    </div>
  );
}

