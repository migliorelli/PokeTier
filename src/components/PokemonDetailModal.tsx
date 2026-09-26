import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getPokemonFallbackImageUrl, getPokemonImageUrl } from '../data/pokemonDatabase';
import { GENERATIONS, POKEMON_TYPES, RARITIES } from '../data/pokemonTypes';
import { ImageStyle, Pokemon, Tier } from '../types/pokemon';

interface PokemonDetailModalProps {
  pokemon: Pokemon | null;
  tiers: Tier[];
  currentTierId?: string;
  imageStyle?: ImageStyle;
  onClose: () => void;
  onMoveToTier: (pokemonId: number, targetTierId: string) => void;
  onRemoveFromTier: (pokemonId: number) => void;
}

export const PokemonDetailModal: React.FC<PokemonDetailModalProps> = ({
  pokemon,
  tiers,
  currentTierId,
  imageStyle = 'artwork',
  onClose,
  onMoveToTier,
  onRemoveFromTier,
}) => {
  const [showShiny, setShowShiny] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!pokemon) return null;

  const imageUrl = imgError
    ? getPokemonFallbackImageUrl(pokemon.id)
    : getPokemonImageUrl(pokemon.id, imageStyle, showShiny);

  const genInfo = GENERATIONS.find(g => g.id === pokemon.gen);
  const rarityInfo = RARITIES.find(r => r.id === pokemon.rarity);

  const handleSelectTier = (tierId: string) => {
    onMoveToTier(pokemon.id, tierId);
    onClose();
  };

  const handleRemove = () => {
    onRemoveFromTier(pokemon.id);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#181818] rounded w-full max-w-md overflow-hidden my-8"
      >
        {/* Header */}
        <div className="p-3.5 bg-[#141414] border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#e06c75]">
              #{pokemon.id > 10000 ? `${pokemon.id}` : pokemon.id.toString().padStart(3, '0')}
            </span>
            <h2 className="text-sm font-bold text-neutral-100">
              {pokemon.displayName}
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
        <div className="p-4 space-y-4">
          {/* Visual Showcase */}
          <div className="relative w-full h-44 bg-[#141414] rounded flex items-center justify-center p-3">
            <img
              src={imageUrl}
              alt={pokemon.displayName}
              onError={() => setImgError(true)}
              className="max-h-full max-w-full object-contain filter"
            />
            {/* Shiny switch button */}
            <button
              type="button"
              onClick={() => setShowShiny(!showShiny)}
              className={`absolute bottom-2 right-2 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                showShiny
                  ? 'bg-[#e06c75] text-[#121212]'
                  : 'bg-[#222222] text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>{showShiny ? 'Shiny' : 'Normal'}</span>
            </button>
          </div>

          {/* Details Metadata - with actual type colors! */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#141414] rounded">
              <span className="text-neutral-500 block mb-1 text-[11px]">Tipos</span>
              <div className="flex flex-wrap gap-1">
                {pokemon.types.map(t => {
                  const tInfo = POKEMON_TYPES[t];
                  return (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        backgroundColor: tInfo?.color || '#333333',
                        color: tInfo?.textColor || '#ffffff',
                      }}
                    >
                      {tInfo?.namePt || t}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="p-2.5 bg-[#141414] rounded">
              <span className="text-neutral-500 block mb-1 text-[11px]">Origem</span>
              <p className="font-semibold text-neutral-200 text-xs">
                {genInfo ? `${genInfo.name} (${genInfo.region})` : `Gen ${pokemon.gen}`}
              </p>
              <p className="text-[10px] text-[#e06c75] mt-0.5">
                {rarityInfo ? rarityInfo.label : pokemon.rarity}
              </p>
            </div>
          </div>

          {/* Quick Tier Placement */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Mover para Nível
              </span>
              {currentTierId && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-xs text-[#e06c75] hover:underline"
                >
                  Remover do Rank
                </button>
              )}
            </div>

            {/* Flat Grid of Tiers */}
            <div className="grid grid-cols-5 gap-1.5">
              {tiers.map(t => {
                const isCurrent = currentTierId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTier(t.id)}
                    className={`py-1.5 px-1 rounded text-xs font-bold flex flex-col items-center justify-center transition-all ${
                      isCurrent
                        ? 'ring-2 ring-white scale-102'
                        : 'hover:opacity-90 active:scale-98'
                    }`}
                    style={{ backgroundColor: t.color, color: '#ffffff' }}
                  >
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
