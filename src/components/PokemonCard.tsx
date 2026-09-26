import React, { useState } from 'react';
import { getPokemonById, getPokemonFallbackImageUrl, getPokemonImageUrl } from '../data/pokemonDatabase';
import { ImageStyle, Pokemon } from '../types/pokemon';

interface PokemonCardProps {
  pokemonId: number;
  imageStyle?: ImageStyle;
  showShiny?: boolean;
  sourceTierId?: string; // If in a tier, tier.id; if in pool, 'pool'
  compact?: boolean;
  onSelect?: (pokemon: Pokemon) => void;
  onQuickMove?: (pokemonId: number, targetTierId: string) => void;
  onRemoveFromTier?: (pokemonId: number) => void;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemonId,
  imageStyle = 'artwork',
  showShiny = false,
  sourceTierId = 'pool',
  compact = false,
  onSelect,
  onRemoveFromTier,
}) => {
  const pokemon = getPokemonById(pokemonId);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!pokemon) return null;

  const imageUrl = imageError
    ? getPokemonFallbackImageUrl(pokemon.id)
    : getPokemonImageUrl(pokemon.id, imageStyle, showShiny);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    setIsHovered(false);

    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        pokemonId: pokemon.id,
        sourceTierId,
      })
    );
    e.dataTransfer.effectAllowed = 'move';

    // Desired drag preview size: 1.5x of base row item size (~76-80px) => 116px
    const targetSize = 116;
    const halfSize = targetSize / 2;
    const img = e.currentTarget.querySelector('img');
    let dragSet = false;

    // Canvas drawing generates an exact 116x116 crisp drag preview without browser scaling issues
    if (img && img.complete && img.naturalWidth > 0) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(img, 0, 0, targetSize, targetSize);
          e.dataTransfer.setDragImage(canvas, halfSize, halfSize);
          dragSet = true;
        }
      } catch {
        dragSet = false;
      }
    }

    // Fallback: off-screen fixed element sized exactly 116x116
    if (!dragSet) {
      try {
        const ghost = document.createElement('div');
        ghost.style.position = 'fixed';
        ghost.style.left = '0px';
        ghost.style.top = '0px';
        ghost.style.width = `${targetSize}px`;
        ghost.style.height = `${targetSize}px`;
        ghost.style.transform = 'translate(-9999px, -9999px)';
        ghost.style.pointerEvents = 'none';
        ghost.style.zIndex = '-9999';

        const ghostImg = document.createElement('img');
        ghostImg.src = img?.src || imageUrl;
        ghostImg.style.width = '100%';
        ghostImg.style.height = '100%';
        ghostImg.style.objectFit = 'contain';

        ghost.appendChild(ghostImg);
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, halfSize, halfSize);

        setTimeout(() => {
          if (document.body.contains(ghost)) {
            document.body.removeChild(ghost);
          }
        }, 50);
      } catch {
        // Default browser behavior if fallback fails
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsHovered(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (sourceTierId !== 'pool' && onRemoveFromTier) {
      e.preventDefault();
      onRemoveFromTier(pokemon.id);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsDragging(false);
      }}
      onContextMenu={handleContextMenu}
      onClick={() => onSelect?.(pokemon)}
      className={`group relative select-none cursor-grab active:cursor-grabbing flex items-center justify-center outline-none ${
        isHovered ? 'z-50' : 'z-10'
      } ${
        compact
          ? 'h-[72px] w-[72px] sm:h-[80px] sm:w-[80px] p-0.5'
          : 'h-16 w-16 sm:h-20 sm:w-20 p-1'
      }`}
      style={{
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        outline: 'none',
      }}
    >
      {/* Individual Tooltip: appears only when mouse is specifically on this pokemon, floating above anything on screen */}
      {isHovered && !isDragging && (
        <div
          className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 z-[99999] whitespace-nowrap bg-[#181818] border border-[#2d2d2d] text-neutral-100 text-[11px] font-medium px-2 py-0.5 rounded shadow-2xl flex items-center gap-1.5 select-none"
        >
          <span className="text-[#e06c75] font-mono font-bold">
            #{pokemon.id > 10000 ? `${pokemon.id}` : pokemon.id.toString().padStart(3, '0')}
          </span>
          <span className="text-neutral-200">{pokemon.displayName}</span>
        </div>
      )}

      {/* Pure Pokemon PNG image - flat, no borders, no backgrounds */}
      <img
        src={imageUrl}
        alt={pokemon.displayName}
        loading="lazy"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
        className="w-full h-full object-contain filter pointer-events-none select-none"
        style={{
          WebkitTouchCallout: 'none',
          userSelect: 'none',
          outline: 'none',
        }}
      />
    </div>
  );
};
