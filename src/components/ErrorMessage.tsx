interface Props {
  message: string;
  onRetry: () => void;
}

export const ErrorMessage = ({ message, onRetry }: Props) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-lg mb-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-3xl mr-4">😕</span>
        <div>
          <h3 className="text-red-800 font-bold text-lg">
            Ups, algo salió mal
          </h3>
          <p className="text-red-700">{message}</p>
        </div>
      </div>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  </div>
);
