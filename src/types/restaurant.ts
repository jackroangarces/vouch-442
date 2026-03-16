export type RestaurantImage = {
  url: string;
  path?: string;
};
export type Restaurant = {
  id: string;
  restaurantName: string;
  description?: string;
  cuisine?: string;
  address?: string;
  images?: RestaurantImage[];
};