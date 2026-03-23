import client from "./client";
import type {
  SearchParams,
  SearchPlace,
  NearbyParams,
  NearbyPlace,
} from "../types/api";

export const searchApi = {
  // 3-1) 장소 검색 (Search)
  // 키워드 기반으로 장소를 찾고, 해당 방의 후보 목록으로 자동 저장됨
  searchPlaces: (params: SearchParams) => {
    return client.get<SearchPlace[]>("/api/search", { params });
  },

  // 3-2) 주변 장소 조회 (Nearby)
  // 내 현재 위치나 특정 좌표 주변의 맛집, 숙소 등을 조회함
  getNearbyPlaces: (params: NearbyParams) => {
    return client.get<NearbyPlace[]>("/api/places/nearby", { params });
  },
};
