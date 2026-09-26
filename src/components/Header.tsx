import React from 'react';
import {
  Download,
  FolderOpen,
  Plus
} from 'lucide-react';
import { TierList } from '../types/pokemon';

interface HeaderProps {
  activeTierList: TierList;
  tierLists: TierList[];
  onSelectRank: (id: string) => void;
  onOpenCreateRankModal: () => void;
  onOpenManageRanksModal: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTierList,
  tierLists,
  onSelectRank,
  onOpenCreateRankModal,
  onOpenManageRanksModal,
  onOpenExportModal,
}) => {
  const totalRanked = activeTierList.tiers.reduce((acc, t) => acc + t.pokemonIds.length, 0);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#161616] border-b border-[#222222] px-4 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Active Rank Selector (No site name) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#202020] px-2.5 py-1 rounded">
            <span className="text-neutral-500 font-medium text-xs whitespace-nowrap">Rank:</span>
            <select
              value={activeTierList.id}
              onChange={(e) => onSelectRank(e.target.value)}
              aria-label="Selecionar Rank"
              className="bg-transparent text-neutral-200 text-xs font-semibold focus:outline-none cursor-pointer max-w-[220px] truncate"
            >
              {tierLists.map(tl => (
                <option key={tl.id} value={tl.id} className="bg-[#181818] text-neutral-200">
                  {tl.title}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-neutral-500 font-mono text-[11px]">
            <span>{totalRanked} ranqueados</span>
            <span aria-hidden="true">·</span>
            <span>{activeTierList.tiers.length} níveis</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenManageRanksModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-100 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#e06c75]" />
            <span className="hidden sm:inline">Ranks ({tierLists.length})</span>
          </button>

          <button
            type="button"
            onClick={onOpenExportModal}
            title="Exportar imagem do Tier List"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-300 bg-[#222222] hover:bg-[#282828] rounded transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-[#e06c75]" />
            <span>Exportar PNG</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateRankModal}
            title="Criar novo rank"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#121212] bg-[#e06c75] hover:bg-[#d05b64] rounded transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Rank</span>
          </button>
        </div>
      </div>
    </header>
  );
};
