export interface DummyRestaurant {
  id: string;
  restaurantName: string;
  description: string;
  address: string;
  cuisine: string;
  lat: number;
  lng: number;
}

export interface DummyRestaurantAggregate {
  reviewCount: number;
  vibe: [number, number, number, number, number, number];
}

export const DUMMY_RESTAURANTS: DummyRestaurant[] = [
  {
    id: "dummy1",
    restaurantName: "Pine & Pepper Kitchen",
    description: "Casual farm-to-table spot with seasonal bowls and wood-fired mains.",
    address: "1214 Pine St, Seattle, WA 98101",
    cuisine: "American",
    lat: 47.6113,
    lng: -122.3321,
  },
  {
    id: "dummy2",
    restaurantName: "Golden Lantern Noodles",
    description: "Hand-pulled noodles, late-night dumplings, and spicy broth options.",
    address: "250 5th Ave N, Seattle, WA 98109",
    cuisine: "Chinese",
    lat: 47.6203,
    lng: -122.3498,
  },
  {
    id: "dummy3",
    restaurantName: "La Costa Verde",
    description: "Family-run Mexican grill known for house salsas and street tacos.",
    address: "891 N 34th St, Seattle, WA 98103",
    cuisine: "Mexican",
    lat: 47.6482,
    lng: -122.3473,
  },
  {
    id: "dummy4",
    restaurantName: "North Harbor Sushi",
    description: "Minimalist sushi bar with omakase flights and fresh nigiri.",
    address: "1800 Westlake Ave N, Seattle, WA 98109",
    cuisine: "Japanese",
    lat: 47.6359,
    lng: -122.3402,
  },
  {
    id: "dummy5",
    restaurantName: "Cedar Oven Pizzeria",
    description: "Neighborhood pizza place with sourdough crust and local ingredients.",
    address: "4425 Fremont Ave N, Seattle, WA 98103",
    cuisine: "Italian",
    lat: 47.6604,
    lng: -122.3494,
  },
  {
    id: "dummy6",
    restaurantName: "Bloom Brunch House",
    description: "All-day brunch menu featuring benedicts, pastries, and coffee flights.",
    address: "700 4th Ave, Seattle, WA 98104",
    cuisine: "Cafe",
    lat: 47.6027,
    lng: -122.3294,
  },
];

export const DUMMY_RESTAURANT_AGGREGATES: Record<string, DummyRestaurantAggregate> = {
  dummy1: { reviewCount: 6, vibe: [4.4, 4.2, 4.1, 3.6, 3.8, 4.3] },
  dummy2: { reviewCount: 12, vibe: [4.5, 3.7, 4.0, 4.2, 3.4, 4.1] },
  dummy3: { reviewCount: 9, vibe: [4.3, 4.4, 4.5, 3.9, 3.7, 4.0] },
  dummy4: { reviewCount: 15, vibe: [4.7, 4.6, 4.2, 3.5, 4.0, 4.4] },
  dummy5: { reviewCount: 8, vibe: [4.1, 4.0, 3.8, 4.3, 3.5, 4.2] },
  dummy6: { reviewCount: 11, vibe: [4.2, 4.5, 4.0, 3.7, 3.9, 4.6] },
};

const byId = new Map(DUMMY_RESTAURANTS.map((restaurant) => [restaurant.id, restaurant]));

export function getDummyRestaurantById(id: string): DummyRestaurant | undefined {
  return byId.get(id);
}

export function getDummyRestaurantAggregateById(id: string): DummyRestaurantAggregate | undefined {
  return DUMMY_RESTAURANT_AGGREGATES[id];
}
