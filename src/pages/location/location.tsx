import L from "leaflet";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Form, redirect } from "react-router";
import { BackButton } from "../../shared/components/back-button";

const selectedLocationIcon = new L.Icon({
  iconUrl:
    "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png",
  shadowUrl: markerShadow,
  iconSize: [27, 43],
  iconAnchor: [13, 43],
  popupAnchor: [0, -40],
});

const userCurrentLocationIcon = L.divIcon({
  className: "pulsing-marker",
  html: `<div class="pulse"></div><div class="dot"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function LocationPicker({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e: any) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export async function LocationAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData.entries());
  console.log("formdata: ", rawData);
  const location = String(formData.get("location"));
  console.log("loc 🏟️", location);
  const url = new URL(request.url);
  const name = url.searchParams.get("name") ?? "";
  const phoneNumber = url.searchParams.get("phoneNumber") ?? "";
  console.log("name and phone:", name, phoneNumber);

  return redirect(
    `/shop?${new URLSearchParams({
      name: name,
      phoneNumber: phoneNumber,
      location: location,
    })}`,
  );
}

export function LocationPage() {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null,
  );
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number] | null
  >(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
        setSelectedPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        setUserPosition([41.2995, 69.2401]);
      },
    );
  }, []);

  return (
    <>
      <div className="flex h-[100svh] w-full flex-col">
        <div className="p-16">
          <BackButton link={"/"} />
        </div>
        <div className="" style={{ height: "calc(100svh - 160px)" }}>
          {userPosition && (
            <MapContainer
              center={userPosition}
              zoom={15}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              />

              <Marker position={userPosition} icon={userCurrentLocationIcon} />

              {selectedPosition && (
                <Marker
                  position={selectedPosition}
                  icon={selectedLocationIcon}
                />
              )}

              <LocationPicker
                onSelect={(lat, lng) => {
                  setSelectedPosition([lat, lng]);
                  localStorage.setItem(
                    "userLocation",
                    JSON.stringify({ lat, lng }),
                  );
                }}
              />
              <LocateButton
                onLocate={(lat, lng) => {
                  setUserPosition([lat, lng]);
                  setSelectedPosition([lat, lng]);
                  localStorage.setItem(
                    "userLocation",
                    JSON.stringify({ lat, lng }),
                  );
                }}
              />
            </MapContainer>
          )}
        </div>

        <div className="flex justify-center p-16 pt-[24px]">
          <Form method="POST" className="w-full" viewTransition>
            <input
              type="hidden"
              name="location"
              disabled={!selectedPosition}
              value={JSON.stringify(selectedPosition)}
            />
            <button
              type="submit"
              className="w-full rounded-md bg-white px-24 py-10 font-medium text-black"
            >
              Manzilni yuborish
            </button>
          </Form>
        </div>
      </div>
    </>
  );
}

function LocateButton({
  onLocate,
}: {
  onLocate: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  const handleClick = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        map.flyTo([lat, lng], 15, { duration: 1.5 });
        onLocate(lat, lng);
      },
      (err) => {
        console.error("Location access denied:", err);
      },
    );
  };

  return (
    <button
      onClick={handleClick}
      className="absolute bottom-24 right-24 z-[1000] rounded-full bg-white p-16 shadow-md transition hover:scale-105"
    >
      📍
    </button>
  );
}
