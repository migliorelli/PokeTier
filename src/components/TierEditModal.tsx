import React, { useEffect, useState } from 'react';
import { Palette, Trash2, X } from 'lucide-react';
import { PRESET_TIER_COLORS } from '../data/defaultTiers';
import { Tier } from '../types/pokemon';

interface TierEditModalProps {
  tier: Tier | null;
  canDelete?: boolean;
  onClose: () => void;
  onSave: (updated: Tier) => void;
  onDeleteTier: (tierId: string) => void;
}

export const TierEditModal: React.FC<TierEditModalProps> = ({
  tier,
  canDelete = true,
  onClose,
  onSave,
  onDeleteTier,
}) => {
  const [label, setLabel] = useState(tier?.label || '');
  const [color, setColor] = useState(tier?.color || '#EF4444');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (tier) {
      setLabel(tier.label);
      setColor(tier.color);
      setConfirmDelete(false);
    }
  }, [tier]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!tier) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    onSave({
      ...tier,
      label: label.trim(),
      color,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDeleteTier(tier.id);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#181818] rounded w-full max-w-sm overflow-hidden my-8"
      >
        {/* Header */}
        <div className="p-3.5 bg-[#141414] border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#e06c75]" />
            <h2 className="text-sm font-bold text-neutral-100">
              Editar Nível
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {/* Label */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              Nome do Nível
            </label>
            <input
              type="text"
              required
              maxLength={20}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: S+, S, A..."
              className="w-full bg-[#141414] border-0 rounded px-3 py-2 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#e06c75]"
            />
          </div>

          {/* Color Preview */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Cor do Nível
            </label>
            <div className="flex items-center gap-2 mb-2.5">
              <div
                className="w-9 h-9 rounded flex items-center justify-center font-bold text-white text-sm"
                style={{ backgroundColor: color }}
              >
                {label || 'S'}
              </div>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="font-mono text-xs text-neutral-400 uppercase">
                {color}
              </span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_TIER_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 rounded transition-transform ${
                    color === c ? 'ring-2 ring-white scale-105' : 'hover:opacity-90'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#222222]">
            {canDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${
                  confirmDelete
                    ? 'bg-[#e06c75] text-[#121212]'
                    : 'bg-[#281e20] text-[#e06c75] hover:bg-[#342225]'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmDelete ? 'Confirmar?' : 'Excluir Nível'}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-[#202020] rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-[#121212] bg-[#e06c75] hover:bg-[#d05b64] rounded transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
