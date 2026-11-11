import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  signup: async (data) => (await api.post("/auth/signup", data)).data,
  login: async (data) => (await api.post("/auth/login", data)).data,
  getMe: async () => (await api.get("/auth/me")).data,
};

export const notesApi = {
  getNotes: async (params) => (await api.get("/notes", { params })).data,
  createNote: async (data) => (await api.post("/notes", data)).data,
  updateNote: async (id, data) => (await api.put(`/notes/${id}`, data)).data,
  deleteNote: async (id) => (await api.delete(`/notes/${id}`)).data,
};

export default api;
