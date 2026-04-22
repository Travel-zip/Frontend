import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/*App 전체를 BrowserRouter로 감싸기 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
