const API_URL =
  "https://y5g57wmwjnuvginytmt3e6hbgy0mjout.lambda-url.us-east-1.on.aws/";

export const analyzeImageColors = async (base64Image: string) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta del servidor");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error conectando con el Backend:", error);
    throw error;
  }
};
