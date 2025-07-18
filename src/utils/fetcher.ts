import { api } from "../config/api";

export interface Prompt {
  id: string;
  title: string;
  text: string;
  description?: string | null;
  category?: string | null;
  tags?: string[];
  favorite: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const fetcher = async (url: string) => {
  const response = await api.get(url);
  return response.data.payload;
};

export interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}
