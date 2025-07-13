import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const API_ROUTES = {
  REGISTER: `${API_BASE_URL}/users/register`,
  LOGIN: `${API_BASE_URL}/users/login`,
  PROMPTS: `${API_BASE_URL}/prompts`,
};

export const api = axios.create({
  baseURL: API_BASE_URL,
});
