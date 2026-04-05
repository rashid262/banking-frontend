const BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

export const apiRequest = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("bank_token");

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (body) options.body = JSON.stringify(body);

  try {
    const url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const response = await fetch(url, options);

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();

      if (!response.ok && data.status !== "FAILED") {
        return { ...data, status: "ERROR" };
      }

      return data;
    }

    return {
      status: "ERROR",
      message: `HTTP ${response.status}: ${response.statusText}`,
    };

  } catch (error) {
    console.error("API Error:", error);

    return {
      status: "ERROR",
      message: "Network error - backend unreachable",
    };
  }
};