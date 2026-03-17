import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
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
  image?: string;
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

function normalizeVibe(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length !== 6) return null;

  const out = value.map((axis) => {
    const n = readNumber(axis);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(5, n));
  });

  return out;
}

function mapRestaurantDoc(id: string, rawData: Record<string, unknown>): Omit<HomeRestaurant, "vibe"> | null {
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
    image: readString(rawData.image),
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

export default function Home() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState<HomeRestaurant[]>([]);
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
        const [restaurantSnap, reviewSnap] = await Promise.all([
          getDocs(collection(db, "restaurants")),
          getDocs(collection(db, "reviews")),
        ]);

        const vibeAgg = new Map<string, { sums: number[]; count: number }>();
        reviewSnap.forEach((reviewDoc) => {
          const data = reviewDoc.data() as Record<string, unknown>;
          const restaurantId = readString(data.restaurantId);
          const vibe = normalizeVibe(data.vibe);
          if (!restaurantId || !vibe) return;

          const existing = vibeAgg.get(restaurantId);
          if (existing) {
            for (let i = 0; i < 6; i++) existing.sums[i] += vibe[i];
            existing.count += 1;
          } else {
            vibeAgg.set(restaurantId, { sums: [...vibe], count: 1 });
          }
        });

        const list: HomeRestaurant[] = [];
        restaurantSnap.forEach((restaurantDoc) => {
          const mapped = mapRestaurantDoc(
            restaurantDoc.id,
            restaurantDoc.data() as Record<string, unknown>,
          );
          if (!mapped) return;

          const agg = vibeAgg.get(mapped.id);
          const vibe =
            agg && agg.count > 0
              ? agg.sums.map((s) => Math.round((s / agg.count) * 10) / 10)
              : null;

          list.push({ ...mapped, vibe });
        });

        if (!cancelled) setRestaurants(list);
      } catch (error) {
        console.error("Failed to load restaurants.", error);
        if (!cancelled) setRestaurants([]);
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
          onChange={(e) => setSortMode(e.target.value as SortMode)}
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
                style={{
                  backgroundImage: restaurant.image
                  ? `url(${restaurant.image})`
                  : undefined
                }}
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
