import { useState, useEffect } from "react";

export const useTypewriter = (text: string, speed: number = 20) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText(""); // Reiniciar al cambiar el texto
    let i = 0;

    const intervalId = setInterval(() => {
      if (i >= text.length) {
        clearInterval(intervalId);
        return;
      }

      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return displayedText;
};
