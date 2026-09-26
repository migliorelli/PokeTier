import fs from 'node:fs';

async function main() {
  const currentList = JSON.parse(fs.readFileSync('src/data/pokemonList.json', 'utf8'));
  console.log(`Current pokemon count: ${currentList.length}`);

  console.log('Fetching forms list from PokeAPI...');
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=500&offset=1025');
  const data = await res.json();

  const gmaxEntries = data.results.filter(p => p.name.includes('-gmax'));
  console.log(`Found ${gmaxEntries.length} Gigantamax forms.`);

  function formatDisplayName(name) {
    if (name.includes('-gmax')) {
      const base = name.replace('-gmax', '').replace(/-/g, ' ');
      const formatted = base.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      return `${formatted} G-Max`;
    }
    return name;
  }

  const existingIds = new Set(currentList.map(p => p.id));
  const newForms = [];

  for (const entry of gmaxEntries) {
    const idMatch = entry.url.match(/\/pokemon\/(\d+)\//);
    if (!idMatch) continue;
    const id = parseInt(idMatch[1], 10);
    if (existingIds.has(id)) continue;

    try {
      const pRes = await fetch(entry.url);
      const pData = await pRes.json();

      const types = pData.types.map(t => t.type.name);
      const displayName = formatDisplayName(entry.name);
      const gen = 8; // Gigantamax introduced in Gen 8

      let rarity = 'common';
      if (entry.name.includes('urshifu')) {
        rarity = 'legendary';
      } else if (entry.name.includes('melmetal')) {
        rarity = 'mythical';
      } else if (
        entry.name.includes('venusaur') ||
        entry.name.includes('charizard') ||
        entry.name.includes('blastoise') ||
        entry.name.includes('rillaboom') ||
        entry.name.includes('cinderace') ||
        entry.name.includes('inteleon')
      ) {
        rarity = 'starter';
      }

      newForms.push({
        id,
        name: entry.name,
        displayName,
        gen,
        types: types.length > 0 ? types : ['normal'],
        rarity,
        isRegional: false,
        isMega: false,
        isGmax: true,
      });
      console.log(`Added G-Max: ${displayName} (ID: ${id})`);
    } catch (err) {
      console.error(`Failed to fetch ${entry.name}:`, err.message);
    }
  }

  const updatedList = [...currentList, ...newForms];
  fs.writeFileSync('src/data/pokemonList.json', JSON.stringify(updatedList, null, 2));
  console.log(`Done! Total Pokémon is now ${updatedList.length} (added ${newForms.length} G-Max forms).`);
}

main().catch(console.error);
