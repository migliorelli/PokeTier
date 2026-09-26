export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'steel'
  | 'dark'
  | 'fairy';

export type PokemonRarity =
  | 'common'
  | 'starter'
  | 'legendary'
  | 'mythical'
  | 'ultra-beast'
  | 'paradox'
  | 'fossil'
  | 'baby';

export type Generation = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface Pokemon {
  id: number;
  name: string;
  displayName: string;
  gen: Generation;
  types: PokemonType[];
  rarity: PokemonRarity;
  stage?: 'basic' | 'stage1' | 'stage2' | 'legendary';
  isRegional?: boolean;
  isMega?: boolean;
  isGmax?: boolean;
}

export interface Tier {
  id: string;
  label: string;
  color: string;
  pokemonIds: number[];
}

export type ImageStyle = 'artwork' | 'home' | 'sprite' | 'showdown';

export interface TierListFilterSettings {
  gens: Generation[];
  types: PokemonType[];
  rarities: PokemonRarity[];
  includeMegas?: boolean;
  includeGmax?: boolean;
  includeRegional?: boolean;
}

export interface TierList {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  filterSettings: TierListFilterSettings;
  tiers: Tier[];
  // Pool of pokemon IDs eligible for this tier list
  eligiblePokemonIds: number[];
  imageStyle?: ImageStyle;
  showShiny?: boolean;
  includeMegas?: boolean;
  includeGmax?: boolean;
}

export interface TypeInfo {
  id: PokemonType;
  namePt: string;
  nameEn: string;
  color: string;
  textColor?: string;
}
