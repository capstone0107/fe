import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 (수정된 부분)
apiClient.interceptors.request.use((config) => {
    // 1. 요청 정보 콘솔 출력
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config);
    
    // (선택사항) body 데이터도 따로 보고 싶다면 아래 주석 해제
    // if (config.data) console.log('Request Data:', config.data);
    // if (config.params) console.log('Request Params:', config.params);

    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => {
        // (선택사항) 응답이 왔을 때도 로그를 찍고 싶다면 여기에 추가
        // console.log(`[API Response] ${response.config.url}`, response);
        return response;
    },
    (error) => {
        // 에러 로그
        console.error('[API Error]', error);

        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default apiClient;