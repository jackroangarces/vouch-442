import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { DUMMY_RESTAURANTS } from "../../data/dummyRestaurants";

type SortMode = "none" | "nearest" | "farthest";

interface HomeRestaurant {
  id: string;
  restaurantName: string;
  description: string;
  address: string;
  cuisine: string;
  lat: number;
  lng: number;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Number.NaN;
}

function readCoordinate(data: Record<string, unknown>, kind: "lat" | "lng"): number {
  const direct = readNumber(data[kind]);
  if (Number.isFinite(direct)) return direct;

  const location = data.location;
  if (location && typeof location === "object") {
    const loc = location as Record<string, unknown>;
    const candidateValues =
      kind === "lat" ? [loc.lat, loc.latitude] : [loc.lng, loc.longitude, loc.lon];

    for (const candidate of candidateValues) {
      const n = readNumber(candidate);
      if (Number.isFinite(n)) return n;
    }
  }

  return Number.NaN;
}

function mapRestaurantDoc(id: string, rawData: Record<string, unknown>): HomeRestaurant | null {
  const restaurantName = readString(rawData.restaurantName) || readString(rawData.name);
  if (!restaurantName) return null;

  return {
    id,
    restaurantName,
    description: readString(rawData.description),
    address: readString(rawData.address),
    cuisine: readString(rawData.cuisine),
    lat: readCoordinate(rawData, "lat"),
    lng: readCoordinate(rawData, "lng"),
  };
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  if (
    !Number.isFinite(aLat) ||
    !Number.isFinite(aLng) ||
    !Number.isFinite(bLat) ||
    !Number.isFinite(bLng)
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const earthRadiusKm = 6371;
  const toRad = Math.PI / 180;
  const dLat = (bLat - aLat) * toRad;
  const dLng = (bLng - aLng) * toRad;

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const a =
    sinLat * sinLat +
    Math.cos(aLat * toRad) * Math.cos(bLat * toRad) * sinLng * sinLng;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Home() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState<HomeRestaurant[]>(DUMMY_RESTAURANTS);
  const [searchText, setSearchText] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("none");
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRestaurants() {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "restaurants"));
        const byId = new Map<string, HomeRestaurant>(
          DUMMY_RESTAURANTS.map((restaurant) => [restaurant.id, restaurant]),
        );

        snapshot.forEach((restaurantDoc) => {
          const mapped = mapRestaurantDoc(
            restaurantDoc.id,
            restaurantDoc.data() as Record<string, unknown>,
          );
          if (mapped) byId.set(mapped.id, mapped);
        });

        if (!cancelled) setRestaurants(Array.from(byId.values()));
      } catch (error) {
        console.error("Failed to load restaurants. Showing dummy data only.", error);
        if (!cancelled) setRestaurants(DUMMY_RESTAURANTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRestaurants();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (sortMode === "none" || userLocation !== null) return;

    if (!("geolocation" in navigator)) {
      setLocationError("This browser does not support geolocation. Distance sorting is unavailable.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      },
      () => {
        setLocationError("Allow location access to sort by nearest or farthest.");
      },
      {
        maximumAge: 300000,
        timeout: 10000,
      },
    );
  }, [sortMode, userLocation]);

  const visibleRestaurants = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    const filtered = restaurants.filter((restaurant) => {
      if (!q) return true;

      const searchableText = [
        restaurant.restaurantName,
        restaurant.description,
        restaurant.address,
        restaurant.cuisine,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(q);
    });

    if (sortMode === "none" || userLocation === null) return filtered;

    return [...filtered].sort((a, b) => {
      const distA = haversineKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = haversineKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return sortMode === "nearest" ? distA - distB : distB - distA;
    });
  }, [restaurants, searchText, sortMode, userLocation]);

  return (
    <div className="main">
      <h1>Restaurants</h1>

      <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        <input
          type="text"
          value={searchText}
          placeholder="Search by name, cuisine, description, or address"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: "100%", padding: 10 }}
        />

        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          style={{ width: "100%", padding: 10 }}
        >
          <option value="none">Sort: None</option>
          <option value="nearest">Sort: Nearest first</option>
          <option value="farthest">Sort: Farthest first</option>
        </select>
      </div>

      {locationError && sortMode !== "none" && (
        <p className="auth-error" style={{ marginBottom: 12 }}>
          {locationError}
        </p>
      )}

      {loading && <p>Loading restaurants...</p>}
      {!loading && visibleRestaurants.length === 0 && <p>No relevant results found.</p>}

      {visibleRestaurants.map((restaurant) => {
        const distanceKm =
          userLocation === null
            ? null
            : haversineKm(userLocation.lat, userLocation.lng, restaurant.lat, restaurant.lng);

        const hasDistance = distanceKm !== null && Number.isFinite(distanceKm);

        return (
          <div
            key={restaurant.id}
            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(`/restaurant/${restaurant.id}`);
              }
            }}
            style={{
              padding: 15,
              border: "1px solid #ddd",
              borderRadius: 8,
              marginBottom: 12,
              cursor: "pointer",
            }}
          >
            <h2 style={{ marginTop: 0 }}>{restaurant.restaurantName}</h2>
            {restaurant.description && <p>{restaurant.description}</p>}
            {restaurant.cuisine && <p style={{ margin: "4px 0" }}>Cuisine: {restaurant.cuisine}</p>}
            {restaurant.address && (
              <p style={{ fontStyle: "italic", margin: "4px 0" }}>{restaurant.address}</p>
            )}
            {hasDistance && <p style={{ opacity: 0.8, marginBottom: 0 }}>{distanceKm.toFixed(2)} km away</p>}
          </div>
        );
      })}
    </div>
  );
}
