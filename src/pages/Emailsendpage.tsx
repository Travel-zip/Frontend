// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Button from "../components/common/Button";
// import { authApi } from "../api/authApi";

// export default function EmailSendPage() {
//   const [email, setEmail] = useState("");
//   const navigate = useNavigate();

//   const handleSendCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       // ✅ API 호출: /api/auth/email/send-code
//       await authApi.sendCode({ email });
//       alert("인증코드가 발송되었습니다. 메일함을 확인해주세요!");

//       // 이메일 주소를 상태로 전달하며 인증 확인 페이지로 이동
//       navigate("/email-verify", { state: { email } });
//     } catch (err: any) {
//       alert(err.response?.data?.message || "코드 발송에 실패했습니다.");
//     }
//   };

//   const inputStyle =
//     "w-full p-4 rounded-[10px] border-2 border-gray-200 bg-gray-50 outline-none focus:border-primary-600 transition-all text-body3";

//   return (
//     <div className="min-h-screen bg-white flex flex-col p-8 pt-20 max-w-[480px] mx-auto">
//       <div className="mb-14">
//         <h1 className="text-title1 text-gray-900 leading-tight">
//           반가워요!
//           <br />
//           이메일 인증이 필요해요.
//         </h1>
//         <p className="text-body2 text-gray-400 mt-4 font-medium">
//           회원가입을 위해 사용 가능한 이메일을 입력해주세요.
//         </p>
//       </div>

//       <form onSubmit={handleSendCode} className="flex flex-col gap-10">
//         <div className="flex flex-col gap-2">
//           <label className="text-body4 text-gray-600 ml-1 font-semibold">
//             이메일 주소
//           </label>
//           <input
//             type="email"
//             className={inputStyle}
//             placeholder="example@naver.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>

//         <Button
//           label="인증코드 받기"
//           variant="solid"
//           type="submit"
//           customSize="w-full py-5"
//           textClassName="text-body1"
//         />
//       </form>
//     </div>
//   );
// }
