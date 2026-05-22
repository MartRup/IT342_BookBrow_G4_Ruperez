import { useState, useEffect, useCallback, useRef } from 'react';
import ApiService from '../services/ApiService';

/**
 * Hook that tracks the current user's borrow suspension status.
 * Returns:
 *   isSuspended       – boolean, true while suspension is active
 *   remainingSeconds  – live countdown (decrements every second)
 *   suspensionReason  – string reason set by librarian
 *   formattedTime     – human-readable "Xd Xh Xm Xs" string
 *   refresh           – call to re-fetch from the server
 */
export default function useSuspension() {
  const [isSuspended, setIsSuspended]         = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [suspensionReason, setSuspensionReason] = useState('');
  const intervalRef = useRef(null);

  const clearCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startCountdown = (seconds) => {
    clearCountdown();
    let remaining = seconds;
    setRemainingSeconds(remaining);

    intervalRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearCountdown();
        setIsSuspended(false);
        setRemainingSeconds(0);
      } else {
        setRemainingSeconds(remaining);
      }
    }, 1000);
  };

  const refresh = useCallback(async () => {
    try {
      const res = await ApiService.users.getSuspensionStatus();
      const data = res.data?.data ?? res.data ?? {};
      const suspended = data.isSuspended === true;
      const seconds   = data.remainingSeconds ?? 0;
      const reason    = data.suspensionReason ?? '';

      setIsSuspended(suspended);
      setSuspensionReason(reason);

      if (suspended && seconds > 0) {
        startCountdown(seconds);
      } else {
        clearCountdown();
        setRemainingSeconds(0);
      }
    } catch {
      // silently ignore – user may not be logged in yet
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refresh();
    return () => clearCountdown();
  }, [refresh]);

  const formatTime = (totalSeconds) => {
    if (totalSeconds <= 0) return '0s';
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
  };

  return {
    isSuspended,
    remainingSeconds,
    suspensionReason,
    formattedTime: formatTime(remainingSeconds),
    refresh,
  };
}
