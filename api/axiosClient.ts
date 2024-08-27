import axios from 'axios';

const axiosClient = axios.create({
    // baseURL: 'http://localhost:3000/api',
    baseURL: 'https://us-central1-dinefinder-203c7.cloudfunctions.net/app/api',
});

// axiosClient.interceptors.request.use(
//     async (config) => {
//         const token = await getToken();
//         // console.log(`AXIOS token: ${token}`);
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API call failed:', error);
        if (error.response) {
            // Server responded with a status other than 200 range
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            // Request was made but no response received
            console.error('Request data:', error.request);
        } else {
            // Something else caused the error
            console.error('Error message:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
