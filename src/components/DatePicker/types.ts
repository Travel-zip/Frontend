export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export type WeatherData = {
  date: Date;
  icon: string;
  temperature: number;
};

export type City = {
  name: string;
  lat: string;
  lon: string;
};

export const cities: City[] = [
  { name: "제주", lat: "33.4996", lon: "126.5312" },
  { name: "부산", lat: "35.1796", lon: "129.0756" },
  { name: "여수", lat: "34.7604", lon: "127.6622" },
];
