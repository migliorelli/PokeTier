import React, { useEffect, useState } from 'react';
import {
  FolderOpen,
  Plus,
  RotateCcw
} from 'lucide-react';
import { ImageStyle, Pokemon, Tier, TierList } from '../types/pokemon';
import { TierRow } from './TierRow';

interface TierListBoardProps {
  activeTierList: TierList;
  tierLists: TierList[];
  imageStyle: ImageStyle;
  showShiny: boolean;
  onSelectRank: (id: string) => void;
  onMoveTier: (index: number, direction: 'up' | 'down') => void;
  onEditTier: (tier: Tier) => void;
  onAddTier: () => void;
  onClearTier: (tierId: string) => void;
  onClearAllTiers: () => void;
  onDropPokemon: (pokemonId: number, targetTierId: string, insertIndex?: number) => void;
  onRemovePokemonFromTier: (pokemonId: number, tierId: string) => void;
  onSelectPokemon: (pokemon: Pokemon) => void;
  onOpenManageRanks: () => void;
}

export const TierListBoard: React.FC<TierListBoardProps> = ({
  activeTierList,
  tierLists,
  imageStyle,
  showShiny,
  onSelectRank,
  onMoveTier,
  onEditTier,
  onAddTier,
  onClearTier,
  onClearAllTiers,
  onDropPokemon,
  onRemovePokemonFromTier,
  onSelectPokemon,
  onOpenManageRanks,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const totalRanked = activeTierList.tiers.reduce((acc, t) => acc + t.pokemonIds.length, 0);

  useEffect(() => {
    if (confirmClear) {
      const timer = setTimeout(() => setConfirmClear(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [confirmClear]);

  const handleClearClick = () => {
    if (confirmClear) {
      onClearAllTiers();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  return (
    <div className="space-y-2">
      {/* Board Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-[#181818] rounded">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-neutral-100 tracking-tight">
              {activeTierList.title}
            </h1>
            <span className="text-[10px] font-mono text-[#e06c75] bg-[#221c1d] px-2 py-0.5 rounded shrink-0">
              {activeTierList.tiers.length} Níveis
            </span>
          </div>
          {activeTierList.description && (
            <p className="text-xs text-neutral-400 mt-0.5">
              {activeTierList.description}
            </p>
          )}
        </div>

        {/* Mobile Rank Selector & Fast Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile dropdown */}
          <div className="md:hidden flex-1 sm:flex-none">
            <select
              value={activeTierList.id}
              onChange={(e) => onSelectRank(e.target.value)}
              aria-label="Selecionar Rank"
              className="w-full bg-[#222222] text-neutral-200 rounded px-2.5 py-1 text-xs font-medium cursor-pointer outline-none"
            >
              {tierLists.map(tl => (
                <option key={tl.id} value={tl.id}>
                  {tl.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onOpenManageRanks}
            title="Gerenciar lista de ranks"
            className="md:hidden p-1.5 bg-[#222222] hover:bg-[#282828] text-neutral-300 rounded"
          >
            <FolderOpen className="w-4 h-4 text-[#e06c75]" />
          </button>

          {/* Add Tier */}
          <button
            type="button"
            onClick={onAddTier}
            title="Adicionar nível"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#222222] hover:bg-[#282828] text-neutral-200 rounded text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#e06c75]" />
            <span>Adicionar Nível</span>
          </button>

          {/* Clear All - with direct inline confirm, no window.confirm! */}
          {totalRanked > 0 && (
            <button
              type="button"
              onClick={handleClearClick}
              title={confirmClear ? 'Clique para confirmar a limpeza' : 'Limpar todos os Pokémon deste rank'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                confirmClear
                  ? 'bg-[#e06c75] text-[#121212] font-bold'
                  : 'bg-[#281e20] hover:bg-[#342225] text-[#e06c75]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{confirmClear ? 'Confirmar Limpeza?' : 'Limpar Rank'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tier Rows List */}
      <div className="flex flex-col gap-1">
        {activeTierList.tiers.map((tier, index) => (
          <TierRow
            key={tier.id}
            tier={tier}
            index={index}
            totalTiers={activeTierList.tiers.length}
            imageStyle={imageStyle}
            showShiny={showShiny}
            onMoveTier={onMoveTier}
            onEditTier={onEditTier}
            onClearTier={onClearTier}
            onDropPokemon={onDropPokemon}
            onRemovePokemonFromTier={onRemovePokemonFromTier}
            onSelectPokemon={onSelectPokemon}
          />
        ))}
      </div>
    </div>
  );
};
