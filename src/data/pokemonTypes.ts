import { Generation, PokemonRarity, PokemonType, TypeInfo } from '../types/pokemon';

export const POKEMON_TYPES: Record<PokemonType, TypeInfo> = {
  normal: { id: 'normal', namePt: 'Normal', nameEn: 'Normal', color: '#9FA19F', textColor: '#ffffff' },
  fire: { id: 'fire', namePt: 'Fogo', nameEn: 'Fire', color: '#E62829', textColor: '#ffffff' },
  water: { id: 'water', namePt: 'Água', nameEn: 'Water', color: '#2980EF', textColor: '#ffffff' },
  grass: { id: 'grass', namePt: 'Grama', nameEn: 'Grass', color: '#3FA129', textColor: '#ffffff' },
  electric: { id: 'electric', namePt: 'Elétrico', nameEn: 'Electric', color: '#FAC000', textColor: '#1e293b' },
  ice: { id: 'ice', namePt: 'Gelo', nameEn: 'Ice', color: '#3DCEF3', textColor: '#0f172a' },
  fighting: { id: 'fighting', namePt: 'Lutador', nameEn: 'Fighting', color: '#FF8000', textColor: '#ffffff' },
  poison: { id: 'poison', namePt: 'Veneno', nameEn: 'Poison', color: '#9141CB', textColor: '#ffffff' },
  ground: { id: 'ground', namePt: 'Terra', nameEn: 'Ground', color: '#915121', textColor: '#ffffff' },
  flying: { id: 'flying', namePt: 'Voador', nameEn: 'Flying', color: '#81B9EF', textColor: '#0f172a' },
  psychic: { id: 'psychic', namePt: 'Psíquico', nameEn: 'Psychic', color: '#EF4179', textColor: '#ffffff' },
  bug: { id: 'bug', namePt: 'Inseto', nameEn: 'Bug', color: '#91A119', textColor: '#ffffff' },
  rock: { id: 'rock', namePt: 'Pedra', nameEn: 'Pedra', color: '#AFA981', textColor: '#ffffff' },
  ghost: { id: 'ghost', namePt: 'Fantasma', nameEn: 'Ghost', color: '#704170', textColor: '#ffffff' },
  dragon: { id: 'dragon', namePt: 'Dragão', nameEn: 'Dragon', color: '#5060E1', textColor: '#ffffff' },
  steel: { id: 'steel', namePt: 'Aço', nameEn: 'Steel', color: '#60A1B8', textColor: '#ffffff' },
  dark: { id: 'dark', namePt: 'Sombrio', nameEn: 'Dark', color: '#50413F', textColor: '#ffffff' },
  fairy: { id: 'fairy', namePt: 'Fada', nameEn: 'Fairy', color: '#EF70EF', textColor: '#ffffff' },
};

export const GENERATIONS: { id: Generation; name: string; region: string; range: [number, number]; count: number }[] = [
  { id: 1, name: 'Gen 1', region: 'Kanto', range: [1, 151], count: 151 },
  { id: 2, name: 'Gen 2', region: 'Johto', range: [152, 251], count: 100 },
  { id: 3, name: 'Gen 3', region: 'Hoenn', range: [252, 386], count: 135 },
  { id: 4, name: 'Gen 4', region: 'Sinnoh', range: [387, 493], count: 107 },
  { id: 5, name: 'Gen 5', region: 'Unova', range: [494, 649], count: 156 },
  { id: 6, name: 'Gen 6', region: 'Kalos', range: [650, 721], count: 72 },
  { id: 7, name: 'Gen 7', region: 'Alola', range: [722, 809], count: 88 },
  { id: 8, name: 'Gen 8', region: 'Galar / Hisui', range: [810, 905], count: 96 },
  { id: 9, name: 'Gen 9', region: 'Paldea', range: [906, 1025], count: 120 },
];

export const RARITIES: { id: PokemonRarity; label: string; description: string }[] = [
  { id: 'common', label: 'Comuns & Selvagens', description: 'Pokémon de rotas, cavernas e evoluções normais' },
  { id: 'starter', label: 'Iniciais (Starters)', description: 'Linhas evolutivas dos 3 companheiros de cada região' },
  { id: 'legendary', label: 'Lendários', description: 'Titãs, guardiões e deuses do universo Pokémon' },
  { id: 'mythical', label: 'Míticos', description: 'Espécies raras de eventos e lendas secretas' },
  { id: 'ultra-beast', label: 'Ultra Beasts', description: 'Criaturas interdimensionais de Alola / Ultra Space' },
  { id: 'paradox', label: 'Paradoxos', description: 'Formas ancestrais e futuristas de Paldea' },
  { id: 'fossil', label: 'Fósseis', description: 'Espécies pré-históricas ressuscitadas' },
  { id: 'baby', label: 'Bebês', description: 'Pré-evoluções chocadas de ovos' },
];
