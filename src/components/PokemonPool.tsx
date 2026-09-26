import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Dices,
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { filterPokemon, getPokemonById } from '../data/pokemonDatabase';
import { GENERATIONS, POKEMON_TYPES, RARITIES } from '../data/pokemonTypes';
import { Generation, ImageStyle, Pokemon, PokemonRarity, PokemonType } from '../types/pokemon';
import { PokemonCard } from './PokemonCard';

interface PokemonPoolProps {
  eligiblePokemonIds: number[];
  rankedPokemonIds: Set<number>;
  imageStyle: ImageStyle;
  showShiny: boolean;
  includeMegas: boolean;
  includeGmax?: boolean;
  onToggleMegas: () => void;
  onToggleGmax?: () => void;
  onDropPokemonBackToPool: (pokemonId: number) => void;
  onSelectPokemon: (pokemon: Pokemon) => void;
  onClearAllRanks?: () => void;
  onRandomRankBatch: (count: number) => void;
  onToggleShiny: () => void;
  onChangeImageStyle: (style: ImageStyle) => void;
}

export const PokemonPool: React.FC<PokemonPoolProps> = ({
  eligiblePokemonIds,
  rankedPokemonIds,
  imageStyle,
  showShiny,
  includeMegas,
  includeGmax = false,
  onToggleMegas,
  onToggleGmax,
  onDropPokemonBackToPool,
  onSelectPokemon,
  onRandomRankBatch,
  onToggleShiny,
  onChangeImageStyle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGen, setSelectedGen] = useState<Generation | 'all'>('all');
  const [selectedType, setSelectedType] = useState<PokemonType | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<PokemonRarity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unranked' | 'ranked'>('unranked');
  const [specialFormFilter, setSpecialFormFilter] = useState<'all' | 'regional' | 'mega' | 'gmax'>('all');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [page, setPage] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);

  const ITEMS_PER_PAGE = 80;

  // Get eligible pokemon objects
  const eligiblePokemonList = useMemo(() => {
    return eligiblePokemonIds
      .map(id => getPokemonById(id))
      .filter((p): p is Pokemon => p !== undefined);
  }, [eligiblePokemonIds]);

  // Apply search & pool filters
  const filteredList = useMemo(() => {
    return filterPokemon(eligiblePokemonList, {
      gens: selectedGen === 'all' ? undefined : [selectedGen],
      types: selectedType === 'all' ? undefined : [selectedType],
      rarities: selectedRarity === 'all' ? undefined : [selectedRarity],
      includeMegas: true, // already filtered in eligible, but keep true here
      includeGmax: true,
      query: searchQuery,
    }).filter(p => {
      if (specialFormFilter === 'regional' && !p.isRegional) return false;
      if (specialFormFilter === 'mega' && !p.isMega) return false;
      if (specialFormFilter === 'gmax' && !p.isGmax) return false;

      const isRanked = rankedPokemonIds.has(p.id);
      if (statusFilter === 'unranked') return !isRanked;
      if (statusFilter === 'ranked') return isRanked;
      return true;
    });
  }, [eligiblePokemonList, selectedGen, selectedType, selectedRarity, specialFormFilter, searchQuery, statusFilter, rankedPokemonIds]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  // Handle drop back to pool
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data && typeof data.pokemonId === 'number') {
        onDropPokemonBackToPool(data.pokemonId);
      }
    } catch (err) {
      console.error('Failed to parse drag drop data:', err);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`transition-colors bg-[#181818] ${
        isDragOver ? 'bg-[#221c1d]' : 'bg-[#181818]'
      }`}
    >
      {/* Top Pool Control Bar */}
      <div className="p-4 sm:p-5 flex flex-col gap-4 border-b border-[#222222]">
        {/* Row 1: Header and Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-neutral-200 flex items-center gap-2">
              <span>Lista de Pokémon</span>
              <span className="text-xs font-mono text-neutral-400 bg-[#222222] px-2 py-0.5 rounded tabular-nums">
                {filteredList.length} disponíveis
              </span>
            </h2>
          </div>

          {/* Flat Tool buttons */}
          <div className="flex items-center flex-wrap gap-1.5">
            {/* Mega Evolutions toggle button */}
            <button
              type="button"
              onClick={onToggleMegas}
              title="Habilitar ou desabilitar Mega Evoluções na lista"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                includeMegas
                  ? 'bg-[#e06c75] text-[#121212] font-semibold'
                  : 'bg-[#222222] hover:bg-[#282828] text-neutral-300'
              }`}
            >
              <span>Megas: {includeMegas ? 'Ativado' : 'Desativado'}</span>
            </button>

            {/* Gigantamax toggle button */}
            {onToggleGmax && (
              <button
                type="button"
                onClick={onToggleGmax}
                title="Habilitar ou desabilitar Gigantamax na lista"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  includeGmax
                    ? 'bg-[#e06c75] text-[#121212] font-semibold'
                    : 'bg-[#222222] hover:bg-[#282828] text-neutral-300'
                }`}
              >
                <span>G-Max: {includeGmax ? 'Ativado' : 'Desativado'}</span>
              </button>
            )}

            {/* Image style select */}
            <select
              value={imageStyle}
              onChange={(e) => onChangeImageStyle(e.target.value as ImageStyle)}
              title="Estilo visual"
              aria-label="Estilo visual"
              className="bg-[#222222] hover:bg-[#282828] text-neutral-200 border-0 rounded px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-[#e06c75] cursor-pointer outline-none"
            >
              <option value="artwork">Artwork Oficial (HD)</option>
              <option value="home">Render 3D (HOME)</option>
              <option value="sprite">Pixel Sprite (Gen 5)</option>
              <option value="showdown">Showdown (Animado)</option>
            </select>

            {/* Shiny toggle */}
            <button
              type="button"
              onClick={onToggleShiny}
              title="Alternar entre sprites normais e brilhantes"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                showShiny
                  ? 'bg-[#e06c75] text-[#121212] font-semibold'
                  : 'bg-[#222222] hover:bg-[#282828] text-neutral-300'
              }`}
            >
              <span>Shiny: {showShiny ? 'On' : 'Off'}</span>
            </button>

            {/* Randomizer */}
            <button
              type="button"
              onClick={() => onRandomRankBatch(5)}
              title="Ranqueia 5 Pokémon aleatórios"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#222222] hover:bg-[#282828] text-neutral-300 rounded text-xs font-medium transition-colors"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>+5 Aleatórios</span>
            </button>

            {/* Toggle Filters Panel */}
            <button
              type="button"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                showFiltersPanel || selectedGen !== 'all' || selectedType !== 'all' || selectedRarity !== 'all' || specialFormFilter !== 'all'
                  ? 'bg-[#e06c75] text-[#121212] font-semibold'
                  : 'bg-[#222222] hover:bg-[#282828] text-neutral-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search Bar & Flat Tabs */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Pesquisar por nome ou número (ex: Meowth, Charizard, #025)..."
              className="w-full bg-[#1e1e1e] border-0 rounded pl-9 pr-9 py-2 text-xs sm:text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#e06c75] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Flat Status Tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-[#1e1e1e] rounded shrink-0 self-stretch sm:self-auto justify-center">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('unranked');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                statusFilter === 'unranked'
                  ? 'bg-[#e06c75] text-[#121212] font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Não Ranqueados
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-[#e06c75] text-[#121212] font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ranked');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                statusFilter === 'ranked'
                  ? 'bg-[#e06c75] text-[#121212] font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Já Ranqueados
            </button>
          </div>
        </div>

        {/* Row 3: Expanded Flat Filters (Special forms, Gens, Types, Rarities) */}
        {showFiltersPanel && (
          <div className="p-3.5 bg-[#141414] rounded flex flex-col gap-3">
            {/* Filter by Special Form (Base, Regionals, Megas) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Formas
                </span>
                {specialFormFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSpecialFormFilter('all');
                      setPage(1);
                    }}
                    className="text-[11px] text-[#e06c75] hover:underline"
                  >
                    Resetar
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setSpecialFormFilter('all');
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    specialFormFilter === 'all'
                      ? 'bg-[#e06c75] text-[#121212] font-semibold'
                      : 'bg-[#202020] text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Todas as Formas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSpecialFormFilter('regional');
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    specialFormFilter === 'regional'
                      ? 'bg-[#e06c75] text-[#121212] font-semibold'
                      : 'bg-[#202020] text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Apenas Regionais (Alola/Galar/Hisui/Paldea)
                </button>
                {includeMegas && (
                  <button
                    type="button"
                    onClick={() => {
                      setSpecialFormFilter('mega');
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                      specialFormFilter === 'mega'
                        ? 'bg-[#e06c75] text-[#121212] font-semibold'
                        : 'bg-[#202020] text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Apenas Mega Evoluções
                  </button>
                )}
                {includeGmax && (
                  <button
                    type="button"
                    onClick={() => {
                      setSpecialFormFilter('gmax');
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                      specialFormFilter === 'gmax'
                        ? 'bg-[#e06c75] text-[#121212] font-semibold'
                        : 'bg-[#202020] text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Apenas Gigantamax (G-Max)
                  </button>
                )}
              </div>
            </div>

            {/* Filter by Generation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Geração / Região
                </span>
                {selectedGen !== 'all' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGen('all');
                      setPage(1);
                    }}
                    className="text-[11px] text-[#e06c75] hover:underline"
                  >
                    Resetar
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGen('all');
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    selectedGen === 'all'
                      ? 'bg-[#e06c75] text-[#121212] font-semibold'
                      : 'bg-[#202020] text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Todas
                </button>
                {GENERATIONS.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setSelectedGen(g.id);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                      selectedGen === g.id
                        ? 'bg-[#e06c75] text-[#121212] font-semibold'
                        : 'bg-[#202020] text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {g.name} ({g.region})
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Type */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Tipo
                </span>
                {selectedType !== 'all' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedType('all');
                      setPage(1);
                    }}
                    className="text-[11px] text-[#e06c75] hover:underline"
                  >
                    Resetar
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType('all');
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    selectedType === 'all'
                      ? 'bg-[#e06c75] text-[#121212] font-semibold'
                      : 'bg-[#202020] text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Todos os Tipos
                </button>
                {Object.values(POKEMON_TYPES).map(t => {
                  const isSelected = selectedType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedType(isSelected ? 'all' : t.id);
                        setPage(1);
                      }}
                      className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                        isSelected
                          ? 'bg-[#e06c75] text-[#121212] font-bold'
                          : 'bg-[#202020] text-neutral-300 hover:bg-[#282828]'
                      }`}
                    >
                      {t.namePt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter by Rarity */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Categoria
                </span>
                {selectedRarity !== 'all' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRarity('all');
                      setPage(1);
                    }}
                    className="text-[11px] text-[#e06c75] hover:underline"
                  >
                    Resetar
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRarity('all');
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    selectedRarity === 'all'
                      ? 'bg-[#e06c75] text-[#121212] font-semibold'
                      : 'bg-[#202020] text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Todas
                </button>
                {RARITIES.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRarity(r.id);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition-colors flex items-center gap-1 ${
                      selectedRarity === r.id
                        ? 'bg-[#e06c75] text-[#121212] font-semibold'
                        : 'bg-[#202020] text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Pokemon - Pure PNGs only */}
      <div className="p-4 sm:p-5 min-h-[220px]">
        {paginatedList.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-neutral-500">
            <p className="text-sm font-medium text-neutral-400">Nenhum Pokémon encontrado</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedGen('all');
                setSelectedType('all');
                setSelectedRarity('all');
                setSpecialFormFilter('all');
                setStatusFilter('unranked');
                setPage(1);
              }}
              className="mt-3 px-3 py-1.5 bg-[#e06c75] text-[#121212] font-semibold text-xs rounded transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5 justify-center items-center">
            {paginatedList.map(poke => (
              <PokemonCard
                key={`pool-${poke.id}`}
                pokemonId={poke.id}
                imageStyle={imageStyle}
                showShiny={showShiny}
                sourceTierId="pool"
                onSelect={onSelectPokemon}
              />
            ))}
          </div>
        )}
      </div>

      {/* Flat Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 sm:p-4 border-t border-[#222222] flex items-center justify-between text-xs text-neutral-400">
          <span>
            Página <strong className="text-neutral-200 font-mono">{currentPage}</strong> de{' '}
            <strong className="text-neutral-200 font-mono">{totalPages}</strong> ({filteredList.length} itens)
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 bg-[#222222] hover:bg-[#282828] disabled:opacity-20 disabled:pointer-events-none rounded transition-colors text-neutral-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-neutral-300 px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 bg-[#222222] hover:bg-[#282828] disabled:opacity-20 disabled:pointer-events-none rounded transition-colors text-neutral-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
