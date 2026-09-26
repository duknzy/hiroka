import React, { useState } from 'react';
import { WallpaperSettings, processUploadedImage } from '../utils/wallpaperStorage';
import { Image as ImageIcon, X, Upload, Sliders, Trash2, Eye, Sun, Moon } from 'lucide-react';

interface WallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WallpaperSettings;
  onUpdateSettings: (newSettings: WallpaperSettings) => void;
  onClearWallpaper: () => void;
}

export const WallpaperModal: React.FC<WallpaperModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearWallpaper,
}) => {
  if (!isOpen) return null;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('画像ファイル（JPG, PNG, WebPなど）を選択してください。');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const dataUrl = await processUploadedImage(file);
      onUpdateSettings({
        ...settings,
        imageUrl: dataUrl,
      });
    } catch (err) {
      console.error(err);
      setError('画像の読み込みに失敗しました。');
    } finally {
      setUploading(false);
    }
  };

  const handleOpacityChange = (val: number) => {
    onUpdateSettings({
      ...settings,
      opacity: val,
    });
  };

  const handleBlurChange = (val: number) => {
    onUpdateSettings({
      ...settings,
      blur: val,
    });
  };

  const handleOverlayToggle = (overlay: 'light' | 'dark') => {
    onUpdateSettings({
      ...settings,
      overlay,
    });
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d1322] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/15 text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">背景壁紙のカスタマイズ</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2 mb-4">
          志望校のキャンパス写真やお気に入りの画像を壁紙に設定できます（画像はブラウザ内にローカル保存されます）。
        </p>

        {error && (
          <div className="mb-3 p-2.5 text-xs bg-rose-500/10 text-rose-300 rounded-xl border border-rose-500/30">
            {error}
          </div>
        )}

        {/* Upload Zone */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              画像のアップロード
            </label>
            <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-white/15 hover:border-indigo-400 rounded-2xl bg-slate-900/60 hover:bg-slate-900 transition-all cursor-pointer text-center">
              <Upload className="w-6 h-6 text-indigo-400 mb-1.5" />
              <span className="text-xs font-bold text-indigo-300">
                {uploading ? '画像を最適化中...' : '画像ファイルを選択 (クリックまたはドラッグ)'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                PNG, JPG, WebP (自動圧縮してローカル保存)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Current Wallpaper Preview & Controls */}
          {settings.imageUrl ? (
            <div className="space-y-4 pt-2 border-t border-white/10 text-xs">
              {/* Preview Thumbnail */}
              <div className="relative h-28 rounded-xl overflow-hidden border border-white/15">
                <img
                  src={settings.imageUrl}
                  alt="Wallpaper preview"
                  className="w-full h-full object-cover"
                  style={{
                    filter: `blur(${settings.blur}px)`,
                    opacity: settings.opacity + 0.2,
                  }}
                />
                <div
                  className={`absolute inset-0 ${
                    settings.overlay === 'dark' ? 'bg-black/60' : 'bg-slate-950/40'
                  }`}
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={onClearWallpaper}
                    className="p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg shadow-sm text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    title="壁紙を削除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    削除
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/80 text-white px-2 py-0.5 rounded border border-white/10">
                  PREVIEW
                </div>
              </div>

              {/* Opacity Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-300">画像の濃さ (不透明度)</span>
                  <span className="font-mono tabular-nums text-cyan-400 font-bold">
                    {Math.round(settings.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.04"
                  max="0.65"
                  step="0.01"
                  value={settings.opacity}
                  onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">
                  ※ 文字が見やすくなるよう薄め（10%〜25%）がおすすめです
                </span>
              </div>

              {/* Blur Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-300">ぼかし度 (すりガラス効果)</span>
                  <span className="font-mono tabular-nums text-cyan-400 font-bold">
                    {settings.blur}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={settings.blur}
                  onChange={(e) => handleBlurChange(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Overlay Tint */}
              <div>
                <span className="font-semibold text-slate-300 block mb-1.5">
                  オーバーレイの調光
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOverlayToggle('light')}
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      settings.overlay === 'light'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold shadow-sm shadow-indigo-500/20'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    明るい (ライト)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOverlayToggle('dark')}
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      settings.overlay === 'dark'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold shadow-sm shadow-indigo-500/20'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    落ち着いた (ダーク)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-slate-500">
              まだ壁紙が設定されていません。
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 rounded-xl cursor-pointer shadow-lg shadow-indigo-600/30 ring-1 ring-white/15"
            >
              設定を完了
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
