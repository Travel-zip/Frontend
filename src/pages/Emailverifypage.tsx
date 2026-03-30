// import { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import Button from "../components/common/Button";
// import { authApi } from "../api/authApi";

// export default function EmailVerifyPage() {
//   const [code, setCode] = useState("");
//   const location = useLocation();
//   const navigate = useNavigate();

//   // 이전 페이지에서 넘어온 이메일 주소
//   const email = location.state?.email || "";

//   const handleVerifyCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       // ✅ API 호출: /api/auth/email/verify-code
//       await authApi.verifyCode({ email, code });
//       alert("이메일 인증이 완료되었습니다!");

//       // 인증 성공 후 회원가입 페이지로 이동 (이메일 값 전달)
//       navigate("/signup", { state: { email, isVerified: true } });
//     } catch (err: any) {
//       alert(err.response?.data?.message || "인증코드가 올바르지 않습니다.");
//     }
//   };

//   const inputStyle =
//     "w-full p-4 rounded-[10px] border-2 border-gray-200 bg-gray-50 outline-none focus:border-primary-600 transition-all text-center text-h1 tracking-[10px]";

//   return (
//     <div className="min-h-screen bg-white flex flex-col p-8 pt-20 max-w-[480px] mx-auto">
//       <div className="mb-14">
//         <h1 className="text-title1 text-gray-900 leading-tight">
//           전송된 코드를
//           <br />
//           입력해주세요.
//         </h1>
//         <p className="text-body2 text-gray-400 mt-4 font-medium">
//           <span className="text-primary-600 font-bold">{email}</span> 로<br />
//           6자리 인증코드를 보냈습니다.
//         </p>
//       </div>

//       <form onSubmit={handleVerifyCode} className="flex flex-col gap-10">
//         <div className="flex flex-col gap-2">
//           <label className="text-body4 text-gray-600 ml-1 font-semibold">
//             인증코드 6자리
//           </label>
//           <input
//             type="text"
//             maxLength={6}
//             className={inputStyle}
//             placeholder="000000"
//             value={code}
//             onChange={(e) => setCode(e.target.value)}
//             required
//           />
//         </div>

//         <div className="flex flex-col gap-4">
//           <Button
//             label="인증하기"
//             variant="solid"
//             type="submit"
//             customSize="w-full py-5"
//             textClassName="text-body1"
//           />
//           <button
//             type="button"
//             onClick={() => navigate(-1)}
//             className="text-body4 text-gray-400 underline underline-offset-4"
//           >
//             이메일 다시 입력하기
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }
