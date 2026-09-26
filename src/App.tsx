/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { CreateRankModal } from './components/CreateRankModal';
import { ExportModal } from './components/ExportModal';
import { Header } from './components/Header';
import { ManageRanksModal } from './components/ManageRanksModal';
import { PokemonDetailModal } from './components/PokemonDetailModal';
import { PokemonPool } from './components/PokemonPool';
import { TierEditModal } from './components/TierEditModal';
import { TierListBoard } from './components/TierListBoard';
import { PRESET_TIER_COLORS } from './data/defaultTiers';
import {
  computeEligiblePokemonIds,
  createNewTierList,
  getActiveTierListId,
  loadAllTierLists,
  saveAllTierLists,
  setActiveTierListId,
} from './services/storageService';
import { ImageStyle, Pokemon, Tier, TierList, TierListFilterSettings } from './types/pokemon';

export default function App() {
  const [tierLists, setTierLists] = useState<TierList[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  // Load from persistent storage on mount
  useEffect(() => {
    const loadedLists = loadAllTierLists();
    const storedActiveId = getActiveTierListId();

    setTierLists(loadedLists);

    if (storedActiveId && loadedLists.some(l => l.id === storedActiveId)) {
      setActiveId(storedActiveId);
    } else if (loadedLists.length > 0) {
      setActiveId(loadedLists[0].id);
      setActiveTierListId(loadedLists[0].id);
    }

    setIsLoaded(true);
  }, []);

  // Save to persistent storage on changes
  useEffect(() => {
    if (isLoaded && tierLists.length > 0) {
      saveAllTierLists(tierLists);
    }
  }, [tierLists, isLoaded]);

  // Smooth auto-scroll while dragging a Pokémon up or down
  useEffect(() => {
    let animationFrameId: number | null = null;
    let scrollSpeed = 0;

    const handleDragOver = (e: DragEvent) => {
      const topThreshold = 140;
      const bottomThreshold = window.innerHeight - 100;

      if (e.clientY < topThreshold) {
        const intensity = (topThreshold - e.clientY) / topThreshold;
        scrollSpeed = -Math.max(6, intensity * 24);
      } else if (e.clientY > bottomThreshold) {
        const intensity = (e.clientY - bottomThreshold) / 100;
        scrollSpeed = Math.max(6, intensity * 24);
      } else {
        scrollSpeed = 0;
      }

      if (scrollSpeed !== 0 && !animationFrameId) {
        const loop = () => {
          if (scrollSpeed !== 0) {
            window.scrollBy(0, scrollSpeed);
            animationFrameId = requestAnimationFrame(loop);
          } else {
            animationFrameId = null;
          }
        };
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    const handleDragEnd = () => {
      scrollSpeed = 0;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDragEnd);
    window.addEventListener('dragend', handleDragEnd);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDragEnd);
      window.removeEventListener('dragend', handleDragEnd);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Active tier list reference
  const activeTierList = useMemo(() => {
    return tierLists.find(l => l.id === activeId) || tierLists[0];
  }, [tierLists, activeId]);

  // Switch active rank
  const handleSelectRank = (id: string) => {
    setActiveId(id);
    setActiveTierListId(id);
  };

  // Helper to mutate active tier list
  const updateActiveTierList = (updater: (prev: TierList) => TierList) => {
    setTierLists(prevLists =>
      prevLists.map(tl => {
        if (tl.id === activeTierList.id) {
          const updated = updater(tl);
          return { ...updated, updatedAt: Date.now() };
        }
        return tl;
      })
    );
  };

  // Create new rank
  const handleCreateRank = (options: {
    title: string;
    description: string;
    filterSettings: TierListFilterSettings;
  }) => {
    const newList = createNewTierList(options);
    setTierLists(prev => [newList, ...prev]);
    setActiveId(newList.id);
    setActiveTierListId(newList.id);
  };

  // Duplicate rank
  const handleDuplicateRank = (id: string) => {
    const target = tierLists.find(l => l.id === id);
    if (!target) return;

    const duplicated: TierList = {
      ...JSON.parse(JSON.stringify(target)),
      id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${target.title} (Cópia)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setTierLists(prev => [duplicated, ...prev]);
    setActiveId(duplicated.id);
    setActiveTierListId(duplicated.id);
  };

  // Delete rank (now works directly without window.confirm)
  const handleDeleteRank = (id: string) => {
    if (tierLists.length <= 1) return;
    const remaining = tierLists.filter(l => l.id !== id);
    setTierLists(remaining);
    if (activeId === id) {
      setActiveId(remaining[0].id);
      setActiveTierListId(remaining[0].id);
    }
  };

  // Import JSON backup
  const handleImportBackup = (imported: TierList[]) => {
    setTierLists(imported);
    if (imported.length > 0) {
      setActiveId(imported[0].id);
      setActiveTierListId(imported[0].id);
    }
  };

  // Drag & drop pokemon into tier (supports reordering in the same row)
  const handleDropPokemon = (pokemonId: number, targetTierId: string, insertIndex?: number) => {
    updateActiveTierList(current => {
      const newTiers = current.tiers.map(tier => {
        if (tier.id === targetTierId) {
          const currentIndex = tier.pokemonIds.indexOf(pokemonId);
          const filtered = tier.pokemonIds.filter(id => id !== pokemonId);
          if (insertIndex !== undefined && insertIndex >= 0) {
            let adjustedIndex = insertIndex;
            if (currentIndex !== -1 && currentIndex < insertIndex) {
              adjustedIndex = insertIndex - 1;
            }
            adjustedIndex = Math.max(0, Math.min(adjustedIndex, filtered.length));
            filtered.splice(adjustedIndex, 0, pokemonId);
          } else {
            filtered.push(pokemonId);
          }
          return { ...tier, pokemonIds: filtered };
        } else {
          return {
            ...tier,
            pokemonIds: tier.pokemonIds.filter(id => id !== pokemonId),
          };
        }
      });

      return { ...current, tiers: newTiers };
    });
  };

  // Remove pokemon from tier back to pool
  const handleRemovePokemonFromTier = (pokemonId: number, tierId: string) => {
    updateActiveTierList(current => {
      const newTiers = current.tiers.map(t => {
        if (t.id === tierId) {
          return {
            ...t,
            pokemonIds: t.pokemonIds.filter(id => id !== pokemonId),
          };
        }
        return t;
      });
      return { ...current, tiers: newTiers };
    });
  };

  // Drop pokemon onto pool (unrank)
  const handleDropPokemonBackToPool = (pokemonId: number) => {
    updateActiveTierList(current => {
      const newTiers = current.tiers.map(t => ({
        ...t,
        pokemonIds: t.pokemonIds.filter(id => id !== pokemonId),
      }));
      return { ...current, tiers: newTiers };
    });
  };

  // Clear single tier
  const handleClearTier = (tierId: string) => {
    updateActiveTierList(current => ({
      ...current,
      tiers: current.tiers.map(t => (t.id === tierId ? { ...t, pokemonIds: [] } : t)),
    }));
  };

  // Clear all tiers in active rank (works directly without window.confirm block)
  const handleClearAllTiers = () => {
    updateActiveTierList(current => ({
      ...current,
      tiers: current.tiers.map(t => ({ ...t, pokemonIds: [] })),
    }));
  };

  // Move tier up/down
  const handleMoveTier = (index: number, direction: 'up' | 'down') => {
    updateActiveTierList(current => {
      const tiers = [...current.tiers];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= tiers.length) return current;

      const temp = tiers[index];
      tiers[index] = tiers[targetIndex];
      tiers[targetIndex] = temp;

      return { ...current, tiers };
    });
  };

  // Save edited tier
  const handleSaveTier = (updatedTier: Tier) => {
    updateActiveTierList(current => ({
      ...current,
      tiers: current.tiers.map(t => (t.id === updatedTier.id ? updatedTier : t)),
    }));
  };

  // Delete a tier
  const handleDeleteTier = (tierId: string) => {
    updateActiveTierList(current => {
      if (current.tiers.length <= 1) return current;
      return {
        ...current,
        tiers: current.tiers.filter(t => t.id !== tierId),
      };
    });
  };

  // Add a new tier
  const handleAddTier = () => {
    updateActiveTierList(current => {
      const count = current.tiers.length + 1;
      const nextColor = PRESET_TIER_COLORS[(count - 1) % PRESET_TIER_COLORS.length];
      const newTier: Tier = {
        id: `tier_${Date.now()}`,
        label: `Nível ${count}`,
        color: nextColor,
        pokemonIds: [],
      };
      return {
        ...current,
        tiers: [...current.tiers, newTier],
      };
    });
  };

  // Toggle Mega Evolutions in the active rank
  const handleToggleMegas = () => {
    updateActiveTierList(current => {
      const newIncludeMegas = !current.includeMegas;
      const newFilterSettings = {
        ...current.filterSettings,
        includeMegas: newIncludeMegas,
      };
      const eligible = computeEligiblePokemonIds(newFilterSettings);
      return {
        ...current,
        includeMegas: newIncludeMegas,
        filterSettings: newFilterSettings,
        eligiblePokemonIds: eligible,
      };
    });
  };

  // Toggle Gigantamax (G-Max) in the active rank
  const handleToggleGmax = () => {
    updateActiveTierList(current => {
      const newIncludeGmax = !current.includeGmax;
      const newFilterSettings = {
        ...current.filterSettings,
        includeGmax: newIncludeGmax,
      };
      const eligible = computeEligiblePokemonIds(newFilterSettings);
      return {
        ...current,
        includeGmax: newIncludeGmax,
        filterSettings: newFilterSettings,
        eligiblePokemonIds: eligible,
      };
    });
  };

  // Randomize 5 unranked pokemon into random tiers
  const handleRandomRankBatch = (count: number) => {
    if (!activeTierList) return;

    const rankedSet = new Set(activeTierList.tiers.flatMap(t => t.pokemonIds));
    const unranked = activeTierList.eligiblePokemonIds.filter(id => !rankedSet.has(id));

    if (unranked.length === 0) return;

    const shuffled = [...unranked].sort(() => 0.5 - Math.random());
    const toRank = shuffled.slice(0, Math.min(count, unranked.length));

    updateActiveTierList(current => {
      const newTiers = current.tiers.map(t => ({ ...t, pokemonIds: [...t.pokemonIds] }));
      toRank.forEach(pid => {
        const randomTierIndex = Math.floor(Math.random() * newTiers.length);
        newTiers[randomTierIndex].pokemonIds.push(pid);
      });
      return { ...current, tiers: newTiers };
    });
  };

  // Toggle shiny & image styles
  const handleToggleShiny = () => {
    updateActiveTierList(current => ({
      ...current,
      showShiny: !current.showShiny,
    }));
  };

  const handleChangeImageStyle = (style: ImageStyle) => {
    updateActiveTierList(current => ({
      ...current,
      imageStyle: style,
    }));
  };

  // Set of currently ranked pokemon IDs in this list
  const rankedPokemonIds = useMemo(() => {
    if (!activeTierList) return new Set<number>();
    return new Set(activeTierList.tiers.flatMap(t => t.pokemonIds));
  }, [activeTierList]);

  // Find tier ID of currently selected pokemon for detail modal
  const selectedPokemonCurrentTierId = useMemo(() => {
    if (!selectedPokemon || !activeTierList) return undefined;
    for (const t of activeTierList.tiers) {
      if (t.pokemonIds.includes(selectedPokemon.id)) {
        return t.id;
      }
    }
    return undefined;
  }, [selectedPokemon, activeTierList]);

  if (!isLoaded || !activeTierList) {
    return (
      <div className="min-h-screen bg-[#121212] text-neutral-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#e06c75] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-neutral-400">Carregando...</p>
        </div>
      </div>
    );
  }

  const totalEligible = activeTierList.eligiblePokemonIds.length;
  const totalRanked = rankedPokemonIds.size;
  const progressPercent = totalEligible > 0 ? Math.round((totalRanked / totalEligible) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-100 flex flex-col antialiased selection:bg-[#e06c75] selection:text-[#121212]">
      {/* Top Bar Navigation (Site name removed) */}
      <Header
        activeTierList={activeTierList}
        tierLists={tierLists}
        onSelectRank={handleSelectRank}
        onOpenCreateRankModal={() => setIsCreateModalOpen(true)}
        onOpenManageRanksModal={() => setIsManageModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-6">
        {/* Tier List Board */}
        <section aria-label="Tabela de Níveis">
          <TierListBoard
            activeTierList={activeTierList}
            tierLists={tierLists}
            imageStyle={activeTierList.imageStyle || 'artwork'}
            showShiny={!!activeTierList.showShiny}
            onSelectRank={handleSelectRank}
            onMoveTier={handleMoveTier}
            onEditTier={(tier) => setEditingTier(tier)}
            onAddTier={handleAddTier}
            onClearTier={handleClearTier}
            onClearAllTiers={handleClearAllTiers}
            onDropPokemon={handleDropPokemon}
            onRemovePokemonFromTier={handleRemovePokemonFromTier}
            onSelectPokemon={(poke) => setSelectedPokemon(poke)}
            onOpenManageRanks={() => setIsManageModalOpen(true)}
          />
        </section>

        {/* Full-width Rank Progress Bar */}
        <section aria-label="Progresso da classificação" className="w-full">
          <div className="w-full bg-[#181818] p-3.5 sm:px-4 sm:py-3 rounded flex flex-col gap-2.5 select-none">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                  Progresso da Tier List
                </span>
                <span className="text-[11px] font-mono font-medium text-[#e06c75] bg-[#221c1d] px-2 py-0.5 rounded">
                  {progressPercent}%
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm">
                <span className="text-[#e06c75] font-bold text-sm sm:text-base tabular-nums">
                  {totalRanked}
                </span>
                <span className="text-neutral-500">/</span>
                <span className="text-neutral-300 font-semibold tabular-nums">
                  {totalEligible}
                </span>
                <span className="text-neutral-400 text-xs ml-0.5">colocados</span>
              </div>
            </div>
            {/* Progress track */}
            <div className="w-full bg-[#242424] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#e06c75] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* Pokemon Pool / Bench */}
        <section aria-label="Lista de Pokémon">
          <PokemonPool
            eligiblePokemonIds={activeTierList.eligiblePokemonIds}
            rankedPokemonIds={rankedPokemonIds}
            imageStyle={activeTierList.imageStyle || 'artwork'}
            showShiny={!!activeTierList.showShiny}
            includeMegas={!!activeTierList.includeMegas}
            includeGmax={!!activeTierList.includeGmax}
            onToggleMegas={handleToggleMegas}
            onToggleGmax={handleToggleGmax}
            onDropPokemonBackToPool={handleDropPokemonBackToPool}
            onSelectPokemon={(poke) => setSelectedPokemon(poke)}
            onRandomRankBatch={handleRandomRankBatch}
            onToggleShiny={handleToggleShiny}
            onChangeImageStyle={handleChangeImageStyle}
          />
        </section>
      </main>

      {/* Flat Clean Footer (Brand name removed) */}
      <footer className="mt-auto border-t border-[#1e1e1e] bg-[#141414] py-3 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            1218 Pokémon disponíveis (Gerações 1 a 9, Formas Regionais, Mega Evoluções e Gigantamax).
          </p>
          <div className="flex items-center gap-3 text-neutral-500">
            <span>Salvo localmente</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateRankModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRank={handleCreateRank}
      />

      <ManageRanksModal
        isOpen={isManageModalOpen}
        tierLists={tierLists}
        activeId={activeTierList.id}
        onClose={() => setIsManageModalOpen(false)}
        onSelectRank={handleSelectRank}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onDuplicateRank={handleDuplicateRank}
        onDeleteRank={handleDeleteRank}
        onImportBackup={handleImportBackup}
      />

      <TierEditModal
        tier={editingTier}
        canDelete={activeTierList.tiers.length > 1}
        onClose={() => setEditingTier(null)}
        onSave={handleSaveTier}
        onDeleteTier={handleDeleteTier}
      />

      <PokemonDetailModal
        pokemon={selectedPokemon}
        tiers={activeTierList.tiers}
        currentTierId={selectedPokemonCurrentTierId}
        imageStyle={activeTierList.imageStyle || 'artwork'}
        onClose={() => setSelectedPokemon(null)}
        onMoveToTier={(pid, tid) => handleDropPokemon(pid, tid)}
        onRemoveFromTier={(pid) => handleDropPokemonBackToPool(pid)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        tierList={activeTierList}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
