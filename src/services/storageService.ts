import { ALL_POKEMON, filterPokemon } from '../data/pokemonDatabase';
import { DEFAULT_10_TIERS } from '../data/defaultTiers';
import { Generation, PokemonRarity, PokemonType, Tier, TierList, TierListFilterSettings } from '../types/pokemon';

const STORAGE_KEY_TIERLISTS = 'poketier_lists_v3';
const STORAGE_KEY_ACTIVE_ID = 'poketier_active_id_v3';

export const ALL_GENS: Generation[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'steel', 'dark', 'fairy'
];
export const ALL_RARITIES: PokemonRarity[] = [
  'common', 'starter', 'legendary', 'mythical', 'ultra-beast', 'paradox', 'fossil', 'baby'
];

export function computeEligiblePokemonIds(filterSettings: TierListFilterSettings): number[] {
  const filtered = filterPokemon(ALL_POKEMON, {
    gens: filterSettings.gens,
    types: filterSettings.types,
    rarities: filterSettings.rarities,
    includeMegas: filterSettings.includeMegas,
    includeRegional: filterSettings.includeRegional !== false,
  });
  return filtered.map(p => p.id);
}

export function createNewTierList(options: {
  title: string;
  description?: string;
  filterSettings: TierListFilterSettings;
  tiers?: Tier[];
}): TierList {
  const filterSettings: TierListFilterSettings = {
    ...options.filterSettings,
    includeRegional: options.filterSettings.includeRegional !== false,
    includeMegas: !!options.filterSettings.includeMegas,
  };
  const eligiblePokemonIds = computeEligiblePokemonIds(filterSettings);
  const tiers: Tier[] = options.tiers
    ? JSON.parse(JSON.stringify(options.tiers))
    : JSON.parse(JSON.stringify(DEFAULT_10_TIERS));

  tiers.forEach(t => {
    t.pokemonIds = [];
  });

  return {
    id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: options.title || 'Novo Rank',
    description: options.description || '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    filterSettings,
    tiers,
    eligiblePokemonIds,
    imageStyle: 'artwork',
    showShiny: false,
    includeMegas: filterSettings.includeMegas,
  };
}

export function getDefaultInitialTierList(): TierList {
  const initial = createNewTierList({
    title: 'Todos os Pokémon',
    description: '',
    filterSettings: {
      gens: ALL_GENS,
      types: ALL_TYPES,
      rarities: ALL_RARITIES,
      includeMegas: false,
      includeRegional: true,
    },
  });

  const initialPlacements: Record<string, number[]> = {
    'tier-s-plus': [150, 384, 493],
    'tier-s': [6, 94, 448, 658],
    'tier-a': [25, 445, 248, 133],
    'tier-b': [143, 9, 3, 149],
  };

  initial.tiers.forEach(t => {
    if (initialPlacements[t.id]) {
      t.pokemonIds = initialPlacements[t.id];
    }
  });

  return initial;
}

export function loadAllTierLists(): TierList[] {
  try {
    let raw = localStorage.getItem(STORAGE_KEY_TIERLISTS);
    if (!raw) {
      // Check if there was v2 data to migrate
      const oldRaw = localStorage.getItem('poketier_lists_v2');
      if (oldRaw) {
        raw = oldRaw;
      }
    }

    if (!raw) {
      const defaultList = getDefaultInitialTierList();
      saveAllTierLists([defaultList]);
      setActiveTierListId(defaultList.id);
      return [defaultList];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const defaultList = getDefaultInitialTierList();
      saveAllTierLists([defaultList]);
      setActiveTierListId(defaultList.id);
      return [defaultList];
    }

    return parsed.map((tl: any) => {
      const filterSettings: TierListFilterSettings = {
        gens: tl.filterSettings?.gens ?? ALL_GENS,
        types: tl.filterSettings?.types ?? ALL_TYPES,
        rarities: tl.filterSettings?.rarities ?? ALL_RARITIES,
        includeMegas: !!(tl.filterSettings?.includeMegas || tl.includeMegas),
        includeRegional: tl.filterSettings?.includeRegional !== false,
      };

      const eligible = computeEligiblePokemonIds(filterSettings);

      // Clean up old default description
      let description = tl.description || '';
      if (description.includes('Ranqueie todos') || description.includes('ranqueie todos')) {
        description = '';
      }

      return {
        id: tl.id || `tl_${Date.now()}`,
        title: tl.title || 'Sem título',
        description,
        createdAt: tl.createdAt || Date.now(),
        updatedAt: tl.updatedAt || Date.now(),
        filterSettings,
        tiers: tl.tiers || DEFAULT_10_TIERS,
        eligiblePokemonIds: eligible,
        imageStyle: tl.imageStyle || 'artwork',
        showShiny: !!tl.showShiny,
        includeMegas: filterSettings.includeMegas,
      };
    });
  } catch (err) {
    console.error('Error loading tier lists:', err);
    const defaultList = getDefaultInitialTierList();
    return [defaultList];
  }
}

export function saveAllTierLists(lists: TierList[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TIERLISTS, JSON.stringify(lists));
  } catch (err) {
    console.error('Error saving tier lists:', err);
  }
}

export function getActiveTierListId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || localStorage.getItem('poketier_active_id_v2');
  } catch {
    return null;
  }
}

export function setActiveTierListId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (err) {
    console.error('Error setting active tier list id:', err);
  }
}

export function exportBackupJSON(lists: TierList[]): string {
  return JSON.stringify(
    {
      version: 3,
      exportedAt: new Date().toISOString(),
      tierLists: lists,
    },
    null,
    2
  );
}

export function importBackupJSON(jsonStr: string): TierList[] | null {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.tierLists || !Array.isArray(data.tierLists)) {
      return null;
    }
    return data.tierLists;
  } catch {
    return null;
  }
}
