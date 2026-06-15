const BASE_URL = "http://localhost:8000";

export const generateQuiz = async (topic, level) => {
  try {
    console.log("Sending to backend:", {topic, level});
    const response = await fetch(`${BASE_URL}/generate`, {
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
    return null;
  }
};