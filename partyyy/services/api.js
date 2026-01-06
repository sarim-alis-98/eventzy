import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getBaseURL = () => {
  return "https://backend-xtzq.onrender.com/api";
};

const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add token to requests.
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) { config.headers.Authorization = `Bearer ${token}`;}
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
