import axios from "axios";
import { notifyDataUpdated } from "../utils/autoRefresh";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://e-commerce-project-with-dropshiping.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const method = response.config?.method?.toLowerCase();

    if (["post", "put", "patch", "delete"].includes(method)) {
      notifyDataUpdated();
    }

    return response;
  },
  (error) => Promise.reject(error)
);

export default api;