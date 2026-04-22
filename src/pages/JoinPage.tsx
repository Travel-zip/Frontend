import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { roomApi } from "../api/roomApi";
import toast from "react-hot-toast";

export default function JoinPage() {
  const { roomId } = useParams(); // URL에서 '새 여행 1-...' 부분을 뽑아옴
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) return;

    const proceedJoin = async () => {
      try {
        // 🌟 서버에 "나 이 방 멤버로 넣어줘!" 요청
        await roomApi.joinRoom(roomId);

        toast.success("방에 성공적으로 참여했습니다!");
        // 참여 성공 후 지도로 이동
        navigate(`/map?roomId=${roomId}`);
      } catch (err: any) {
        console.error("참여 실패:", err);
        if (err.response?.status === 409) {
          // 이미 참여 중인 방이라면 바로 지도로 이동
          navigate(`/map?roomId=${roomId}`);
        } else {
          toast.error(
            "방 참여에 실패했습니다. 유효하지 않은 링크일 수 있습니다.",
          );
          navigate("/");
        }
      }
    };

    proceedJoin();
  }, [roomId, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-h4 font-bold">방에 참여하는 중입니다... 🚀</p>
    </div>
  );
}
