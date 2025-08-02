import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createNewGame, createQuickStart } from '../data/init';
import type { GameState } from '../types';
import { createRNG } from '../utils/rng';
import { startTurn, roll as engRoll, resolveTile as engResolveTile, endTurn as engEndTurn, buyCurrentProperty as engBuy, attemptLeaveJail, sendToJail } from '../engine/turn';
import { clearGame, loadGame, saveGame } from '../persistence/persist';

export function useGameEngine() {
  const [state, setState] = useState<GameState | null>(null);
  const [lastAutosaveTs, setLastAutosaveTs] = useState<number | null>(null);

  // Init from storage on mount
  useEffect(() => {
    const s = loadGame();
    if (s) {
      setState(s);
    } else {
      setState(null);
    }
  }, []);

  const rng = useMemo(() => createRNG(Date.now()), []);

  // Debounced autosave
  const saveTimer = useRef<number | null>(null);
  useEffect(() => {
    if (!state) return;
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    saveTimer.current = window.setTimeout(() => {
      try {
        saveGame(state);
        setLastAutosaveTs(Date.now());
      } catch {
        // ignore
      }
    }, 250);
    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [state]);

  const newGame = useCallback((players: string[], seed?: number) => {
    const s = createNewGame(players, seed ?? Date.now());
    startTurn(s);
    setState(s);
    saveGame(s);
    setLastAutosaveTs(Date.now());
  }, []);

  const quickStart = useCallback(() => {
    const s = createQuickStart();
    startTurn(s);
    setState(s);
    saveGame(s);
    setLastAutosaveTs(Date.now());
  }, []);

  const resetGame = useCallback(() => {
    clearGame();
    setState(null);
    setLastAutosaveTs(null);
  }, []);

  const roll = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      engRoll(next, rng);
      return next;
    });
  }, [rng]);

  const resolve = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      engResolveTile(next);
      return next;
    });
  }, []);

  const endTurn = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      engEndTurn(next);
      return next;
    });
  }, []);

  const buyCurrentProperty = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      engBuy(next);
      return next;
    });
  }, []);

  const attemptLeaveJailPay = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      attemptLeaveJail(next, 'pay');
      return next;
    });
  }, []);

  const attemptLeaveJailRoll = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      attemptLeaveJail(next, 'roll', rng);
      return next;
    });
  }, [rng]);

  return {
    state,
    lastAutosaveTs,
    actions: {
      newGame,
      quickStart,
      resetGame,
      roll,
      resolve,
      endTurn,
      buyCurrentProperty,
      attemptLeaveJailPay,
      attemptLeaveJailRoll,
      sendToJail: (playerId?: string) => setState(prev => {
        if (!prev) return prev;
        const next = { ...prev };
        sendToJail(next, playerId);
        return next;
      }),
    },
  };
}