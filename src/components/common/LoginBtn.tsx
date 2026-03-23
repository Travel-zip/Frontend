// const LoginBtn = ({ className }) => {
//   return (
//     <div className={`w-[280px] h-[60px] ${className}`}>
//       <div className="absolute w-[280px] h-[60px] left-[0px] top-[0px]">
//         <div className="absolute w-[280px] h-[60px] left-[0px] top-[0px] [background:linear-gradient(180deg,_#667eea_0%,_#764ba2_100%)] rounded-[30px] [border:1px_solid_#ffffff]" />
//         <p className="absolute left-[80px] top-[18px] [font-family:'Inter',_Helvetica] font-bold text-white text-[20px] text-center tracking-[0] leading-[normal]">
//           Sign In
//         </p>
//       </div>
//     </div>
//   );
// };
// function App() {
//   const [state, dispatch] = useReducer(reducer, {
//     property1: "default",
//   });

//   return (
//     <div className="relative w-screen h-screen">
//       {/* 다른 컴포넌트들 */}
//       <LoginBtn className="left-[80px] top-[500px]" />
//       <AddBtn
//         className="left-[80px] top-[580px]"
//         property1={state.property1}
//         onMouseEnter={() => dispatch("mouse_enter")}
//         onMouseLeave={() => dispatch("mouse_leave")}
//       />
//     </div>
//   );
// }
