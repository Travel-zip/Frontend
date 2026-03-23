import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";

/**
 * Axios 인스턴스 생성
 * 백엔드 개발자와 협의된 서버 주소(Base URL)를 여기에 입력함
 */
const client: AxiosInstance = axios.create({
  // 백엔드 서버 주소 (배포 후에는 AWS 주소 등으로 교체 필수)
  baseURL: "http://tavel.zip.p-e.kr",
  headers: {
    "Content-Type": "application/json",
  },
  // 요청 타임아웃 설정 (10초)
  timeout: 10000,
});

/**
 * 1. 요청(Request) 인터셉터
 * 서버로 요청을 보내기 직전에 실행됨.
 * 로컬 스토리지에 저장된 JWT 토큰을 꺼내서 헤더에 자동으로 넣어줌.
 */
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");

    if (token && config.headers) {
      // 명세서 규격에 맞게 Bearer 토큰 방식으로 주입함
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * 2. 응답(Response) 인터셉터
 * 서버에서 응답이 온 직후, 컴포넌트(api 함수)에 도달하기 전에 실행됨.
 * 공통 에러(401 권한 없음 등)를 여기서 한 번에 처리함.
 */
client.interceptors.response.use(
  (response: AxiosResponse) => {
    // 200번대 성공 응답은 그대로 반환함
    return response;
  },
  (error) => {
    // 서버 응답이 에러인 경우 (4xx, 5xx)
    const { response } = error;

    if (response) {
      // ✅ 401 Unauthorized: 토큰이 만료되었거나 없을 때
      if (response.status === 401) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");

        // 만료된 토큰 삭제 및 로그인 페이지로 강제 이동
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }

      // 403 Forbidden: 접근 권한이 없을 때
      if (response.status === 403) {
        alert("접근 권한이 없습니다.");
      }

      // 500 Internal Server Error: 서버 내부 오류
      if (response.status >= 500) {
        console.error("서버 내부 오류 발생함.");
      }
    } else {
      // 네트워크 연결 끊김 등 서버 응답 자체가 없는 경우
      console.error("네트워크 에러가 발생했음.");
    }

    return Promise.reject(error);
  },
);

export default client;
