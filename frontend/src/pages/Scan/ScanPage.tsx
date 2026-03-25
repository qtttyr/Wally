import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CameraIcon, UploadIcon, SparklesIcon, CheckCircleIcon, 
  AlertCircleIcon, RotateCcwIcon, EditIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PageHeader } from '../../components/layout/PageHeader';
import { supabase } from '../../lib/supabase';
import { useExpensesStore } from '../../store/expensesStore';
import { ROUTES } from '../../constants/routes';
import { CATEGORIES } from '../../constants/categories';
import { preprocessImage, getConfidenceLevel, getConfidenceColor } from '../../lib/imageProcessing';

interface ScanItem {
  name: string;
  amount: number;
}

interface ScanResult {
  success: boolean;
  message?: string;
  description?: string;
  amount?: number;
  currency?: string;
  date?: string;
  category_id?: string;
  confidence?: number;
  items?: ScanItem[];
}

type ScanStep = 'capture' | 'preview' | 'processing' | 'result' | 'success';

export default function ScanPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { fetchExpenses } = useExpensesStore();
  
  const [step, setStep] = useState<ScanStep>('capture');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  
  const [editMode, setEditMode] = useState(false);
  const [editedResult, setEditedResult] = useState<ScanResult | null>(null);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setProcessedFile(file);
      setStep('preview');
      e.target.value = '';
    }
  };

  const handleRetake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setProcessedFile(null);
    setStep('capture');
  };

  const handleProcess = async () => {
    if (!processedFile) return;

    setStep('processing');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setScanResult({ success: false, message: t('scan.notAuthorized') });
        setStep('result');
        return;
      }

      const processedBlob = await preprocessImage(processedFile);
      const processedFileObj = new File([processedBlob], 'receipt.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', processedFileObj);

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
      
      setScanResult({
        success: true,
        description: result.description,
        amount: result.amount,
        currency: result.currency,
        date: result.date,
        category_id: result.category_id,
        confidence: result.confidence,
        items: result.items || []
      });
      setEditedResult({
        success: true,
        description: result.description,
        amount: result.amount,
        currency: result.currency,
        date: result.date,
        category_id: result.category_id,
        confidence: result.confidence,
        items: result.items || []
      });
      setStep('result');
      
    } catch (err: unknown) {
      console.error("Scan error:", err);
      const errorMessage = err instanceof Error ? err.message : t('scan.couldNotRecognize');
      setScanResult({ success: false, message: errorMessage });
      setStep('result');
    }
  };

  const handleSave = async () => {
    if (!editedResult || !editedResult.amount) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setScanResult({ success: false, message: t('scan.notAuthorized') });
        return;
      }

      const insertData = {
        user_id: session.user.id,
        amount: editedResult.amount,
        category_id: editedResult.category_id || 'other',
        date: editedResult.date || new Date().toISOString().split('T')[0],
        description: editedResult.description || t('scan.scanReceipt'),
        ai_categorized: true
      };

      const { error } = await supabase
        .from('expenses')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      await fetchExpenses();
      setStep('success');
      
    } catch (err: unknown) {
      console.error("Save error:", err);
      const errorMessage = err instanceof Error ? err.message : t('scan.saveError');
      setScanResult(prev => prev ? { ...prev, message: errorMessage } : null);
    }
  };

  const confidenceLevel = scanResult?.confidence ? getConfidenceLevel(scanResult.confidence) : null;
  const isEditable = confidenceLevel === 'medium' || confidenceLevel === 'low';

  const renderCapture = () => (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative flex size-48 items-center justify-center rounded-full bg-primary/10">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75 duration-3000" />
        <div className="absolute inset-4 animate-ping rounded-full bg-primary/30 opacity-50 duration-2000" />
        <div className="relative z-10 flex size-32 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/80 shadow-2xl shadow-primary/40">
          <CameraIcon size={48} className="text-white" />
        </div>
      </div>

      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">{t('scan.smartScanner')}</h2>
        <p className="text-muted-foreground px-4">{t('scan.pointCameraAtReceipt')}</p>
      </div>

      <div className="w-full max-w-sm space-y-4 pt-4">
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
    </div>
  );

  const renderPreview = () => (
    <div className="flex flex-col items-center space-y-6">
      {previewUrl && (
        <div className="w-full max-w-sm aspect-3/4 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-black" />
        </div>
      )}

      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">{t('scan.preview')}</h2>
        <p className="text-muted-foreground">{t('scan.previewDesc')}</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <Button 
          size="lg" 
          className="w-full h-14 rounded-2xl text-lg shadow-lg shadow-primary/25"
          onClick={handleProcess}
        >
          <SparklesIcon className="mr-2" size={24} />
          {t('scan.scanReceipt')}
        </Button>

        <Button 
          variant="outline" 
          size="lg" 
          className="w-full h-14 rounded-2xl text-lg border-2"
          onClick={handleRetake}
        >
          <RotateCcwIcon className="mr-2" size={24} />
          {t('scan.retake')}
        </Button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center space-y-6 py-10">
      <div className="relative flex size-32 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/30 opacity-75" />
        <div className="relative z-10 flex size-24 items-center justify-center rounded-full bg-primary">
          <SparklesIcon size={40} className="animate-pulse text-white" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('scan.processing')}</h2>
        <p className="text-muted-foreground">{t('scan.analyzingReceipt')}</p>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!scanResult) return null;

    if (!scanResult.success) {
      return (
        <div className="flex flex-col items-center space-y-6">
          <div className="w-full max-w-sm rounded-2xl p-6 bg-red-50 border border-red-200">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircleIcon className="text-red-500 shrink-0" size={28} />
              <p className="text-red-700 font-medium">{t('scan.error')}</p>
            </div>
            <p className="text-red-600 text-sm">{scanResult.message}</p>
          </div>
          
          <Button 
            size="lg" 
            className="w-full max-w-sm h-14 rounded-2xl text-lg"
            onClick={() => {
              setScanResult(null);
              setStep('capture');
            }}
          >
            {t('scan.tryAgain')}
          </Button>
        </div>
      );
    }

    const displayData = editMode ? editedResult : scanResult;
    const currencySymbol = displayData?.currency === 'KZT' ? '₸' : displayData?.currency === 'RUB' ? '₽' : '$';

    return (
      <div className="flex flex-col space-y-4">
        {confidenceLevel && (
          <div className={`flex items-center gap-2 rounded-xl p-3 border ${getConfidenceColor(confidenceLevel)}`}>
            {confidenceLevel === 'high' ? (
              <CheckCircleIcon size={20} />
            ) : confidenceLevel === 'medium' ? (
              <AlertCircleIcon size={20} />
            ) : (
              <AlertCircleIcon size={20} />
            )}
            <span className="text-sm font-medium">
              {confidenceLevel === 'high' ? t('scan.confidenceHigh') : 
               confidenceLevel === 'medium' ? t('scan.confidenceMediumCheck') : 
               t('scan.confidenceLowWarning')}
            </span>
          </div>
        )}

        <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">{t('scan.store')}</label>
              <Input
                value={displayData?.description || ''}
                onChange={(e) => setEditedResult(prev => prev ? { ...prev, description: e.target.value } : null)}
                disabled={!editMode}
                className="font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">{t('scan.amount')}</label>
                <Input
                  type="number"
                  value={displayData?.amount || 0}
                  onChange={(e) => setEditedResult(prev => prev ? { ...prev, amount: Number(e.target.value) } : null)}
                  disabled={!editMode}
                  className="font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t('scan.date')}</label>
                <Input
                  type="date"
                  value={displayData?.date || ''}
                  onChange={(e) => setEditedResult(prev => prev ? { ...prev, date: e.target.value } : null)}
                  disabled={!editMode}
                  className="font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">{t('scan.category')}</label>
              <select
                value={displayData?.category_id || 'other'}
                onChange={(e) => setEditedResult(prev => prev ? { ...prev, category_id: e.target.value } : null)}
                disabled={!editMode}
                className="w-full h-10 px-3 rounded-xl border bg-background text-sm"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{t(`categories.${cat.id}`)}</option>
                ))}
              </select>
            </div>
          </div>

          {displayData?.items && displayData.items.length > 0 && (
            <div className="border-t pt-3">
              <label className="text-xs text-muted-foreground">{t('scan.items')}</label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {displayData.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-medium">{item.amount.toLocaleString()} {currencySymbol}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-lg font-bold">{t('scan.total')}</span>
            <span className="text-2xl font-bold">
              {displayData?.amount?.toLocaleString() || 0} {currencySymbol}
            </span>
          </div>
        </div>

        {isEditable && !editMode && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setEditMode(true)}
          >
            <EditIcon className="mr-2" size={18} />
            {t('scan.editData')}
          </Button>
        )}

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 h-12 rounded-xl"
            onClick={handleRetake}
          >
            <RotateCcwIcon className="mr-2" size={18} />
            {t('scan.retake')}
          </Button>
          <Button 
            className="flex-1 h-12 rounded-xl text-lg"
            onClick={handleSave}
          >
            <CheckCircleIcon className="mr-2" size={20} />
            {t('scan.save')}
          </Button>
        </div>
      </div>
    );
  };

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center space-y-6 py-10">
      <div className="flex size-24 items-center justify-center rounded-full bg-green-100">
        <CheckCircleIcon size={48} className="text-green-600" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('scan.success')}</h2>
        <p className="text-muted-foreground">{t('scan.savedMessage')}</p>
      </div>
      <div className="w-full max-w-sm space-y-3">
        <Button 
          className="w-full h-12 rounded-xl"
          onClick={() => navigate(ROUTES.EXPENSES)}
        >
          {t('scan.viewExpenses')}
        </Button>
        <Button 
          variant="outline"
          className="w-full h-12 rounded-xl"
          onClick={() => {
            setStep('capture');
            setScanResult(null);
            setPreviewUrl(null);
            setProcessedFile(null);
            setEditMode(false);
          }}
        >
          <CameraIcon className="mr-2" size={20} />
          {t('scan.scanAgain')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4 pb-28 min-h-screen">
      {step !== 'success' && <PageHeader title={t('scan.title')} />}
      
      {step === 'capture' && renderCapture()}
      {step === 'preview' && renderPreview()}
      {step === 'processing' && renderProcessing()}
      {step === 'result' && renderResult()}
      {step === 'success' && renderSuccess()}
    </div>
  );
}
