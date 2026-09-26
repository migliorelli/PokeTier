import pokemonRawList from './pokemonList.json';
import { Generation, ImageStyle, Pokemon, PokemonRarity, PokemonType } from '../types/pokemon';

export const ALL_POKEMON: Pokemon[] = pokemonRawList as Pokemon[];

export const POKEMON_BY_ID: Map<number, Pokemon> = new Map(
  ALL_POKEMON.map(p => [p.id, p])
);

export function getPokemonById(id: number): Pokemon | undefined {
  return POKEMON_BY_ID.get(id);
}

export function getPokemonImageUrl(
  id: number,
  style: ImageStyle = 'artwork',
  shiny = false
): string {
  if (style === 'showdown') {
    return shiny
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${id}.gif`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;
  }

  if (style === 'home') {
    return shiny
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${id}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
  }

  if (style === 'sprite') {
    return shiny
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }

  // Default: official artwork
  return shiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function getPokemonFallbackImageUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function filterPokemon(
  pokemonList: Pokemon[],
  filters: {
    gens?: Generation[];
    types?: PokemonType[];
    rarities?: PokemonRarity[];
    includeMegas?: boolean;
    includeRegional?: boolean;
    query?: string;
  }
): Pokemon[] {
  const { gens, types, rarities, includeMegas = false, includeRegional = true, query } = filters;
  const cleanQuery = query?.trim().toLowerCase();

  return pokemonList.filter(p => {
    // Mega evolution filter: only included if enabled
    if (p.isMega && !includeMegas) {
      return false;
    }

    // Regional forms: included by default unless specifically disabled
    if (p.isRegional && includeRegional === false) {
      return false;
    }

    if (gens && gens.length > 0 && !gens.includes(p.gen)) {
      return false;
    }

    if (types && types.length > 0) {
      const hasMatchingType = p.types.some(t => types.includes(t));
      if (!hasMatchingType) return false;
    }

    if (rarities && rarities.length > 0 && !rarities.includes(p.rarity)) {
      return false;
    }

    if (cleanQuery) {
      const matchName = p.name.toLowerCase().includes(cleanQuery) ||
                        p.displayName.toLowerCase().includes(cleanQuery);
      const matchNumber = p.id.toString() === cleanQuery ||
                          `#${p.id}`.toLowerCase().includes(cleanQuery) ||
                          `#${p.id.toString().padStart(3, '0')}`.toLowerCase().includes(cleanQuery) ||
                          `#${p.id.toString().padStart(4, '0')}`.toLowerCase().includes(cleanQuery);
      if (!matchName && !matchNumber) return false;
    }

    return true;
  });
}
