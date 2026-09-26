import { Tier } from '../types/pokemon';

export const DEFAULT_10_TIERS: Tier[] = [
  { id: 'tier-s-plus', label: 'S+', color: '#EF4444', pokemonIds: [] },
  { id: 'tier-s', label: 'S', color: '#F97316', pokemonIds: [] },
  { id: 'tier-a', label: 'A', color: '#F59E0B', pokemonIds: [] },
  { id: 'tier-b', label: 'B', color: '#EAB308', pokemonIds: [] },
  { id: 'tier-c', label: 'C', color: '#84CC16', pokemonIds: [] },
  { id: 'tier-d', label: 'D', color: '#10B981', pokemonIds: [] },
  { id: 'tier-e', label: 'E', color: '#06B6D4', pokemonIds: [] },
  { id: 'tier-f', label: 'F', color: '#3B82F6', pokemonIds: [] },
  { id: 'tier-g', label: 'G', color: '#8B5CF6', pokemonIds: [] },
  { id: 'tier-lixo', label: 'Lixo', color: '#64748B', pokemonIds: [] },
];

export const PRESET_TIER_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#64748B', // Slate
  '#0F172A', // Dark Slate
];
