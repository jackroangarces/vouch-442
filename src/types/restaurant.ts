export type RestaurantImage = {
  url: string;
  path?: string;
};
export type Restaurant = {
  id: string;
  restaurantName: string;
  images?: RestaurantImage[];
};