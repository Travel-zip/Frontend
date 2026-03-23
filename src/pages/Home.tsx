import React, { useState } from "react";
import Sidebar from "../pages/Sidebar";
import Plan from "./Plan";
import Career from "../assets/Design_img/source/career.png";
import { type PlanData } from "../components/common/PlanCard";

export default function Home() {
  const [plans, setPlans] = useState<PlanData[]>([]);

  //로컬 스토리지에서 아이디 가져오기
  const userLoginId = localStorage.getItem("loginId") || "글미";

  const addPlan = () => {
    const newPlan: PlanData = {
      id: Date.now(),
      title: `새 여행 ${plans.length + 1}`,
      lastModified: "2026.02.03",
      isFavorite: false,
      participants: ["https://api.dicebear.com/7.x/avataaars/svg?seed=1"],
      image: "",
    };
    setPlans([...plans, newPlan]);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex w-screen h-screen bg-gray-50 overflow-hidden font-pretendard">
      <Sidebar
        rooms={plans}
        userName={userLoginId}
        onCreatePlan={addPlan}
        onExit={handleLogout}
      />
      <main className="flex-1 h-full overflow-hidden">
        <Plan
          imageSrc={Career}
          plans={plans}
          onAddPlan={addPlan}
          onToggleFavorite={(id) =>
            setPlans(
              plans.map((p) =>
                p.id === id ? { ...p, isFavorite: !p.isFavorite } : p,
              ),
            )
          }
        />
      </main>
    </div>
  );
}
