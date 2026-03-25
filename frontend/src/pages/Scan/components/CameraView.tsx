import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { XIcon, CameraIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface CameraViewProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export const CameraView = ({ onCapture, onCancel }: CameraViewProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  const handleOpen = () => {
    inputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex h-16 items-center justify-between px-4 pt-safe">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-white hover:bg-white/20"
        >
          <XIcon size={24} />
        </Button>
        <span className="text-sm font-medium text-white">{t('scan.takePhoto')}</span>
        <div className="w-10" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-8">
        <div className="w-full max-w-xs aspect-3/4 rounded-2xl border-2 border-dashed border-white/60 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-white/70">
            <CameraIcon size={48} />
            <p className="text-sm text-center">{t('scan.pointCameraAtReceipt')}</p>
          </div>
        </div>
      </div>

      <div className="flex h-32 items-center justify-center bg-black pb-safe">
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
          aria-label={t('scan.takePhoto')}
          className="flex size-20 items-center justify-center rounded-full border-4 border-white bg-white/20 active:bg-white/40 transition-colors"
        >
          <div className="size-14 rounded-full bg-white" />
        </button>
      </div>
    </div>
  );
};
