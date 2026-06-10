import client, { IS_MOCK } from "./client";
import { MOCK_DATA } from "./mockData";
import type {
  SearchParams,
  SearchPlace,
  NearbyParams,
  NearbyPlace,
} from "../types/api";

//백엔드 명세서에 맞춘 Bulk POST용 타입 추가
export interface BulkPlaceRequest {
  roomId: string;
  places: {
    title: string;
    lat: number;
    lng: number;
  }[];
}

export const searchApi = {
  searchPlaces: (params: SearchParams) => {
    if (IS_MOCK) return Promise.resolve(MOCK_DATA.search as any);
    return client.get<SearchPlace[]>("/api/search", { params });
  },

  getNearbyPlaces: (params: NearbyParams) => {
    if (IS_MOCK) return Promise.resolve(MOCK_DATA.search as any);
    return client.get<NearbyPlace[]>("/api/places/nearby", { params });
  },

  //백엔드 명세서에 맞춘 Bulk POST 메서드 추가
  addPlacesBulk: (data: BulkPlaceRequest) => {
    if (IS_MOCK) {
      console.log("🚀 [Mock Mode] 장소 추가 Payload:", data);
      return Promise.resolve({ success: true });
    }
    return client.post("/api/places/bulk", data);
  },
};
