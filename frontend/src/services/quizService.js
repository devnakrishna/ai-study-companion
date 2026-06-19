const BASE_URL = "http://localhost:8000";

export const generateQuiz = async (topic, level) => {
  try {
    
    const response = await fetch(`${BASE_URL}/create-session`, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      // Send the topic and level to FastAPI
      body: JSON.stringify({ topic: topic, level: level }), 
    });

    if (!response.ok) {
      throw new Error("Failed to generate quiz from backend");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in generateQuiz:", error);
    throw error;
  }
};
export const submitQuiz = async (sessionId, answers) => {
  const response = await fetch(`${BASE_URL}/submit/${sessionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(answers),
  });

  return await response.json();
};

export const evaluateQuiz = async (sessionId) => {
  const response = await fetch(`${BASE_URL}/evaluate/${sessionId}`, {
    method: "POST",
  });

  return await response.json();
};

export const getRecommendations = async (weakAreas) => {
  const response = await fetch(`${BASE_URL}/recommend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      weak_areas: weakAreas,
    }),
  });
   return await response.json();
};
export const getTopicPerformance = async () => {
  const response = await fetch(`${BASE_URL}/topic-performance`);

  if (!response.ok) {
    throw new Error("Failed to fetch topic performance");
  }
   return await response.json();
};

 
