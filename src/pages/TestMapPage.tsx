// import React, { useEffect, useRef, useState } from "react";

// export default function TestMapPage() {
//   const mapContainer = useRef<HTMLDivElement>(null);
//   const mapInstance = useRef<any>(null);
//   const markersRef = useRef<any[]>([]); // 생성된 마커들을 관리

//   const [keyword, setKeyword] = useState("");
//   const [category, setCategory] = useState("attraction");

//   useEffect(() => {
//     const { kakao } = window as any;

//     if (kakao && kakao.maps) {
//       kakao.maps.load(() => {
//         if (mapContainer.current && !mapInstance.current) {
//           const options = {
//             center: new kakao.maps.LatLng(37.566826, 126.978656),
//             level: 3,
//           };
//           mapInstance.current = new kakao.maps.Map(
//             mapContainer.current,
//             options,
//           );
//         }
//       });
//     }
//   }, []);

//   const clearMarkers = () => {
//     markersRef.current.forEach((marker) => marker.setMap(null));
//     markersRef.current = [];
//   };

//   const handleMarkerClick = (place: any) => {
//     // 백엔드로 전송할 데이터 구조 조립
//     const payload = {
//       roomId: "room-1234",
//       placeId: place.id,
//       placeName: place.place_name,
//       category: category,
//       lat: place.y,
//       lng: place.x,
//       address: place.road_address_name || place.address_name,
//       phone: place.phone,
//     };

//     // 프론트엔드에서 데이터 전송 내역 확인
//     console.log("====================================");
//     console.log("📍 마커 클릭됨!");
//     console.log("🚀 [백엔드로 전송될 Payload]:", payload);
//     console.log("====================================");

//     alert(
//       `'${place.place_name}' 정보가 콘솔에 출력되었습니다. F12를 확인하세요!`,
//     );

//     // 실제 백엔드 연동 시 아래 주석 해제 후 사용
//     /*
//     fetch('/api/places', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload)
//     }).then(res => res.json())
//       .then(data => console.log("서버 응답:", data));
//     */
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!mapInstance.current || !keyword.trim()) return;

//     const { kakao } = window as any;
//     const ps = new kakao.maps.services.Places();

//     // 키워드로 장소 검색
//     ps.keywordSearch(keyword, (data: any, status: any) => {
//       if (status === kakao.maps.services.Status.OK) {
//         clearMarkers();

//         const bounds = new kakao.maps.LatLngBounds();

//         data.forEach((place: any) => {
//           const position = new kakao.maps.LatLng(place.y, place.x);
//           const marker = new kakao.maps.Marker({
//             map: mapInstance.current,
//             position: position,
//           });

//           // 마커 클릭 이벤트 등록
//           kakao.maps.event.addListener(marker, "click", () => {
//             handleMarkerClick(place);
//           });

//           markersRef.current.push(marker);
//           bounds.extend(position);
//         });

//         // 검색된 장소들이 모두 보이도록 지도 범위 재설정
//         mapInstance.current.setBounds(bounds);
//       } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
//         alert("검색 결과가 존재하지 않습니다.");
//       } else {
//         alert("검색 중 오류가 발생했습니다.");
//       }
//     });
//   };

//   return (
//     <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
//       <div
//         style={{
//           position: "absolute",
//           top: 20,
//           left: 20,
//           zIndex: 999,
//           background: "white",
//           padding: "15px",
//           borderRadius: "12px",
//           boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//         }}
//       >
//         <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
//           <select
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             style={{ padding: "8px", outline: "none" }}
//           >
//             <option value="attraction">관광지</option>
//             <option value="food">음식점</option>
//             <option value="stay">숙박</option>
//           </select>
//           <input
//             value={keyword}
//             onChange={(e) => setKeyword(e.target.value)}
//             placeholder="예: 강남역 맛집"
//             style={{
//               padding: "8px",
//               border: "1px solid #ccc",
//               borderRadius: "4px",
//               outline: "none",
//             }}
//           />
//           <button
//             type="submit"
//             style={{
//               padding: "8px 12px",
//               background: "#4967FE",
//               color: "white",
//               border: "none",
//               borderRadius: "4px",
//               cursor: "pointer",
//               fontWeight: "bold",
//             }}
//           >
//             검색
//           </button>
//         </form>
//       </div>

//       <div
//         ref={mapContainer}
//         style={{
//           width: "100%",
//           height: "100%",
//           backgroundColor: "#e5e7eb",
//         }}
//       />
//     </div>
//   );
// }
