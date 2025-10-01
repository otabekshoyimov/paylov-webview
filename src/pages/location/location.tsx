import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { redirect, useFetcher } from "react-router";
import { BackButton } from "../../shared/components/back-button";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

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
  return redirect(`/shop`);
}

export function LocationPage() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const fetcher = useFetcher();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        setPosition([41.2995, 69.2401]);
      },
    );
  }, []);

  return (
    <>
      <div className="flex h-screen w-full flex-col">
        <div className="p-16">
          <BackButton link={"/"} />
        </div>
        <div className="flex-1">
          {position && (
            <MapContainer
              center={position}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker position={position} />
              <LocationPicker
                onSelect={(lat, lng) => {
                  setPosition([lat, lng]);
                  localStorage.setItem(
                    "userLocation",
                    JSON.stringify({ lat, lng }),
                  );
                }}
              />
            </MapContainer>
          )}
        </div>

        <div className="flex justify-center p-16">
          <fetcher.Form method="POST" className="w-full">
            <input
              type="hidden"
              name="location"
              value={JSON.stringify(position)}
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-brand-green/10 px-16 py-4 font-medium text-white shadow outline outline-[0.9px] outline-brand-green"
            >
              Manzilni yuborish
            </button>
          </fetcher.Form>
        </div>
      </div>
    </>
  );
}
