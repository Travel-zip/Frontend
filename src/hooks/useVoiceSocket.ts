import { useState, useEffect, useRef } from "react";

export const useVoiceSocket = (roomId: string, sender: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [extractedPlaces, setExtractedPlaces] = useState<string[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 웹소켓 연결
    const socketUrl = `ws://tavelzip.p-e.kr:8080/ws/voice?roomId=${roomId}`;
    const ws = new WebSocket(socketUrl);
    socketRef.current = ws;

    ws.onopen = () => console.log("웹소켓 연결 성공!");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // 서버로부터 온 메시지 타입에 따른 처리
      if (data.type === "CHAT") {
        setMessages((prev) => [...prev, data]);
      } else if (data.type === "PLACES") {
        setExtractedPlaces(data.places);
        console.log("📍 추출된 장소들:", data.places);
      }
    };

    ws.onclose = () => console.log("❌ 웹소켓 연결 종료");

    return () => ws.close();
  }, [roomId]);

  // 서버로 메시지 보내기 함수
  const sendMessage = (text: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const msg = { roomId, sender, text };
      socketRef.current.send(JSON.stringify(msg));
    }
  };

  return { messages, extractedPlaces, sendMessage };
};
