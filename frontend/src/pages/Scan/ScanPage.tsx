import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CameraIcon, UploadIcon, SparklesIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { PageHeader } from '../../components/layout/PageHeader';
import { supabase } from '../../lib/supabase';
import { useExpensesStore } from '../../store/expensesStore';
import { ROUTES } from '../../constants/routes';

interface ScanResult {
  success: boolean;
  message: string;
  amount?: number;
  demoMode?: boolean;
}

export default function ScanPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { fetchExpenses } = useExpensesStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
      // Сбрасываем value чтобы можно было выбрать тот же файл повторно
      e.target.value = '';
    }
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setScanResult(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setScanResult({ success: false, message: t('scan.notAuthorized') });
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/v1/scan/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      const amount = result.amount || 0;
      const categoryId = result.category_id || 'other';
      const expenseDate = result.date || new Date().toISOString().split('T')[0];
      const description = result.description || t('scan.scanReceipt');
      const isDemo = result.demo_mode === true;

      const insertData = {
        user_id: session.user.id,
        amount: amount,
        category_id: categoryId,
        date: expenseDate,
        description: description,
        ai_categorized: true
      };
      
      console.log('Inserting expense:', insertData);
      
      const { data: insertResult, error } = await supabase
        .from('expenses')
        .insert(insertData)
        .select()
        .single();
        
      console.log('Insert result:', insertResult, 'Error:', error);
        
      if (error) {
        console.error('Failed to save expense:', error);
        setScanResult({ success: false, message: `${t('scan.saveError')}: ${error.message}` });
        return;
      }
      
      if (!insertResult) {
        console.error('No data returned after insert');
        setScanResult({ success: false, message: t('scan.expenseNotSaved') });
        return;
      }
      
      await fetchExpenses();
      
      const currencySymbol = result.currency === 'KZT' ? '₸' : '₽';
      const demoNote = isDemo ? ` ${t('scan.demoModeNote')}` : '';
      
      setScanResult({
        success: true,
        message: t('scan.receiptAdded', { amount: amount.toLocaleString(), currency: currencySymbol }) + demoNote,
        amount,
        demoMode: isDemo
      });
      
    } catch (err: unknown) {
      console.error("Scan error:", err);
      const errorMessage = err instanceof Error ? err.message : t('scan.couldNotRecognize');
      setScanResult({ success: false, message: errorMessage });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-28">
      <PageHeader title={t('scan.title')} />
      
      <div className="mt-4 flex flex-col items-center justify-center space-y-6">
        
        {/* Status Indicator */}
        {scanResult && (
          <div className={`w-full max-w-sm rounded-2xl p-4 ${
            scanResult.success 
              ? 'bg-green-500/10 border border-green-500/30' 
              : 'bg-red-500/10 border border-red-500/30'
          }`}>
            <div className="flex items-center gap-3">
              {scanResult.success ? (
                <CheckCircleIcon className="text-green-500 shrink-0" size={24} />
              ) : (
                <AlertCircleIcon className="text-red-500 shrink-0" size={24} />
              )}
              <p className={`text-sm ${scanResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {scanResult.message}
              </p>
            </div>
            {scanResult.success && (
              <Button 
                variant="outline" 
                className="w-full mt-3 rounded-xl"
                onClick={() => navigate(ROUTES.EXPENSES)}
              >
                {t('scan.viewExpenses')}
              </Button>
            )}
          </div>
        )}

        {/* Animated AI Pulse Container */}
        {!scanResult && (
          <div className="relative flex size-48 items-center justify-center rounded-full bg-primary/10">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75 duration-3000" />
            <div className="absolute inset-4 animate-ping rounded-full bg-primary/30 opacity-50 duration-2000" />
            
            <div className="relative z-10 flex size-32 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/80 shadow-2xl shadow-primary/40">
              {isProcessing ? (
                <SparklesIcon size={48} className="animate-pulse text-white" />
              ) : (
                <CameraIcon size={48} className="text-white" />
              )}
            </div>
          </div>
        )}

        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">
            {isProcessing ? t('scan.processing') : scanResult?.success ? t('scan.done') : t('scan.smartScanner')}
          </h2>
          <p className="text-muted-foreground px-4">
            {isProcessing 
              ? t('scan.analyzingReceipt')
              : t('scan.pointCameraAtReceipt')}
          </p>
        </div>

        {!isProcessing && !scanResult?.success && (
          <div className="w-full max-w-sm space-y-4 pt-4">
            {/* Скрытые input-ы — открывают камеру/галерею системным диалогом */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <Button 
              size="lg" 
              className="w-full h-14 rounded-2xl text-lg shadow-lg shadow-primary/25"
              onClick={() => cameraInputRef.current?.click()}
            >
              <CameraIcon className="mr-2" size={24} />
              {t('scan.takePhoto')}
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-14 rounded-2xl text-lg border-2"
              onClick={() => galleryInputRef.current?.click()}
            >
              <UploadIcon className="mr-2" size={24} />
              {t('scan.chooseFromGallery')}
            </Button>
          </div>
        )}

        {scanResult?.success && (
          <Button 
            size="lg" 
            className="w-full max-w-sm h-14 rounded-2xl text-lg shadow-lg shadow-primary/25"
            onClick={() => {
              setScanResult(null);
              setIsProcessing(false);
            }}
          >
            <CameraIcon className="mr-2" size={24} />
            {t('scan.scanAgain')}
          </Button>
        )}
      </div>
    </div>
  );
}
