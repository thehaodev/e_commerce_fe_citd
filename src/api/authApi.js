export const API_BASE_URL = "https://e-commerce-be-citd.onrender.com";

export async function login({ email, password }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // ignore json parse errors, data stays null
  }

  if (!res.ok) {
    // Try to extract a useful error message from FastAPI-style errors
    let message = "Login failed. Please check your credentials and try again.";
    if (data) {
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        message = data.detail[0].msg;
      } else if (data.message) {
        message = data.message;
      }
    }
    const error = new Error(message);
    error.raw = data;
    throw error;
  }

  return data;
}
