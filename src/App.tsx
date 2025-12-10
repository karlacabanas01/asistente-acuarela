import { useState, type ChangeEvent } from "react";
import "./App.css";
import { convertFileToBase64 } from "./utils/imageUtils";
import { analyzeImageColors } from "./services/bedrockService"; // <--- Importamos esto

// Definimos la forma de los datos que esperamos (TypeScript es genial aquí)
interface ColorPalette {
  colors: Array<{
    name: string;
    hex: string;
    reason: string;
  }>;
  advice: string;
}

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string>("");

  // Nuevos estados para manejar la IA
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ColorPalette | null>(null);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setResult(null); // Limpiar resultado anterior

      try {
        const base64 = await convertFileToBase64(file);
        setBase64Image(base64);
      } catch (error) {
        console.error("Error al procesar imagen", error);
      }
    }
  };

  // Esta es la función que llama a AWS
  const handleAnalyze = async () => {
    if (!base64Image) return;

    setLoading(true);
    try {
      console.log("Enviando a Claude...");
      const data = await analyzeImageColors(base64Image);
      console.log("Respuesta recibida:", data);
      setResult(data);
    } catch (error) {
      console.error("Error en la IA:", error);
      alert("Hubo un error al consultar la IA. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Asistente de Acuarela 🎨</h1>

      <div className="card">
        <input type="file" accept="image/*" onChange={handleImageUpload} />

        {selectedImage && (
          <div style={{ marginTop: "20px" }}>
            <img
              src={selectedImage}
              alt="Vista previa"
              style={{ maxWidth: "300px", borderRadius: "10px" }}
            />

            <div style={{ marginTop: "20px" }}>
              <button onClick={handleAnalyze} disabled={loading}>
                {loading
                  ? "Analizando con IA..."
                  : "🎨 Obtener Paleta de Colores"}
              </button>
            </div>
          </div>
        )}

        {/* Aquí mostramos el resultado cuando llegue */}
        {result && (
          <div style={{ marginTop: "30px", textAlign: "left" }}>
            <h3>Sugerencia de la IA:</h3>
            <p>
              <em>{result.advice}</em>
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "10px",
              }}
            >
              {result.colors.map((color, index) => (
                <div
                  key={index}
                  style={{ textAlign: "center", width: "100px" }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      backgroundColor: color.hex,
                      borderRadius: "50%",
                      margin: "0 auto",
                      border: "2px solid #ddd",
                    }}
                  />
                  <p style={{ fontSize: "12px", fontWeight: "bold" }}>
                    {color.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
