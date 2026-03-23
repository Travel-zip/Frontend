import { useEffect, useRef, useState } from "react";
import Sidebar from "../pages/Sidebar";
import { roomApi } from "../api/roomApi";
import { searchApi } from "../api/searchApi";
import Button from "../components/common/Button"; // 공통 컴포넌트 사용
import type {
  Room,
  SearchPlace,
  NearbyPlace,
  SearchParams,
  NearbyParams,
} from "../types/api";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const clustererInstance = useRef<any>(null);
  const infoWindowInstance = useRef<any>(null);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string>("default");
  const [keyword, setKeyword] = useState("");
  const [selectedPlaces, setSelectedPlaces] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  //방 목록 로드
  useEffect(() => {
    roomApi.getMyRooms().then((res) => {
      setRooms(res.data.rooms);
      if (res.data.rooms.length > 0) setCurrentRoomId(res.data.rooms[0].roomId);
    });
  }, []);

  //지도 초기화
  useEffect(() => {
    const { kakao } = window as any;
    if (!kakao) return;
    kakao.maps.load(() => {
      if (mapInstance.current) return;
      mapInstance.current = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(37.5563, 126.9707),
        level: 3,
      });
      clustererInstance.current = new kakao.maps.MarkerClusterer({
        map: mapInstance.current,
        averageCenter: true,
        minLevel: 6,
      });
      infoWindowInstance.current = new kakao.maps.InfoWindow({ zIndex: 1 });
    });
  }, []);

  //키워드 검색 (Search)
  const handleKeywordSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!keyword.trim() || !mapInstance.current) return;
    const center = mapInstance.current.getCenter();
    const params: SearchParams = {
      category: "food",
      keyword,
      lat: center.getLat(),
      lng: center.getLng(),
      radius: 2000,
      roomId: currentRoomId,
    };
    try {
      const res = await searchApi.searchPlaces(params);
      setSearchResults(res.data);
      displayMarkers(res.data);
    } catch (err) {
      alert("검색 실패");
    }
  };

  //주변 장소 조회 (Nearby) - 버튼 클릭 시 호출
  const handleNearbySearch = async (categoryCSV: string) => {
    if (!mapInstance.current) return;

    // 현재 지도가 띄워져 있는 상태의 중심 좌표 추출
    const center = mapInstance.current.getCenter();

    const params: NearbyParams = {
      lat: center.getLat(),
      lng: center.getLng(),
      radius: 2000, // 명세서 권장 반경
      categories: categoryCSV, // "food", "attraction" 등
      roomId: currentRoomId,
    };

    try {
      const res = await searchApi.getNearbyPlaces(params);
      if (res.data.length === 0) return alert("주변에 검색 결과가 없습니다.");

      setSearchResults(res.data);
      displayMarkers(res.data); // 응답 데이터로 마커 표시
    } catch (err) {
      alert("주변 장소 조회에 실패했습니다.");
    }
  };

  //통합 마커 표시 로직 (SearchPlace와 NearbyPlace 필드 차이 대응)
  const displayMarkers = (places: any[]) => {
    const { kakao } = window as any;
    clustererInstance.current.clear();
    const bounds = new kakao.maps.LatLngBounds();

    places.forEach((place) => {
      // Search(mapy/mapx), Nearby(lat/lng) 좌표 필드 대응
      const lat = place.mapy || place.lat;
      const lng = place.mapx || place.lng;
      const id = place.contentid || place.contentId;
      const title = place.title;

      const position = new kakao.maps.LatLng(lat, lng);
      bounds.extend(position);
      const marker = new kakao.maps.Marker({ position });

      kakao.maps.event.addListener(marker, "click", () => {
        const content = `
          <div style="padding:15px; min-width:180px; font-family: 'Pretendard';">
            <h4 style="margin:0 0 5px 0; font-size:14px; font-weight:700;">${title}</h4>
            <button onclick="window.addPlaceToTrip('${id}')" 
                    style="width:100%; background:#4967fe; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:600;">
              장소 추가하기
            </button>
          </div>
        `;
        infoWindowInstance.current.setContent(content);
        infoWindowInstance.current.open(mapInstance.current, marker);
      });
      clustererInstance.current.addMarker(marker);
    });
    mapInstance.current.setBounds(bounds);
  };

  return (
    <div className="flex w-full h-screen bg-white font-pretendard overflow-hidden">
      <Sidebar
        rooms={rooms}
        currentRoomId={currentRoomId}
        onRoomSelect={(id) => setCurrentRoomId(id)}
        selectedPlaces={selectedPlaces}
        onRemovePlace={(id) =>
          setSelectedPlaces((prev) =>
            prev.filter((p) => (p.contentid || p.contentId) !== id),
          )
        }
        onCreatePlan={() => {}}
        onExit={() => {}}
        userName="글미"
      />

      <div className="flex-1 relative bg-gray-50">
        <div className="absolute top-10 left-10 z-[100] flex flex-col gap-4">
          {/* 상단 검색바 */}
          <form onSubmit={handleKeywordSearch} className="flex gap-3">
            <input
              className="w-96 p-4 rounded-3xl shadow-2xl border-none outline-none bg-white text-body3 ring-2 ring-transparent focus:ring-primary-600 transition-all"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="어디로 맛집 탐방을 가볼까요?"
            />
            <button
              type="submit"
              className="bg-primary-600 text-white px-8 rounded-3xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              검색
            </button>
          </form>

          {/*주변 장소 카테고리 버튼들 (공통 Button 컴포넌트 활용) */}
          <div className="flex gap-2">
            <Button
              label="🍔 식당"
              variant="outline"
              customSize="px-6 py-2 w-auto"
              textClassName="text-body4"
              onClick={() => handleNearbySearch("food")}
            />
            <Button
              label="⭐ 맛집"
              variant="outline"
              customSize="px-6 py-2 w-auto"
              textClassName="text-body4"
              onClick={() => handleNearbySearch("food,culture")} // 맛집은 음식+문화
            />
            <Button
              label="🎡 놀거리"
              variant="outline"
              customSize="px-6 py-2 w-auto"
              textClassName="text-body4"
              onClick={() => handleNearbySearch("attraction,leports,festival")}
            />
          </div>
        </div>
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
}
