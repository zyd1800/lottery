import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Image as ImageIcon, X, Upload, Palette } from 'lucide-react';

interface LogoUploadProps {
  logo: string | null;
  onUpload: (logo: string | null) => void;
  background: string | null;
  onBackgroundUpload: (background: string | null) => void;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ logo, onUpload, background, onBackgroundUpload }) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpload(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onBackgroundUpload(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black border border-yellow-400 rounded-lg transition-all"
      >
        <Palette className="w-5 h-5" />
        <span className="text-sm font-bold">品牌设置</span>
      </button>

      {showOptions && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-start justify-end p-4">
          <div className="w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-white/10 p-4">
            <h4 className="font-bold dark:text-white text-gray-800 mb-3">品牌自定义</h4>
            
            <div className="space-y-4">
              {/* Logo 上传 */}
              <div>
                <label className="block text-sm dark:text-white/60 text-gray-500 mb-2">Logo</label>
                {logo ? (
                  <div className="relative group">
                    <img src={logo} alt="Company Logo" className="h-16 w-auto object-contain mb-2" />
                    <button
                      onClick={() => onUpload(null)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-4 py-2 bg-white/5 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-lg cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-all">
                    <Upload className="w-4 h-4 text-gray-400 dark:text-white/40" />
                    <span className="text-sm text-gray-500 dark:text-white/60">上传 Logo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                )}
              </div>

              {/* 背景图上传 */}
              <div>
                <label className="block text-sm dark:text-white/60 text-gray-500 mb-2">背景图</label>
                {background ? (
                  <div className="relative group">
                    <div className="h-20 bg-cover bg-center rounded-lg mb-2" style={{ backgroundImage: `url(${background})` }} />
                    <button
                      onClick={() => onBackgroundUpload(null)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-4 py-2 bg-white/5 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-lg cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-all">
                    <Upload className="w-4 h-4 text-gray-400 dark:text-white/40" />
                    <span className="text-sm text-gray-500 dark:text-white/60">上传背景图</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleBackgroundUpload} />
                  </label>
                )}
              </div>

              <button
                onClick={() => setShowOptions(false)}
                className="w-full py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-all"
              >
                关闭
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
