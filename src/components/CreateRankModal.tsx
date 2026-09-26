import React, { useEffect, useMemo, useState } from 'react';
import { ALL_GENS, ALL_RARITIES, ALL_TYPES, computeEligiblePokemonIds } from '../services/storageService';
import { GENERATIONS, POKEMON_TYPES, RARITIES } from '../data/pokemonTypes';
import { Generation, PokemonRarity, PokemonType, TierListFilterSettings } from '../types/pokemon';
import { X } from 'lucide-react';

interface CreateRankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRank: (options: {
    title: string;
    description: string;
    filterSettings: TierListFilterSettings;
  }) => void;
}

export const CreateRankModal: React.FC<CreateRankModalProps> = ({
  isOpen,
  onClose,
  onCreateRank,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGens, setSelectedGens] = useState<Generation[]>([...ALL_GENS]);
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([...ALL_TYPES]);
  const [selectedRarities, setSelectedRarities] = useState<PokemonRarity[]>([...ALL_RARITIES]);
  const [includeMegas, setIncludeMegas] = useState(false);
  const [includeRegional, setIncludeRegional] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute live match count
  const eligibleCount = useMemo(() => {
    return computeEligiblePokemonIds({
      gens: selectedGens,
      types: selectedTypes,
      rarities: selectedRarities,
      includeMegas,
      includeRegional,
    }).length;
  }, [selectedGens, selectedTypes, selectedRarities, includeMegas, includeRegional]);

  if (!isOpen) return null;

  // Presets
  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'all':
        setTitle('Todos os Pokémon');
        setDescription('');
        setSelectedGens([...ALL_GENS]);
        setSelectedTypes([...ALL_TYPES]);
        setSelectedRarities([...ALL_RARITIES]);
        setIncludeMegas(false);
        setIncludeRegional(true);
        break;
      case 'all_megas':
        setTitle('Todos os Pokémon + Megas');
        setDescription('');
        setSelectedGens([...ALL_GENS]);
        setSelectedTypes([...ALL_TYPES]);
        setSelectedRarities([...ALL_RARITIES]);
        setIncludeMegas(true);
        setIncludeRegional(true);
        break;
      case 'starters':
        setTitle('Rank de Pokémons Iniciais');
        setDescription('');
        setSelectedGens([...ALL_GENS]);
        setSelectedTypes([...ALL_TYPES]);
        setSelectedRarities(['starter']);
        break;
      case 'legendary':
        setTitle('Lendários e Míticos');
        setDescription('');
        setSelectedGens([...ALL_GENS]);
        setSelectedTypes([...ALL_TYPES]);
        setSelectedRarities(['legendary', 'mythical', 'ultra-beast', 'paradox']);
        break;
      case 'gen1':
        setTitle('Geração 1 - Kanto');
        setDescription('');
        setSelectedGens([1]);
        setSelectedTypes([...ALL_TYPES]);
        setSelectedRarities([...ALL_RARITIES]);
        break;
      case 'gen9':
        setTitle('Geração 9 - Paldea');
        setDescription('');
        setSelectedGens([9]);
        setSelectedTypes([...ALL_TYPES]);
        setSelectedRarities([...ALL_RARITIES]);
        break;
      case 'dragons':
        setTitle('Dragões & Fantasmas');
        setDescription('');
        setSelectedGens([...ALL_GENS]);
        setSelectedTypes(['dragon', 'ghost']);
        setSelectedRarities([...ALL_RARITIES]);
        break;
      default:
        break;
    }
  };

  const handleToggleGen = (gen: Generation) => {
    setSelectedGens(prev =>
      prev.includes(gen) ? prev.filter(g => g !== gen) : [...prev, gen]
    );
  };

  const handleToggleType = (t: PokemonType) => {
    setSelectedTypes(prev =>
      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
    );
  };

  const handleToggleRarity = (r: PokemonRarity) => {
    setSelectedRarities(prev =>
      prev.includes(r) ? prev.filter(item => item !== r) : [...prev, r]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eligibleCount === 0) return;

    onCreateRank({
      title: title.trim() || 'Novo Rank',
      description: description.trim(),
      filterSettings: {
        gens: selectedGens,
        types: selectedTypes,
        rarities: selectedRarities,
        includeMegas,
        includeRegional,
      },
    });

    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#181818] rounded w-full max-w-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="p-4 bg-[#141414] border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#e06c75]" />
            <h2 className="text-sm font-bold text-neutral-100">
              Criar Novo Rank
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#222222] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Flat Presets */}
          <div>
            <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Modelos Rápidos
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('all')}
                className="px-2.5 py-1 bg-[#222222] hover:bg-[#282828] text-neutral-300 rounded text-xs font-medium transition-colors"
              >
                Todos (Base + Regionais)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('all_megas')}
                className="px-2.5 py-1 bg-[#222222] hover:bg-[#282828] text-neutral-300 rounded text-xs font-medium transition-colors"
              >
                Todos + Mega Evoluções
              </button>
              <button
                type="button"
                onClick={() => applyPreset('starters')}
                className="px-2.5 py-1 bg-[#222222] hover:bg-[#282828] text-neutral-300 rounded text-xs font-medium transition-colors"
              >
                Iniciais
              </button>
              <button
                type="button"
                onClick={() => applyPreset('legendary')}
                className="px-2.5 py-1 bg-[#222222] hover:bg-[#282828] text-neutral-300 rounded text-xs font-medium transition-colors"
              >
                Lendários
              </button>
              <button
                type="button"
                onClick={() => applyPreset('gen1')}
                className="px-2.5 py-1 bg-[#222222] hover:bg-[#282828] text-neutral-300 rounded text-xs font-medium transition-colors"
              >
                Gen 1
              </button>
              <button
                type="button"
                onClick={() => applyPreset('gen9')}
                className="px-2.5 py-1 bg-[#222222] hover:bg-[#282828] text-neutral-300 rounded text-xs font-medium transition-colors"
              >
                Gen 9
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Nome do Rank *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Minha Tier List"
                className="w-full bg-[#141414] border-0 rounded px-3 py-2 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#e06c75]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Descrição (Opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Rank pessoal"
                className="w-full bg-[#141414] border-0 rounded px-3 py-2 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#e06c75]"
              />
            </div>
          </div>

          {/* Special Forms Options (Mega & Regional) */}
          <div className="p-3 bg-[#141414] rounded space-y-2">
            <span className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1">
              Formas Especiais
            </span>
            <div className="flex flex-col sm:flex-row gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-300">
                <input
                  type="checkbox"
                  checked={includeRegional}
                  onChange={(e) => setIncludeRegional(e.target.checked)}
                  className="accent-[#e06c75]"
                />
                <span>Incluir Formas Regionais (Alola, Galar, Hisui, Paldea)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-300">
                <input
                  type="checkbox"
                  checked={includeMegas}
                  onChange={(e) => setIncludeMegas(e.target.checked)}
                  className="accent-[#e06c75]"
                />
                <span className="text-[#e06c75] font-medium">Habilitar Mega Evoluções</span>
              </label>
            </div>
          </div>

          {/* Section: Generations */}
          <div className="p-3 bg-[#141414] rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider">
                Gerações ({selectedGens.length}/9)
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedGens([...ALL_GENS])}
                  className="text-[#e06c75] hover:underline"
                >
                  Todas
                </button>
                <span className="text-neutral-600">·</span>
                <button
                  type="button"
                  onClick={() => setSelectedGens([])}
                  className="text-neutral-400 hover:underline"
                >
                  Nenhuma
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {GENERATIONS.map(g => {
                const checked = selectedGens.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleToggleGen(g.id)}
                    className={`flex items-center justify-between p-2 rounded text-left transition-colors text-xs ${
                      checked
                        ? 'bg-[#281e20] text-[#e06c75] font-semibold'
                        : 'bg-[#1b1b1b] text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <span>{g.name}</span>
                    <span className="font-mono text-[10px] opacity-75">{g.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Types */}
          <div className="p-3 bg-[#141414] rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider">
                Tipos ({selectedTypes.length}/18)
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedTypes([...ALL_TYPES])}
                  className="text-[#e06c75] hover:underline"
                >
                  Todos
                </button>
                <span className="text-neutral-600">·</span>
                <button
                  type="button"
                  onClick={() => setSelectedTypes([])}
                  className="text-neutral-400 hover:underline"
                >
                  Nenhum
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
              {Object.values(POKEMON_TYPES).map(t => {
                const checked = selectedTypes.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleToggleType(t.id)}
                    className={`px-2 py-1.5 rounded text-xs font-medium text-center transition-colors ${
                      checked
                        ? 'bg-[#e06c75] text-[#121212] font-semibold'
                        : 'bg-[#1e1e1e] text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {t.namePt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Rarities */}
          <div className="p-3 bg-[#141414] rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider">
                Categorias ({selectedRarities.length}/{RARITIES.length})
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedRarities([...ALL_RARITIES])}
                  className="text-[#e06c75] hover:underline"
                >
                  Todas
                </button>
                <span className="text-neutral-600">·</span>
                <button
                  type="button"
                  onClick={() => setSelectedRarities([])}
                  className="text-neutral-400 hover:underline"
                >
                  Nenhuma
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {RARITIES.map(r => {
                const checked = selectedRarities.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleToggleRarity(r.id)}
                    className={`p-2 rounded text-left transition-colors text-xs ${
                      checked
                        ? 'bg-[#281e20] text-[#e06c75] font-semibold'
                        : 'bg-[#1b1b1b] text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <span className="truncate block font-medium">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Match counter banner */}
          <div className="p-3 bg-[#141414] rounded flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium">
              Pokémon selecionados para este rank:
            </span>
            <span className="font-mono text-base font-bold text-[#e06c75]">
              {eligibleCount}
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#222222]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 bg-[#202020] rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={eligibleCount === 0 || !title.trim()}
              className="px-4 py-1.5 text-xs font-bold text-[#121212] bg-[#e06c75] hover:bg-[#d05b64] disabled:opacity-20 disabled:pointer-events-none rounded transition-all"
            >
              Criar Rank ({eligibleCount})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
