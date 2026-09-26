import React, { useEffect, useRef, useState } from 'react';
import {
  Copy,
  Download,
  FolderOpen,
  Plus,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { exportBackupJSON, importBackupJSON } from '../services/storageService';
import { TierList } from '../types/pokemon';

interface ManageRanksModalProps {
  isOpen: boolean;
  tierLists: TierList[];
  activeId: string;
  onClose: () => void;
  onSelectRank: (id: string) => void;
  onOpenCreateModal: () => void;
  onDuplicateRank: (id: string) => void;
  onDeleteRank: (id: string) => void;
  onImportBackup: (imported: TierList[]) => void;
}

export const ManageRanksModal: React.FC<ManageRanksModalProps> = ({
  isOpen,
  tierLists,
  activeId,
  onClose,
  onSelectRank,
  onOpenCreateModal,
  onDuplicateRank,
  onDeleteRank,
  onImportBackup,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setConfirmDeleteId(null);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    const json = exportBackupJSON(tierLists);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `poketier-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = importBackupJSON(content);
        if (imported && imported.length > 0) {
          onImportBackup(imported);
          onClose();
        } else {
          setImportError('Arquivo JSON inválido.');
        }
      } catch {
        setImportError('Erro ao ler arquivo.');
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      onDeleteRank(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#181818] rounded w-full max-w-xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="p-4 bg-[#141414] border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-[#e06c75]" />
            <h2 className="text-sm font-bold text-neutral-100">
              Meus Ranks
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

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3 max-h-[65vh] overflow-y-auto">
          {importError && (
            <div className="p-2.5 bg-[#281e20] text-[#e06c75] rounded text-xs">
              {importError}
            </div>
          )}

          {/* Ranks list */}
          <div className="space-y-1.5">
            {tierLists.map(tl => {
              const isActive = tl.id === activeId;
              const totalRanked = tl.tiers.reduce((acc, t) => acc + t.pokemonIds.length, 0);
              const totalEligible = tl.eligiblePokemonIds.length;
              const isConfirming = confirmDeleteId === tl.id;

              return (
                <div
                  key={tl.id}
                  className={`p-3 rounded transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-[#202020]'
                      : 'bg-[#141414] hover:bg-[#1c1c1c]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-neutral-200 truncate">
                        {tl.title}
                      </h3>
                      {isActive && (
                        <span className="text-[9px] font-bold bg-[#e06c75] text-[#121212] px-1.5 py-0.2 rounded shrink-0">
                          Ativo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500 font-mono">
                      <span>{totalRanked}/{totalEligible} ranqueados</span>
                      <span>·</span>
                      <span>{tl.tiers.length} níveis</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectRank(tl.id);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-[#282828] hover:bg-[#323232] text-neutral-200 text-xs font-medium rounded transition-colors"
                      >
                        Abrir
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDuplicateRank(tl.id)}
                      title="Duplicar"
                      className="p-1.5 bg-[#222222] hover:bg-[#282828] text-neutral-400 hover:text-white rounded transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {tierLists.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDelete(tl.id)}
                        title={isConfirming ? 'Clique para confirmar exclusão' : 'Excluir'}
                        className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
                          isConfirming
                            ? 'bg-[#e06c75] text-[#121212] font-bold text-xs px-2'
                            : 'bg-[#281e20] hover:bg-[#342225] text-[#e06c75]'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {isConfirming && <span>Confirmar?</span>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Backup & Import section */}
          <div className="pt-3 border-t border-[#222222] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#222222] hover:bg-[#282828] text-neutral-300 rounded text-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#e06c75]" />
                <span>Exportar JSON</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#222222] hover:bg-[#282828] text-neutral-300 rounded text-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[#e06c75]" />
                <span>Restaurar</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCreateModal();
              }}
              className="flex items-center gap-1 px-3 py-1 bg-[#e06c75] hover:bg-[#d05b64] text-[#121212] text-xs font-bold rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Rank</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
