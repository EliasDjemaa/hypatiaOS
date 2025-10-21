import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
  key?: string;
}

export const useAutoSave = ({
  data,
  onSave,
  delay = 2000,
  enabled = true,
  key = 'autosave',
}: UseAutoSaveOptions) => {
  const { info, error } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  const isSavingRef = useRef(false);

  const saveData = useCallback(async () => {
    if (isSavingRef.current) return;

    const currentData = JSON.stringify(data);
    if (currentData === lastSavedRef.current) return;

    try {
      isSavingRef.current = true;
      await onSave(data);
      lastSavedRef.current = currentData;
      
      // Store in localStorage as backup
      localStorage.setItem(`${key}_backup`, currentData);
      localStorage.setItem(`${key}_timestamp`, new Date().toISOString());
      
      info('Changes saved automatically');
    } catch (err) {
      error('Failed to auto-save changes');
      console.error('Auto-save error:', err);
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave, key, info, error]);

  const debouncedSave = useCallback(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(saveData, delay);
  }, [saveData, delay, enabled]);

  useEffect(() => {
    debouncedSave();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedSave]);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await saveData();
  }, [saveData]);

  // Restore from localStorage
  const restoreFromBackup = useCallback(() => {
    try {
      const backup = localStorage.getItem(`${key}_backup`);
      const timestamp = localStorage.getItem(`${key}_timestamp`);
      
      if (backup && timestamp) {
        const backupTime = new Date(timestamp);
        const now = new Date();
        const hoursSinceBackup = (now.getTime() - backupTime.getTime()) / (1000 * 60 * 60);
        
        // Only restore if backup is less than 24 hours old
        if (hoursSinceBackup < 24) {
          return JSON.parse(backup);
        }
      }
      return null;
    } catch (err) {
      console.error('Failed to restore backup:', err);
      return null;
    }
  }, [key]);

  // Clear backup
  const clearBackup = useCallback(() => {
    localStorage.removeItem(`${key}_backup`);
    localStorage.removeItem(`${key}_timestamp`);
  }, [key]);

  return {
    saveNow,
    restoreFromBackup,
    clearBackup,
    isSaving: isSavingRef.current,
  };
};

export default useAutoSave;
