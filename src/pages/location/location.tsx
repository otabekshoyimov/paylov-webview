import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
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

const googleMarker = new L.Icon({
  iconUrl:
    "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png",
  shadowUrl: markerShadow,
  iconSize: [27, 43],
  iconAnchor: [13, 43],
  popupAnchor: [0, -40],
});

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
  return redirect("/shop");
}

export function LocationPage() {
  const [position, setPosition] = useState<[number, number] | null>(null);

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
      <div className="flex min-h-[100vh] w-full flex-col pb-16">
        <div className="p-16">
          <BackButton link={"/"} />
        </div>
        <div className="" style={{ height: "calc(100vh - 160px)" }}>
          {position && (
            <MapContainer
              center={position}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <Marker position={position} icon={googleMarker} />
              <LocationPicker
                onSelect={(lat, lng) => {
                  setPosition([lat, lng]);
                  localStorage.setItem(
                    "userLocation",
                    JSON.stringify({ lat, lng }),
                  );
                }}
              />
              <LocateButton
                onLocate={(lat, lng) => {
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
          <Form method="POST" className="w-full" viewTransition>
            <input
              type="hidden"
              name="location"
              value={JSON.stringify(position)}
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
        alert("Could not get your location");
      },
    );
  };

  return (
    <button
      onClick={handleClick}
      className="absolute bottom-24 right-24 z-[1000] rounded-full bg-white p-10 shadow-md transition hover:scale-105"
      style={{ border: "1px solid rgba(0,0,0,0.1)" }}
    >
      📍
    </button>
  );
}
