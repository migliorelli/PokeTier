import fs from 'node:fs';
import path from 'node:path';

async function main() {
  console.log('Fetching all 1025 Pokemon from PokeAPI...');
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
  const data = await res.json();
  const list = data.results;

  console.log(`Found ${list.length} pokemon.`);

  // 18 types in PokeAPI
  const typeNames = [
    'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel',
    'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy'
  ];

  console.log('Fetching 18 types from PokeAPI...');
  const typeMap = new Map(); // id -> [slot1, slot2]

  const typePromises = typeNames.map(async (t) => {
    const r = await fetch(`https://pokeapi.co/api/v2/type/${t}`);
    const td = await r.json();
    for (const entry of td.pokemon) {
      const match = entry.pokemon.url.match(/\/pokemon\/(\d+)\//);
      if (match) {
        const id = parseInt(match[1], 10);
        if (id <= 1025) {
          if (!typeMap.has(id)) {
            typeMap.set(id, []);
          }
          typeMap.get(id).push({ type: t, slot: entry.slot });
        }
      }
    }
  });

  await Promise.all(typePromises);
  console.log('Types gathered for all Pokemon.');

  const starters = new Set([
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    152, 153, 154, 155, 156, 157, 158, 159, 160,
    252, 253, 254, 255, 256, 257, 258, 259, 260,
    387, 388, 389, 390, 391, 392, 393, 394, 395,
    495, 496, 497, 498, 499, 500, 501, 502, 503,
    650, 651, 652, 653, 654, 655, 656, 657, 658,
    722, 723, 724, 725, 726, 727, 728, 729, 730,
    810, 811, 812, 813, 814, 815, 816, 817, 818,
    906, 907, 908, 909, 910, 911, 912, 913, 914
  ]);

  const legendaries = new Set([
    144, 145, 146, 150,
    243, 244, 245, 249, 250,
    377, 378, 379, 380, 381, 382, 383, 384,
    480, 481, 482, 483, 484, 485, 486, 487, 488,
    638, 639, 640, 641, 642, 643, 644, 645, 646,
    716, 717, 718, 772, 773, 785, 786, 787, 788, 791, 792, 800,
    888, 889, 890, 891, 892, 894, 895, 896, 897, 898, 905,
    1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017, 1024
  ]);

  const mythicals = new Set([
    151, 251, 385, 386, 489, 490, 491, 492, 493,
    494, 647, 648, 649, 719, 720, 721,
    801, 802, 807, 808, 809, 893, 1025
  ]);

  const ultraBeasts = new Set([
    793, 794, 795, 796, 797, 798, 799, 803, 804, 805, 806
  ]);

  const paradox = new Set([
    984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995,
    1005, 1006, 1020, 1021, 1022, 1023
  ]);

  const fossils = new Set([
    138, 139, 140, 141, 142, 345, 346, 347, 348,
    408, 409, 410, 411, 564, 565, 566, 567,
    696, 697, 698, 699, 880, 881, 882, 883
  ]);

  const babies = new Set([
    172, 173, 174, 175, 236, 238, 239, 240, 298,
    360, 406, 433, 438, 439, 440, 446, 447, 458
  ]);

  function getGen(id) {
    if (id <= 151) return 1;
    if (id <= 251) return 2;
    if (id <= 386) return 3;
    if (id <= 493) return 4;
    if (id <= 649) return 5;
    if (id <= 721) return 6;
    if (id <= 809) return 7;
    if (id <= 905) return 8;
    return 9;
  }

  function getRarity(id) {
    if (paradox.has(id)) return 'paradox';
    if (ultraBeasts.has(id)) return 'ultra-beast';
    if (mythicals.has(id)) return 'mythical';
    if (legendaries.has(id)) return 'legendary';
    if (starters.has(id)) return 'starter';
    if (fossils.has(id)) return 'fossil';
    if (babies.has(id)) return 'baby';
    return 'common';
  }

  function formatDisplayName(name) {
    // Special cleanups
    const specialMap = {
      'mr-mime': 'Mr. Mime',
      'mime-jr': 'Mime Jr.',
      'type-null': 'Type: Null',
      'tapu-koko': 'Tapu Koko',
      'tapu-lele': 'Tapu Lele',
      'tapu-bulu': 'Tapu Bulu',
      'tapu-fini': 'Tapu Fini',
      'ho-oh': 'Ho-Oh',
      'porygon-z': 'Porygon-Z',
      'jangmo-o': 'Jangmo-o',
      'hakamo-o': 'Hakamo-o',
      'kommo-o': 'Kommo-o',
      'wo-chien': 'Wo-Chien',
      'chien-pao': 'Chien-Pao',
      'ting-lu': 'Ting-Lu',
      'chi-yu': 'Chi-Yu',
      'iron-treads': 'Iron Treads',
      'iron-bundle': 'Iron Bundle',
      'iron-hands': 'Iron Hands',
      'iron-jugulis': 'Iron Jugulis',
      'iron-moth': 'Iron Moth',
      'iron-thorns': 'Iron Thorns',
      'iron-valiant': 'Iron Valiant',
      'iron-leaves': 'Iron Leaves',
      'iron-boulder': 'Iron Boulder',
      'iron-crown': 'Iron Crown',
      'scream-tail': 'Scream Tail',
      'brute-bonnet': 'Brute Bonnet',
      'flutter-mane': 'Flutter Mane',
      'slither-wing': 'Slither Wing',
      'sandy-shocks': 'Sandy Shocks',
      'roaring-moon': 'Roaring Moon',
      'great-tusk': 'Great Tusk',
      'walking-wake': 'Walking Wake',
      'gouging-fire': 'Gouging Fire',
      'raging-bolt': 'Raging Bolt'
    };

    if (specialMap[name]) return specialMap[name];

    return name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  const allPokemon = [];

  for (let i = 0; i < list.length; i++) {
    const raw = list[i];
    const id = i + 1;
    const name = raw.name;
    const displayName = formatDisplayName(name);
    const gen = getGen(id);
    const rarity = getRarity(id);

    const typeSlots = typeMap.get(id) || [];
    typeSlots.sort((a, b) => a.slot - b.slot);
    const types = typeSlots.map(t => t.type);

    allPokemon.push({
      id,
      name,
      displayName,
      gen,
      types: types.length > 0 ? types : ['normal'],
      rarity
    });
  }

  const outDir = path.resolve('src/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const jsonPath = path.join(outDir, 'pokemonList.json');
  fs.writeFileSync(jsonPath, JSON.stringify(allPokemon, null, 2));
  console.log(`Saved ${allPokemon.length} pokemon to ${jsonPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
