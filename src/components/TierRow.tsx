import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit3, Trash2 } from 'lucide-react';
import { ImageStyle, Pokemon, Tier } from '../types/pokemon';
import { PokemonCard } from './PokemonCard';

interface TierRowProps {
  tier: Tier;
  index: number;
  totalTiers: number;
  imageStyle?: ImageStyle;
  showShiny?: boolean;
  onMoveTier: (index: number, direction: 'up' | 'down') => void;
  onEditTier: (tier: Tier) => void;
  onClearTier: (tierId: string) => void;
  onDropPokemon: (pokemonId: number, targetTierId: string, insertIndex?: number) => void;
  onRemovePokemonFromTier: (pokemonId: number, tierId: string) => void;
  onSelectPokemon: (pokemon: Pokemon) => void;
}

export const TierRow: React.FC<TierRowProps> = ({
  tier,
  index,
  totalTiers,
  imageStyle = 'artwork',
  showShiny = false,
  onMoveTier,
  onEditTier,
  onClearTier,
  onDropPokemon,
  onRemovePokemonFromTier,
  onSelectPokemon,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);

  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleContainerDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDropIndicatorIndex(null);
    }
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const targetIdx = dropIndicatorIndex !== null ? dropIndicatorIndex : undefined;
    setDropIndicatorIndex(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data && typeof data.pokemonId === 'number') {
        onDropPokemon(data.pokemonId, tier.id, targetIdx);
      }
    } catch (err) {
      console.error('Failed to parse drag data:', err);
    }
  };

  const handleItemDragOver = (e: React.DragEvent, itemIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    // If cursor is on left half of card, target is before this card (itemIndex)
    // If cursor is on right half, target is after this card (itemIndex + 1)
    const targetIndex = e.clientX < midX ? itemIndex : itemIndex + 1;
    setDropIndicatorIndex(targetIndex);
  };

  const handleItemDrop = (e: React.DragEvent, itemIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const rect = e.currentTarget.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const targetIndex = e.clientX < midX ? itemIndex : itemIndex + 1;
    setDropIndicatorIndex(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data && typeof data.pokemonId === 'number') {
        onDropPokemon(data.pokemonId, tier.id, targetIndex);
      }
    } catch (err) {
      console.error('Failed to parse drag data:', err);
    }
  };

  return (
    <div
      className={`relative flex flex-col sm:flex-row items-stretch transition-colors ${
        isDragOver ? 'bg-[#221c1d]' : 'bg-[#181818]'
      }`}
    >
      {/* Flat Left Tier Header */}
      <div
        className="w-full sm:w-28 md:w-32 shrink-0 flex sm:flex-col items-center justify-between sm:justify-center p-2 relative select-none"
        style={{ backgroundColor: tier.color }}
      >
        <div className="flex items-center sm:flex-col sm:justify-center gap-1.5 text-center w-full">
          <span
            className="text-base sm:text-lg font-bold tracking-tight text-white break-words max-w-[110px] leading-tight"
          >
            {tier.label}
          </span>
          <span className="text-[10px] font-mono text-white/90 bg-black/25 px-1.5 py-0.2 rounded">
            {tier.pokemonIds.length}
          </span>
        </div>

        {/* Flat Controls */}
        <div className="flex items-center gap-1 sm:mt-1.5 bg-black/20 p-0.5 rounded">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMoveTier(index, 'up')}
            title="Mover para cima"
            className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded disabled:opacity-20 disabled:pointer-events-none transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={index === totalTiers - 1}
            onClick={() => onMoveTier(index, 'down')}
            title="Mover para baixo"
            className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded disabled:opacity-20 disabled:pointer-events-none transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onEditTier(tier)}
            title="Editar nível"
            className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          {tier.pokemonIds.length > 0 && (
            <button
              type="button"
              onClick={() => onClearTier(tier.id)}
              title="Limpar Pokémon deste nível"
              className="p-1 text-white/80 hover:text-white hover:bg-[#e06c75] rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Drop Area with raw PNGs - heights match row base, supports reordering */}
      <div
        onDragOver={handleContainerDragOver}
        onDragLeave={handleContainerDragLeave}
        onDrop={handleContainerDrop}
        className={`flex-1 min-h-[76px] sm:min-h-[84px] p-1.5 flex flex-wrap gap-1 items-center content-center transition-colors ${
          isDragOver ? 'bg-[#221c1d]' : 'bg-[#181818]'
        }`}
      >
        {tier.pokemonIds.length === 0 ? (
          <div className="w-full h-full min-h-[64px] flex items-center justify-center text-xs text-neutral-600 select-none px-4 text-center">
            {isDragOver ? (
              <span className="text-[#e06c75] font-medium">Solte o Pokémon aqui</span>
            ) : (
              <span>Vazio</span>
            )}
          </div>
        ) : (
          tier.pokemonIds.map((pid, idx) => (
            <div
              key={`${tier.id}-${pid}`}
              className="relative flex items-center"
              onDragOver={(e) => handleItemDragOver(e, idx)}
              onDrop={(e) => handleItemDrop(e, idx)}
            >
              {/* Insertion line indicator before this item */}
              {dropIndicatorIndex === idx && (
                <div className="absolute -left-1 top-1 bottom-1 w-1 bg-[#e06c75] rounded-full z-40 pointer-events-none shadow-[0_0_8px_rgba(224,108,117,0.8)]" />
              )}

              <PokemonCard
                pokemonId={pid}
                sourceTierId={tier.id}
                imageStyle={imageStyle}
                showShiny={showShiny}
                compact
                onSelect={onSelectPokemon}
                onRemoveFromTier={(id) => onRemovePokemonFromTier(id, tier.id)}
              />

              {/* Insertion line indicator after this item if it's the last item */}
              {dropIndicatorIndex === idx + 1 && idx === tier.pokemonIds.length - 1 && (
                <div className="absolute -right-1 top-1 bottom-1 w-1 bg-[#e06c75] rounded-full z-40 pointer-events-none shadow-[0_0_8px_rgba(224,108,117,0.8)]" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
