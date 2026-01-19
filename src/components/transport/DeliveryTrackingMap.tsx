import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconMapPin } from "@tabler/icons-react";

// Fix for default marker icons in Leaflet with Vite
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom truck icon
const createTruckIcon = (color: string = "#f97316") => {
  return L.divIcon({
    className: "custom-truck-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 16px;
          font-weight: bold;
        ">🚚</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

// Custom pickup icon
const createPickupIcon = () => {
  return L.divIcon({
    className: "custom-pickup-marker",
    html: `
      <div style="
        background-color: #22c55e;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="color: white; font-size: 14px;">📦</div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Custom delivery icon
const createDeliveryIcon = () => {
  return L.divIcon({
    className: "custom-delivery-marker",
    html: `
      <div style="
        background-color: #3b82f6;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="color: white; font-size: 14px;">✓</div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

interface MapBoundsProps {
  pickup: LatLngExpression;
  delivery: LatLngExpression;
  currentLocation?: LatLngExpression;
}

function MapBounds({ pickup, delivery, currentLocation }: MapBoundsProps) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([pickup as L.LatLngExpression, delivery as L.LatLngExpression]);
    if (currentLocation) {
      bounds.extend(currentLocation as L.LatLngExpression);
    }
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, pickup, delivery, currentLocation]);

  return null;
}

export interface DeliveryTrackingMapProps {
  pickupLocation: {
    name: string;
    coordinates: [number, number]; // [lat, lng]
  };
  deliveryLocation: {
    name: string;
    coordinates: [number, number]; // [lat, lng]
  };
  currentLocation?: {
    name?: string;
    coordinates: [number, number]; // [lat, lng]
  };
  status?: "pickup" | "in_transit" | "delivered";
  distance?: number;
  eta?: string;
  className?: string;
}

export function DeliveryTrackingMap({
  pickupLocation,
  deliveryLocation,
  currentLocation,
  status = "in_transit",
  distance,
  eta,
  className = "",
}: DeliveryTrackingMapProps) {
  // Default coordinates for Machakos County, Kenya (if coordinates not provided)
  const defaultCenter: [number, number] = [-1.5167, 37.2667]; // Machakos town

  // Use provided coordinates or defaults
  const pickupCoords: LatLngExpression = pickupLocation.coordinates || defaultCenter;
  const deliveryCoords: LatLngExpression = deliveryLocation.coordinates || defaultCenter;
  const currentCoords: LatLngExpression | undefined = currentLocation?.coordinates;

  // Create route polyline
  const routeCoordinates: LatLngExpression[] = [pickupCoords];
  if (currentCoords) {
    routeCoordinates.push(currentCoords);
  }
  routeCoordinates.push(deliveryCoords);

  const getStatusColor = () => {
    switch (status) {
      case "pickup":
        return "#eab308"; // yellow
      case "in_transit":
        return "#f97316"; // orange
      case "delivered":
        return "#22c55e"; // green
      default:
        return "#f97316";
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Delivery Route</CardTitle>
            <CardDescription>Track your delivery on the map</CardDescription>
          </div>
          {(distance || eta) && (
            <div className="flex gap-2">
              {distance && (
                <Badge variant="outline" className="text-xs">
                  <IconMapPin className="h-3 w-3 mr-1" />
                  {distance} km
                </Badge>
              )}
              {eta && (
                <Badge variant="outline" className="text-xs">
                  ⏱️ {eta}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full h-[400px] sm:h-[500px] relative rounded-lg overflow-hidden border border-border">
          <MapContainer
            {...({
              center: currentCoords || pickupCoords,
              zoom: 11,
              style: { height: "100%", width: "100%", zIndex: 0 },
              scrollWheelZoom: true,
              className: "z-0",
            } as any)}
          >
            <TileLayer
              {...({
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
              } as any)}
            />
            <MapBounds
              pickup={pickupCoords}
              delivery={deliveryCoords}
              currentLocation={currentCoords}
            />

            {/* Pickup Location Marker */}
            <Marker
              {...({
                position: pickupCoords,
                icon: createPickupIcon(),
              } as any)}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold mb-1">📍 Pickup Location</div>
                  <div>{pickupLocation.name}</div>
                </div>
              </Popup>
            </Marker>

            {/* Current Location Marker (if in transit) */}
            {currentCoords && status === "in_transit" && (
              <Marker
                {...({
                  position: currentCoords,
                  icon: createTruckIcon(getStatusColor()),
                } as any)}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">🚚 Current Location</div>
                    <div>{currentLocation?.name || "In Transit"}</div>
                    {distance && <div className="text-xs text-muted-foreground mt-1">{distance} km remaining</div>}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Delivery Location Marker */}
            <Marker
              {...({
                position: deliveryCoords,
                icon: createDeliveryIcon(),
              } as any)}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold mb-1">✓ Delivery Location</div>
                  <div>{deliveryLocation.name}</div>
                  {status === "delivered" && (
                    <div className="text-xs text-green-600 mt-1 font-medium">Delivered</div>
                  )}
                </div>
              </Popup>
            </Marker>

            {/* Route Polyline */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: getStatusColor(),
                weight: 4,
                opacity: 0.7,
                dashArray: status === "in_transit" ? "10, 10" : undefined,
              }}
            />
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
              <span>Pickup</span>
            </div>
            {status === "in_transit" && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm"></div>
                <span>Current Location</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
              <span>Delivery</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-8 h-0.5 bg-orange-500"></div>
              <span>Route</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
