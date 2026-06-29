const BASE_URL = "http://localhost:8000";

const getHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem("token");
  return {
    ...extraHeaders,
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export const generateQuiz = async (topic, level) => {
  try {
    const userId = Number(localStorage.getItem("user_id"));

    const response = await fetch(`${BASE_URL}/create-session`, {
      method: "POST",
      headers: getHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        user_id: userId,
        topic,
        level,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Quiz generation failed: ${errText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("generateQuiz error:", error);
    throw error;
  }
};

export const submitQuiz = async (sessionId, answers) => {
  try {
    const response = await fetch(`${BASE_URL}/submit/${sessionId}`, {
      method: "POST",
      headers: getHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(answers),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Submit failed: ${errText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("submitQuiz error:", error);
    throw error;
  }
};

export const getTopicHistory = async (topic) => {
  const userId = localStorage.getItem("user_id");

  const response = await fetch(
    `${BASE_URL}/topic-history/${userId}/${encodeURIComponent(topic)}`,
    {
      headers: getHeaders()
    }
  );

  return await response.json();
};

export const evaluateQuiz = async (sessionId) => {
  try {
    const response = await fetch(`${BASE_URL}/evaluate/${sessionId}`, {
      method: "POST",
      headers: getHeaders()
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Evaluate failed: ${errText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("evaluateQuiz error:", error);
    throw error;
  }
};

export const getRecommendations = async (weakAreas) => {
  const response = await fetch(`${BASE_URL}/recommend`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      weak_areas: weakAreas,
    }),
  });
  return await response.json();
};

export const getTopicPerformance = async () => {
  const userId = localStorage.getItem("user_id");
  const response = await fetch(`${BASE_URL}/topic-performance/${userId}`, {
    headers: getHeaders()
  });

  if (!response.ok) {
    throw new Error("Failed to fetch topic performance");
  }
  return await response.json();
};

export const getSessionHistory = async (sessionId) => {
  const response = await fetch(`${BASE_URL}/history/session/${sessionId}`, {
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error("Failed to fetch session history");
  }
  return await response.json();
};
