import httpClient from "./httpClient";

const extractUrl = (data) => data?.url || data?.secure_url || data?.data?.url;

const buildFriendlyError = (error) => {
  const message =
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    "Unable to upload image. Please try again.";
  const err = new Error(message);
  err.status = error?.response?.status;
  err.raw = error?.response?.data || error;
  return err;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await httpClient.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const data = res?.data ?? res;
    const url = extractUrl(data);

    if (!url) {
      console.warn("uploadImage: Unable to extract image URL from response", data);
    }

    return url || data;
  } catch (error) {
    throw buildFriendlyError(error);
  }
};
