import {jwtDecode} from 'jwt-decode';
import axiosInstance from './axiosInstance';
import BACKEND_URLS from '../BackendUrls';

// Define the structure of your token payload (customize according to your backend)
interface TokenPayload {
    username: string;
    exp: number;
    user_id: number;
}

const getUsernameFromToken = async () => {
    const token = localStorage.getItem('access_token'); // Replace with your token source
    // console.log("Token:", token);
    if (token) {
        try {
            const decoded: TokenPayload = jwtDecode(token);
            const response = await axiosInstance.get(`${BACKEND_URLS.getUser}/${decoded.user_id}`);
            return response.data.username;
        } catch (error) {
            console.error('Failed to decode token:', error);
        }
    }
    return null;
};

export default getUsernameFromToken;
