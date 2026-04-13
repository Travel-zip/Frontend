import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";

// Mock 모드 여부 확인 (Vite 환경변수)
export const IS_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const client: AxiosInstance = axios.create({
  // Mock 모드일 때는 주소가 의미 없으므로 비워둡니다.
  baseURL: IS_MOCK ? "" : "https://tavelzip.p-e.kr",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// 요청 인터셉터 (토큰 주입)
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터 (에러 처리)
client.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (IS_MOCK) return Promise.reject(error); // Mock 모드일 땐 인터셉터 에러 처리 건너뜀

    const { response } = error;
    if (response) {
      if (response.status === 401) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default client;
