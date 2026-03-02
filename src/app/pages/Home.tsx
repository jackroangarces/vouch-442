import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import {
  DUMMY_RESTAURANTS,
  DUMMY_RESTAURANT_AGGREGATES,
} from "../../data/dummyRestaurants";
import PolarChart from "../../components/PolarChart";

type SortMode = "none" | "nearest" | "farthest";

interface HomeRestaurant {
  id: string;
  restaurantName: string;
  description: string;
  address: string;
  cuisine: string;
  lat: number;
  lng: number;
  vibe: number[] | null;
}

const EMPTY_VIBE_QUERY = [0, 0, 0, 0, 0, 0];
const VIBE_MATCH_MAX_DELTA = 1.25;

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

function readVibe(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length !== 6) return null;

  const out = value.map((axis) => {
    const n = readNumber(axis);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(5, n));
  });

  return out;
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
    vibe: readVibe(rawData.vibe),
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

function isVibeQueryActive(vibeQuery: number[]): boolean {
  return vibeQuery.some((axis) => axis > 0);
}

function isVibeMatch(vibeQuery: number[], vibeTarget: number[]): boolean {
  const activeAxes = vibeQuery
    .map((axis, idx) => ({ axis, idx }))
    .filter((entry) => entry.axis > 0)
    .map((entry) => entry.idx);

  if (activeAxes.length === 0) return true;

  let totalDelta = 0;
  for (const idx of activeAxes) {
    totalDelta += Math.abs(vibeQuery[idx] - vibeTarget[idx]);
  }

  const meanDelta = totalDelta / activeAxes.length;
  return meanDelta <= VIBE_MATCH_MAX_DELTA;
}

function buildFallbackRestaurants(): HomeRestaurant[] {
  return DUMMY_RESTAURANTS.map((restaurant) => ({
    ...restaurant,
    vibe: DUMMY_RESTAURANT_AGGREGATES[restaurant.id]?.vibe ?? null,
  }));
}

type Review = {
  id: string;
  userId?: string;
  rating?: number;
  text?: string;
  createdAt?: any;
  vibe?: number[];
};

export default function Home() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<HomeRestaurant[]>(buildFallbackRestaurants());
  // store the single most-recent review (or null) per restaurant for simpler access
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review | null>>({});
  const [searchText, setSearchText] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("none");
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [vibeQuery, setVibeQuery] = useState<number[]>(EMPTY_VIBE_QUERY);

  useEffect(() => {
    let cancelled = false;

    async function loadRestaurants() {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "restaurants"));
        const byId = new Map<string, HomeRestaurant>(
          buildFallbackRestaurants().map((restaurant) => [restaurant.id, restaurant]),
        );

        snapshot.forEach((restaurantDoc) => {
          const mapped = mapRestaurantDoc(
            restaurantDoc.id,
            restaurantDoc.data() as Record<string, unknown>,
          );
          if (!mapped) return;

          const existing = byId.get(mapped.id);
          byId.set(mapped.id, {
            ...mapped,
            vibe: mapped.vibe ?? existing?.vibe ?? null,
          });
        });

        if (!cancelled) setRestaurants(Array.from(byId.values()));
      } catch (error) {
        console.error("Failed to load restaurants. Showing dummy data only.", error);
        if (!cancelled) setRestaurants(buildFallbackRestaurants());
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

  const hasTextQuery = searchText.trim().length > 0;
  const hasVibeQuery = isVibeQueryActive(vibeQuery);
  const hasActiveQuery = hasTextQuery || hasVibeQuery;

  const visibleRestaurants = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    const filtered = restaurants.filter((restaurant) => {
      if (q) {
        const searchableText = [
          restaurant.restaurantName,
          restaurant.description,
          restaurant.address,
          restaurant.cuisine,
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(q)) return false;
      }

      if (hasVibeQuery) {
        if (!restaurant.vibe) return false;
        if (!isVibeMatch(vibeQuery, restaurant.vibe)) return false;
      }

      return true;
    });

    if (sortMode === "none" || userLocation === null) return filtered;

    return [...filtered].sort((a, b) => {
      const distA = haversineKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = haversineKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return sortMode === "nearest" ? distA - distB : distB - distA;
    });
  }, [restaurants, searchText, sortMode, userLocation, hasVibeQuery, vibeQuery]);

  return (
    <div className="main">
      <h1>Restaurants</h1>

      <div className="home-controls">
        <input
          type="text"
          value={searchText}
          placeholder="Search by name, cuisine, description, or address"
          onChange={(e) => setSearchText(e.target.value)}
          className="home-control-input"
        />

        <label htmlFor="sort-select" className="visually-hidden">
          Sort restaurants
        </label>

        <select
          id="sort-select"
          value={sortMode}
          onChange={function (e) {
            setSortMode(e.target.value);
          }}
          className="home-control-input"
        >
          <option value="none">Sort by…</option>
          <option value="nearest">Nearest first</option>
          <option value="farthest">Farthest first</option>
        </select>
      </div>

      <div className="home-vibe-filter">
        <div className="home-vibe-header">
          <h3>Vibe Filter</h3>
          <button
            type="button"
            onClick={() => setVibeQuery(EMPTY_VIBE_QUERY)}
            className="home-vibe-clear"
            disabled={!hasVibeQuery}
          >
            Clear vibe
          </button>
        </div>
        <PolarChart values={vibeQuery} onChange={setVibeQuery} onRelease={setVibeQuery} size={220} />
      </div>

      {locationError && sortMode !== "none" && (
        <p className="auth-error" style={{ marginBottom: 12 }}>
          {locationError}
        </p>
      )}

      {loading && <p>Loading restaurants...</p>}
      {!loading && hasActiveQuery && visibleRestaurants.length === 0 && <p>No relevant results found.</p>}
      {!loading && !hasActiveQuery && visibleRestaurants.length === 0 && <p>No restaurants available.</p>}

      {visibleRestaurants.length > 0 && (
        <div className="restaurant-list-scroll" aria-label="Restaurant cards">
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
                className="restaurant-card"
              >
                <h2>{restaurant.restaurantName}</h2>
                {restaurant.description && <p>{restaurant.description}</p>}
                {restaurant.cuisine && <p className="restaurant-cuisine">Cuisine: {restaurant.cuisine}</p>}
                {restaurant.address && <p className="restaurant-address">{restaurant.address}</p>}
                {hasDistance && <p className="restaurant-distance">{distanceKm.toFixed(2)} km away</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
