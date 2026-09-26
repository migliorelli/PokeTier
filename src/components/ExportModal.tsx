import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Download, Loader2, Sparkles, X } from 'lucide-react';
import { downloadDataUrl, exportTierListToImage } from '../services/imageExportService';
import { TierList } from '../types/pokemon';

interface ExportModalProps {
  isOpen: boolean;
  tierList: TierList;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  tierList,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [includeEmpty, setIncludeEmpty] = useState(false);
  const [scale, setScale] = useState(2);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setPreviewUrl(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    exportTierListToImage(tierList, {
      includeEmptyTiers: includeEmpty,
      scale,
    })
      .then(url => {
        if (isMounted) {
          setPreviewUrl(url);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Erro ao gerar imagem.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, tierList, includeEmpty, scale]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!previewUrl) return;
    const safeTitle = tierList.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadDataUrl(previewUrl, `tierlist-${safeTitle}.png`);

    confetti({
      particleCount: 50,
      spread: 60,
      colors: ['#e06c75', '#ffffff', '#888888'],
      origin: { y: 0.6 },
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#181818] rounded w-full max-w-3xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="p-3.5 bg-[#141414] border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#e06c75]" />
            <h2 className="text-sm font-bold text-neutral-100">
              Exportar Tier List (PNG)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#222222] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-[#141414] rounded text-xs">
            <label className="flex items-center gap-2 text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeEmpty}
                onChange={(e) => setIncludeEmpty(e.target.checked)}
                className="accent-[#e06c75]"
              />
              <span>Incluir níveis vazios</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Resolução:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScale(s)}
                    className={`px-2 py-0.5 rounded font-mono text-xs transition-colors ${
                      scale === s
                        ? 'bg-[#e06c75] text-[#121212] font-bold'
                        : 'bg-[#202020] text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Container */}
          <div className="w-full min-h-[260px] max-h-[50vh] overflow-auto bg-[#121212] rounded flex items-center justify-center p-3">
            {loading ? (
              <div className="flex flex-col items-center gap-2 text-neutral-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-[#e06c75]" />
                <span>Gerando imagem...</span>
              </div>
            ) : error ? (
              <div className="text-center p-4 text-[#e06c75] text-xs">
                {error}
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="Prévia do Tier List"
                className="max-w-full h-auto rounded"
              />
            ) : null}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#222222]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-[#202020] rounded transition-colors"
            >
              Fechar
            </button>
            <button
              type="button"
              disabled={!previewUrl || loading}
              onClick={handleDownload}
              className="px-4 py-1.5 text-xs font-bold text-[#121212] bg-[#e06c75] hover:bg-[#d05b64] disabled:opacity-20 disabled:pointer-events-none rounded transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
