import fs from 'node:fs';
import path from 'node:path';

async function main() {
  const currentList = JSON.parse(fs.readFileSync('src/data/pokemonList.json', 'utf8'));
  console.log(`Current base pokemon count: ${currentList.length}`);

  console.log('Fetching forms list from PokeAPI...');
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=500&offset=1025');
  const data = await res.json();

  // Regional forms
  const regionalEntries = data.results.filter(p =>
    p.name.includes('-alola') ||
    p.name.includes('-galar') ||
    p.name.includes('-hisui') ||
    p.name.includes('-paldea')
  );

  // Mega forms (official core megas and primals, only those with sprites)
  const megaEntries = data.results.filter(p =>
    (p.name.endsWith('-mega') || p.name.includes('-mega-') || p.name.includes('-primal')) &&
    !p.name.includes('totem')
  );

  console.log(`Found ${regionalEntries.length} regional and ${megaEntries.length} mega forms.`);

  const targets = [
    ...regionalEntries.map(e => ({ ...e, isRegional: true, isMega: false })),
    ...megaEntries.map(e => ({ ...e, isRegional: false, isMega: true }))
  ];

  function formatDisplayName(name) {
    if (name.includes('-alola')) {
      const base = name.replace('-alola', '').replace(/-/g, ' ');
      return `Alolan ${capitalize(base)}`;
    }
    if (name.includes('-galar')) {
      const base = name.replace('-galar', '').replace(/-/g, ' ');
      return `Galarian ${capitalize(base)}`;
    }
    if (name.includes('-hisui')) {
      const base = name.replace('-hisui', '').replace(/-/g, ' ');
      return `Hisuian ${capitalize(base)}`;
    }
    if (name.includes('-paldea')) {
      const base = name.replace('-paldea', '').replace(/-/g, ' ');
      return `Paldean ${capitalize(base)}`;
    }
    if (name.includes('-primal')) {
      const base = name.replace('-primal', '').replace(/-/g, ' ');
      return `Primal ${capitalize(base)}`;
    }
    if (name.endsWith('-mega')) {
      const base = name.replace('-mega', '').replace(/-/g, ' ');
      return `Mega ${capitalize(base)}`;
    }
    if (name.includes('-mega-')) {
      const parts = name.split('-mega-');
      const base = parts[0].replace(/-/g, ' ');
      const suffix = parts[1].toUpperCase();
      return `Mega ${capitalize(base)} ${suffix}`;
    }
    return capitalize(name.replace(/-/g, ' '));
  }

  function capitalize(str) {
    return str.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  }

  function getRegionGen(name) {
    if (name.includes('-alola')) return 7;
    if (name.includes('-galar')) return 8;
    if (name.includes('-hisui')) return 8;
    if (name.includes('-paldea')) return 9;
    return 6; // Mega evolution introduced in Gen 6
  }

  const newForms = [];
  const batchSize = 15;

  for (let i = 0; i < targets.length; i += batchSize) {
    const chunk = targets.slice(i, i + batchSize);
    await Promise.all(chunk.map(async (entry) => {
      const idMatch = entry.url.match(/\/pokemon\/(\d+)\//);
      if (!idMatch) return;
      const id = parseInt(idMatch[1], 10);

      try {
        const pRes = await fetch(entry.url);
        const pData = await pRes.json();

        // Check if has front sprite or artwork
        const hasSprite = pData.sprites?.front_default || pData.sprites?.other?.['official-artwork']?.front_default;
        if (!hasSprite) return;

        const types = pData.types.map(t => t.type.name);
        const displayName = formatDisplayName(entry.name);
        const gen = getRegionGen(entry.name);
        const isMega = entry.isMega;
        const isRegional = entry.isRegional;

        let rarity = 'common';
        if (entry.name.includes('mewtwo') || entry.name.includes('rayquaza') || entry.name.includes('kyogre') || entry.name.includes('groudon') || entry.name.includes('latias') || entry.name.includes('latios') || entry.name.includes('articuno') || entry.name.includes('zapdos') || entry.name.includes('moltres')) {
          rarity = 'legendary';
        } else if (entry.name.includes('diancie')) {
          rarity = 'mythical';
        } else if (entry.name.includes('venusaur') || entry.name.includes('charizard') || entry.name.includes('blastoise') || entry.name.includes('sceptile') || entry.name.includes('blaziken') || entry.name.includes('swampert') || entry.name.includes('decidueye') || entry.name.includes('typhlosion') || entry.name.includes('samurott')) {
          rarity = 'starter';
        }

        newForms.push({
          id,
          name: entry.name,
          displayName,
          gen,
          types: types.length > 0 ? types : ['normal'],
          rarity,
          isRegional,
          isMega,
        });
      } catch (err) {
        console.error(`Failed to fetch ${entry.name}:`, err.message);
      }
    }));
    console.log(`Processed ${Math.min(i + batchSize, targets.length)} / ${targets.length}`);
  }

  // Combine
  const updatedList = [
    ...currentList.map(p => ({
      ...p,
      isRegional: false,
      isMega: false,
    })),
    ...newForms
  ];

  fs.writeFileSync('src/data/pokemonList.json', JSON.stringify(updatedList, null, 2));
  console.log(`Successfully saved ${updatedList.length} total Pokémon (added ${newForms.length} regional forms and megas).`);
}

main().catch(console.error);
