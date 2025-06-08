import React, { useState, useCallback, useEffect, useRef } from 'react';
import { InputField } from './components/InputField';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { useUtmUrl } from './hooks/useUtmUrl';

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
    <path d="M7 3.5A1.5 1.5 0 018.5 2h5A1.5 1.5 0 0115 3.5v10a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 017 13.5V12h1.5v1.5a.5.5 0 00.5.5h5a.5.5 0 00.5-.5v-10a.5.5 0 00-.5-.5h-5a.5.5 0 00-.5.5V5H7V3.5z" />
    <path d="M3.5 6A1.5 1.5 0 002 7.5v10A1.5 1.5 0 003.5 19h7a1.5 1.5 0 001.5-1.5V18H11v-.5a.5.5 0 00-.5-.5h-7a.5.5 0 00-.5.5v.5H3.5A.5.5 0 013 17.5v-10A.5.5 0 013.5 7H5V6H3.5z" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);


const App: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [utmSource, setUtmSource] = useState<string>('');
  const [utmMedium, setUtmMedium] = useState<string>('');
  const [utmCampaign, setUtmCampaign] = useState<string>('');
  
  const [qrCodeValue, setQrCodeValue] = useState<string>('');
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [isUrlCopied, setIsUrlCopied] = useState<boolean>(false);

  const { generatedUrl } = useUtmUrl(baseUrl, utmSource, utmMedium, utmCampaign);
  const qrCodeSectionRef = useRef<HTMLDivElement>(null);

  const handleGenerateQrCode = useCallback(() => {
    if (generatedUrl) {
      setQrCodeValue(generatedUrl);
      setShowQrCode(true);
      // Scroll will be handled by useEffect watching showQrCode
    } else {
      setShowQrCode(false);
      alert("有効なベースURLを入力してQRコードを生成してください。");
    }
  }, [generatedUrl]);

  useEffect(() => {
    if (showQrCode && qrCodeSectionRef.current) {
      const timer = setTimeout(() => { // Timeout to ensure DOM is updated
        qrCodeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showQrCode, qrCodeValue]); // Depend on qrCodeValue as well to re-scroll if it changes while shown


  const handleCopyUrl = useCallback(async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setIsUrlCopied(true);
    } catch (err) {
      console.error('URLのコピーに失敗しました:', err);
      alert('URLのコピーに失敗しました。');
    }
  }, [generatedUrl]);

  useEffect(() => {
    if (isUrlCopied) {
      const timer = setTimeout(() => {
        setIsUrlCopied(false);
      }, 2000); // 2秒後にメッセージをリセット
      return () => clearTimeout(timer);
    }
  }, [isUrlCopied]);

  const isGenerateButtonDisabled = !baseUrl.trim();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-3xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-amber-500">UTM QR Code Generator</h1>
          <p className="text-slate-600 mt-2 text-lg">
            追跡用URLを簡単に作成し、ダウンロード可能なQRコードを生成します。
          </p>
        </header>

        <section className="bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-amber-500 border-b border-gray-200 pb-3">
            1. URLとUTMパラメータを入力
          </h2>
          <div className="space-y-6">
            <InputField
              id="baseUrl"
              label="ベースURL"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://example.com"
              type="url"
            />
            <InputField
              id="utmSource"
              label="UTM Source (参照元)"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              placeholder="例: google, newsletter"
            />
            <InputField
              id="utmMedium"
              label="UTM Medium (メディア)"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
              placeholder="例: cpc, email, social"
            />
            <InputField
              id="utmCampaign"
              label="UTM Campaign (キャンペーン)"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              placeholder="例: summer_sale, product_launch"
            />
          </div>
        </section>

        {generatedUrl && (
          <section className="bg-white p-6 rounded-xl shadow-xl mb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-amber-500">生成されたURL:</h2>
              <button
                onClick={handleCopyUrl}
                className={`flex items-center justify-center text-sm font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75
                  ${isUrlCopied 
                    ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400' 
                    : 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-400 hover:scale-105 active:scale-95'}`}
                aria-live="polite"
              >
                {isUrlCopied ? (
                  <>
                    <CheckIcon className="w-4 h-4 mr-1.5" />
                    コピーしました！
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-4 h-4 mr-1.5" />
                    URLをコピー
                  </>
                )}
              </button>
            </div>
            <div 
              className="bg-slate-100 p-4 rounded-md text-amber-700 break-all text-sm shadow-inner"
              aria-label="Generated URL"
            >
              {generatedUrl}
            </div>
          </section>
        )}

        <section className="text-center mb-8">
          <button
            onClick={handleGenerateQrCode}
            disabled={isGenerateButtonDisabled}
            className={`w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75
              ${isGenerateButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
            aria-label={showQrCode && qrCodeValue === generatedUrl ? 'QRコードを更新' : 'QRコードを生成'}
          >
            {showQrCode && qrCodeValue === generatedUrl ? 'QRコードを更新' : 'QRコードを生成'}
          </button>
        </section>
        
        <div ref={qrCodeSectionRef}>
          {showQrCode && qrCodeValue && (
            <QRCodeDisplay 
              url={qrCodeValue} 
              baseUrl={baseUrl} 
              utmCampaign={utmCampaign} 
            />
          )}
        </div>
        
        <footer className="text-center text-slate-500 mt-12 py-6 border-t border-gray-200">
          <p className="text-xs mb-2">QRコードは(株)デンソーウェーブの登録商標です。</p>
          <p className="text-sm">&copy; 2025 KUON</p>
        </footer>
      </div>
    </div>
  );
};

export default App;