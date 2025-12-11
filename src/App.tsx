import { useState, type ChangeEvent } from "react";
import { convertFileToBase64 } from "./utils/imageUtils";
import { analyzeImageColors } from "./services/bedrockService";
import { ErrorMessage } from "./components/ErrorMessage";
import { useTypewriter } from "./hooks/useTypewrite";

interface ColorPalette {
  colors: Array<{
    name: string;
    hex: string;
    reason: string;
  }>;
  advice: string;
}

// Componente para mostrar el consejo con efecto de escritura
const AdviceDisplay = ({ text }: { text: string }) => {
  const typedText = useTypewriter(text, 25); // Velocidad: 25ms por letra
  return (
    <p className="text-gray-200 text-xl italic leading-relaxed font-light">
      "{typedText}"<span className="animate-pulse">|</span>
    </p>
  );
};

// Skeleton Loader (Sin cambios)
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-8 p-4 w-full">
    <div className="bg-gray-800 border-l-8 border-gray-700 p-8 rounded-r-3xl">
      <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-700 rounded w-full mb-3"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
    </div>
    <div>
      <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-gray-800 p-6 rounded-2xl flex flex-col items-center border border-gray-700"
          >
            <div className="w-24 h-24 rounded-full bg-gray-700 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-12"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ColorPalette | null>(null);
  const [error, setError] = useState<string | null>(null); // <--- NUEVO ESTADO

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setResult(null);
      setError(null); // Limpiar error al subir nueva foto
      try {
        const base64 = await convertFileToBase64(file);
        setBase64Image(base64);
      } catch (error) {
        console.error(error);
        setError("No pudimos procesar tu imagen. Intenta con otra.");
      }
    }
  };

  const handleAnalyze = async () => {
    if (!base64Image) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await analyzeImageColors(base64Image);
      setResult(data);
    } catch (error) {
      console.error(error);
      // Mensaje de error amigable según el tipo
      setError(
        "La IA no pudo analizar esta imagen. Puede ser muy pesada o el servicio está ocupado. ¡Intenta de nuevo!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* === COLUMNA IZQUIERDA === */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full lg:max-w-2xl justify-self-center lg:justify-self-end">
          <div className="bg-indigo-600 p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Asistente de Acuarela 🎨
            </h1>
            <p className="text-indigo-100">Sube tu foto para comenzar</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:bg-gray-50 transition-colors bg-gray-50/50">
              {!selectedImage ? (
                <label className="cursor-pointer flex flex-col items-center w-full py-10">
                  <span className="text-6xl mb-4">🖼️</span>
                  <span className="text-gray-500 font-bold text-lg mb-1">
                    Arrastra o haz clic para subir
                  </span>
                  <span className="text-sm text-gray-400">
                    (Formatos JPG o PNG)
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              ) : (
                <div className="relative w-full text-center">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="max-h-[500px] w-full object-contain mx-auto rounded-lg shadow-md"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setResult(null);
                      setError(null);
                    }}
                    disabled={loading}
                    className="mt-6 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 font-medium transition-colors disabled:opacity-50"
                  >
                    🔄 Cambiar imagen
                  </button>
                </div>
              )}
            </div>

            {selectedImage && !result && !error && (
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-bold text-xl text-white transition-all transform shadow-xl
                  ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed scale-100 animate-pulse"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] hover:from-indigo-700 hover:to-purple-700"
                  }`}
              >
                {loading
                  ? "🧠 Analizando composición..."
                  : "✨ Generar Paleta de Colores"}
              </button>
            )}
          </div>
        </div>

        {/* === COLUMNA DERECHA === */}
        <div className="flex flex-col h-full min-h-[400px] w-full lg:max-w-4xl justify-self-start">
          {loading && <LoadingSkeleton />}

          {error && <ErrorMessage message={error} onRetry={handleAnalyze} />}

          {!loading && !error && result && (
            <div className="animate-fade-in space-y-8 p-4">
              {/* Tarjeta de Consejo con Efecto Streaming */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-l-8 border-yellow-400 p-8 rounded-r-3xl shadow-2xl">
                <h3 className="text-yellow-400 font-bold mb-3 text-2xl flex items-center gap-2">
                  <span>💡</span> Consejo del Profesor:
                </h3>
                {/* Aquí usamos el nuevo componente */}
                <AdviceDisplay text={result.advice} />
              </div>

              <div>
                <h3 className="text-white font-bold mb-6 text-3xl flex items-center gap-3 border-b border-gray-700 pb-4">
                  <span>🎨</span> Paleta Sugerida
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-6">
                  {result.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col items-center hover:bg-gray-700 transition-all transform hover:-translate-y-2 border border-gray-700 group"
                      style={{ animationDelay: `${idx * 100}ms` }} // Pequeño retraso en cascada
                    >
                      <div
                        className="w-24 h-24 rounded-full shadow-inner mb-4 border-4 border-gray-600 group-hover:border-white transition-colors"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="font-bold text-white text-lg text-center leading-tight mb-2">
                        {color.name}
                      </span>
                      <span className="text-xs text-gray-400 font-mono bg-black/30 px-3 py-1 rounded-full border border-gray-600">
                        {color.hex}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && !error && !result && (
            /* Placeholder (Estado Vacío) */
            <div className="h-full flex flex-col items-center justify-center text-gray-600 border-4 border-dashed border-gray-800 rounded-[3rem] p-12 bg-gray-900/50">
              <span className="text-8xl mb-6 opacity-20">🎨</span>
              <p className="text-3xl font-bold text-gray-500 text-center">
                El análisis aparecerá aquí
              </p>
              <p className="text-lg mt-4 text-gray-600 text-center max-w-md">
                Nuestra IA analizará la luz, las sombras y la composición de tu
                foto para darte la mezcla exacta.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
