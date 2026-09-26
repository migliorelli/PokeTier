import { getPokemonById, getPokemonImageUrl } from '../data/pokemonDatabase';
import { TierList } from '../types/pokemon';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export async function exportTierListToImage(
  tierList: TierList,
  options: {
    includeEmptyTiers?: boolean;
    scale?: number;
  } = {}
): Promise<string> {
  const { includeEmptyTiers = false, scale = 2 } = options;

  const activeTiers = tierList.tiers.filter(
    t => includeEmptyTiers || t.pokemonIds.length > 0
  );

  if (activeTiers.length === 0) {
    throw new Error('Adicione ao menos um Pokémon a um nível para exportar!');
  }

  // Pre-load all pokemon images
  const imageMap = new Map<number, HTMLImageElement>();
  const allIds = Array.from(new Set(activeTiers.flatMap(t => t.pokemonIds)));

  await Promise.all(
    allIds.map(async id => {
      const url = getPokemonImageUrl(id, tierList.imageStyle || 'artwork', tierList.showShiny);
      try {
        const img = await loadImage(url);
        imageMap.set(id, img);
      } catch {
        try {
          const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
          const fallbackImg = await loadImage(fallbackUrl);
          imageMap.set(id, fallbackImg);
        } catch {
          // ignore
        }
      }
    })
  );

  // Layout calculations
  const width = 1200;
  const headerHeight = 70;
  const footerHeight = 35;
  const tierLabelWidth = 120;
  const imageSize = 64;
  const gap = 8;
  const maxCardsPerRow = Math.floor((width - tierLabelWidth - 30) / (imageSize + gap));

  // Calculate height for each tier
  const tierHeights = activeTiers.map(tier => {
    const count = tier.pokemonIds.length;
    const rowCount = Math.max(1, Math.ceil(count / maxCardsPerRow));
    return Math.max(76, rowCount * (imageSize + gap) + gap);
  });

  const totalTierHeight = tierHeights.reduce((acc, h) => acc + h + 2, 0);
  const totalHeight = headerHeight + totalTierHeight + footerHeight + 10;

  // Setup canvas
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = totalHeight * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.scale(scale, scale);

  // Flat monochromatic background
  ctx.fillStyle = '#121212';
  ctx.fillRect(0, 0, width, totalHeight);

  // Flat Header
  ctx.fillStyle = '#181818';
  ctx.fillRect(0, 0, width, headerHeight);

  // Pastel red dot
  ctx.fillStyle = '#e06c75';
  ctx.fillRect(20, 26, 6, 18);

  // Title
  ctx.fillStyle = '#f0f0f0';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(tierList.title, 34, 42);

  // Subtitle
  const totalRanked = activeTiers.reduce((acc, t) => acc + t.pokemonIds.length, 0);
  ctx.fillStyle = '#777777';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(
    `${totalRanked} Pokémon ranqueados · ${activeTiers.length} níveis`,
    34,
    58
  );

  // Watermark
  ctx.fillStyle = '#e06c75';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('PokéTier', width - 20, 42);
  ctx.textAlign = 'left';

  // Render tiers
  let currentY = headerHeight + 4;

  activeTiers.forEach((tier, index) => {
    const tierH = tierHeights[index];

    // Flat tier row background
    ctx.fillStyle = '#181818';
    ctx.fillRect(10, currentY, width - 20, tierH);

    // Tier Label Box - solid flat color
    ctx.fillStyle = tier.color || '#e06c75';
    ctx.fillRect(10, currentY, tierLabelWidth, tierH);

    // Tier Label Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tier.label, 10 + tierLabelWidth / 2, currentY + tierH / 2);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Tier Pokémon slots - ONLY pure PNG images, no background, no border!
    const startX = 10 + tierLabelWidth + 12;
    const startY = currentY + 6;

    tier.pokemonIds.forEach((pid, pIdx) => {
      const col = pIdx % maxCardsPerRow;
      const row = Math.floor(pIdx / maxCardsPerRow);

      const imgX = startX + col * (imageSize + gap);
      const imgY = startY + row * (imageSize + gap);

      const img = imageMap.get(pid);
      if (img) {
        ctx.drawImage(img, imgX, imgY, imageSize, imageSize);
      } else {
        const poke = getPokemonById(pid);
        ctx.fillStyle = '#888888';
        ctx.font = '10px monospace';
        ctx.fillText(`#${pid}`, imgX + 4, imgY + 20);
        if (poke) {
          ctx.fillText(poke.displayName.slice(0, 6), imgX + 4, imgY + 34);
        }
      }
    });

    currentY += tierH + 2;
  });

  // Footer
  ctx.fillStyle = '#555555';
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PokéTier Studio', width / 2, totalHeight - 12);

  return canvas.toDataURL('image/png');
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
