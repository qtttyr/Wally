import { useRef } from 'react';
import { XIcon, CameraIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface CameraViewProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

/**
 * CameraView — открывает нативную камеру телефона через input[capture].
 *
 * Почему НЕ getUserMedia:
 *   На Android Chrome getUserMedia показывает системный диалог с выбором
 *   "Камера / Запись экрана / Вкладка браузера" — пользователи путаются.
 *   input[type=file capture="environment"] обходит это и сразу открывает
 *   заднюю камеру через Camera app системы. Работает на iOS Safari и Android Chrome.
 */
export const CameraView = ({ onCapture, onCancel }: CameraViewProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  // Автоматически кликаем по скрытому input при монтировании компонента
  // чтобы сразу открыть камеру без дополнительного нажатия
  const handleOpen = () => {
    inputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 pt-safe">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-white hover:bg-white/20"
        >
          <XIcon size={24} />
        </Button>
        <span className="text-sm font-medium text-white">Фото чека</span>
        <div className="w-10" />
      </div>

      {/* Центральная зона с подсказкой */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-8">
        {/* Рамка-прицел */}
        <div className="w-full max-w-xs aspect-3/4 rounded-2xl border-2 border-dashed border-white/60 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-white/70">
            <CameraIcon size={48} />
            <p className="text-sm text-center">Направь камеру на чек</p>
          </div>
        </div>
      </div>

      {/* Кнопка съёмки — над safe area, не перекрывается bottom bar */}
      <div className="flex h-32 items-center justify-center bg-black pb-safe">
        {/* Скрытый input, который открывает нативную камеру */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={handleOpen}
          aria-label="Сфотографировать чек"
          className="flex size-20 items-center justify-center rounded-full border-4 border-white bg-white/20 active:bg-white/40 transition-colors"
        >
          <div className="size-14 rounded-full bg-white" />
        </button>
      </div>
    </div>
  );
};
