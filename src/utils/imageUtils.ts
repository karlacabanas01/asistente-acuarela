export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1024;
        const scaleSize = MAX_WIDTH / img.width;

        const finalScale = scaleSize < 1 ? scaleSize : 1;

        canvas.width = img.width * finalScale;
        canvas.height = img.height * finalScale;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

          const base64String = dataUrl.split(",")[1];
          resolve(base64String);
        } else {
          reject(new Error("No se pudo crear el contexto del canvas"));
        }
      };

      img.onerror = (error) => reject(error);
    };

    reader.onerror = (error) => reject(error);
  });
};
