import client, { IS_MOCK } from "./client";
import { MOCK_DATA } from "./mockData";
import type {
  SearchParams,
  SearchPlace,
  NearbyParams,
  NearbyPlace,
} from "../types/api";

export const searchApi = {
  searchPlaces: (params: SearchParams) => {
    if (IS_MOCK) {
      console.log("🚀 [Mock Mode] 검색어:", params.keyword);
      return Promise.resolve(MOCK_DATA.search as any);
    }
    return client.get<SearchPlace[]>("/api/search", { params });
  },

  getNearbyPlaces: (params: NearbyParams) => {
    if (IS_MOCK) return Promise.resolve(MOCK_DATA.search as any);
    return client.get<NearbyPlace[]>("/api/places/nearby", { params });
  },
};
