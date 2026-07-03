import type { UploadImageResponse } from "../../types/features/upload";
import apiClient from "../apiClient";

const uploadApi = {
  uploadImage: async (file: File): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  deleteImage: async (publicId: string): Promise<{ message: string }> => {
    const res = await apiClient.delete("/upload/image", {
      params: { publicId },
    });
    return res.data;
  },
};

export default uploadApi;
