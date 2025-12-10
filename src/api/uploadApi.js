import httpClient from "./httpClient";

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return httpClient.post("/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
