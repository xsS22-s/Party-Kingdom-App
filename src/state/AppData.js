import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { accounts, accountsConfigured } from '../services/accounts';
import { requestReminderPermission, syncReminders, clearOtherOwnerReminders } from '../services/reminders';

const Context = createContext(null);
const GUEST_KEY = 'partykingdom.guest-visits.v1';
const sortVisits = (items) => [...items].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
export function AppDataProvider({ children }) {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(!accounts);
  const [authError, setAuthError] = useState('');
  const [record, setRecord] = useState({ owner: null, visits: [], loading: true, error: '', reminders: {} });
  const generation = useRef(0);
  const owner = session?.user?.id || 'guest';
  const ownerRef = useRef(owner);
  ownerRef.current = owner;
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  useEffect(() => {
    if (!accounts) return;
    let active = true;
    let receivedEvent = false;
    const { data: { subscription } } = accounts.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      receivedEvent = true;
      setSession(next);
      setAuthReady(true);
      setAuthError('');
    });
    accounts.auth.getSession().then(({ data, error }) => {
      if (!active || receivedEvent) return;
      if (error) setAuthError(error.message);
      setSession(data?.session || null);
      setAuthReady(true);
    }).catch(() => {
      if (active) { setAuthError('Unable to restore your account. Please sign in again.'); setAuthReady(true); }
    });
    const handleAppState = (state) => {
      if (state === 'active') accounts.auth.startAutoRefresh();
      else accounts.auth.stopAutoRefresh();
    };
    handleAppState(AppState.currentState);
    const appSubscription = AppState.addEventListener('change', handleAppState);
    return () => { active = false; subscription.unsubscribe(); appSubscription.remove(); accounts.auth.stopAutoRefresh(); };
  }, []);

  const refresh = useCallback(async () => {
    if (!authReady) return;
    const version = ++generation.current;
    setRecord((old) => ({ owner, visits: old.owner === owner ? old.visits : [], loading: true, error: '', reminders: old.owner === owner ? old.reminders : {} }));
    try {
      let items;
      if (owner === 'guest') {
        const raw = await AsyncStorage.getItem(GUEST_KEY);
        items = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(items)) throw new Error('Unable to read the saved visits on this phone.');
      } else {
        const { data, error } = await accounts.from('visits').select('id,user_id,kind,starts_at,reminder_hours,reference').eq('user_id', owner).order('starts_at');
        if (error) throw error;
        items = data;
      }
      if (version !== generation.current || owner !== ownerRef.current || !mounted.current) return;
      const visits = sortVisits(items);
      let reminders;
      try { reminders = await syncReminders(visits, owner); }
      catch { reminders = Object.fromEntries(visits.map((v) => [v.id, v.reminder_hours ? 'error' : 'off'])); }
      if (version === generation.current && owner === ownerRef.current && mounted.current) setRecord({ owner, visits, reminders, loading: false, error: '' });
    } catch (error) {
      if (version === generation.current && owner === ownerRef.current && mounted.current) {
        setRecord((old) => ({ ...old, loading: false, error: error.message || 'Unable to load visits. Check your connection and try again.' }));
      }
    }
  }, [authReady, owner]);

  useEffect(() => {
    if (!authReady) return;
    // Hide the previous account's visits immediately, and cancel its reminders.
    generation.current++;
    setRecord({ owner, visits: [], loading: true, error: '', reminders: {} });
    clearOtherOwnerReminders(owner).catch(() => {});
    refresh();
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active' && !busyRef.current) refresh(); });
    return () => { generation.current++; subscription.remove(); };
  }, [authReady, owner, refresh]);

  const busyRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const mutate = async (operation) => {
    if (busyRef.current) throw new Error('Please wait for the current change to finish.');
    if (!authReady || record.owner !== owner || record.loading || record.error) throw new Error('Refresh your visits before making changes.');
    busyRef.current = true;
    setSaving(true);
    const actingOwner = owner;
    try { return await operation(actingOwner); }
    finally { busyRef.current = false; if (mounted.current) setSaving(false); }
  };
  const commitVisits = async (visits, actingOwner) => {
    if (ownerRef.current !== actingOwner || !mounted.current) return;
    const version = ++generation.current;
    const sorted = sortVisits(visits);
    setRecord({ owner: actingOwner, visits: sorted, loading: false, error: '', reminders: {} });
    let reminders;
    try { reminders = await syncReminders(sorted, actingOwner); }
    catch { reminders = Object.fromEntries(sorted.map((v) => [v.id, v.reminder_hours ? 'error' : 'off'])); }
    if (generation.current === version && ownerRef.current === actingOwner && mounted.current) {
      setRecord({ owner: actingOwner, visits: sorted, loading: false, error: '', reminders });
    }
  };
  const saveVisit = (values, existingId) => mutate(async (actingOwner) => {
    if (!existingId && record.visits.length >= 50) throw new Error('You can save up to 50 visits. Remove an old visit to add another.');
    const id = existingId || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    const visit = { ...values, id };
    const items = existingId ? record.visits.map((v) => v.id === id ? visit : v) : [...record.visits, visit];
    if (actingOwner === 'guest') {
      await AsyncStorage.setItem(GUEST_KEY, JSON.stringify(items));
    } else {
      const payload = { ...visit, user_id: actingOwner };
      const query = existingId
        ? accounts.from('visits').update(payload).eq('id', id).eq('user_id', actingOwner)
        : accounts.from('visits').insert(payload);
      const { data, error } = await query.select('id').single();
      if (error) throw error;
      if (!data) throw new Error('The visit was not saved. Refresh and try again.');
    }
    let notificationWarning = '';
    if (values.reminder_hours && ownerRef.current === actingOwner) {
      try {
        if (!await requestReminderPermission()) notificationWarning = 'Your visit is saved, but notifications are not enabled on this device.';
      } catch { notificationWarning = 'Your visit is saved, but reminder permission could not be requested.'; }
    }
    await commitVisits(items, actingOwner);
    return notificationWarning;
  });
  const removeVisit = (id) => mutate(async (actingOwner) => {
    if (actingOwner === 'guest') {
      await AsyncStorage.setItem(GUEST_KEY, JSON.stringify(record.visits.filter((v) => v.id !== id)));
    } else {
      const { error } = await accounts.from('visits').delete().eq('id', id).eq('user_id', actingOwner);
      if (error) throw error;
    }
    await commitVisits(record.visits.filter((v) => v.id !== id), actingOwner);
  });
  const enableReminders = async () => {
    const granted = await requestReminderPermission();
    await refresh();
    return granted;
  };
  const signOut = async () => {
    if (busyRef.current) throw new Error('Wait for your visit to finish saving.');
    const { error } = await accounts.auth.signOut({ scope: 'local' });
    if (error) throw error;
  };
  const deleteAccount = async () => {
    if (busyRef.current) throw new Error('Wait for your visit to finish saving.');
    const { error } = await accounts.rpc('delete_my_account');
    if (error) throw error;
    await accounts.auth.signOut({ scope: 'local' });
    setSession(null);
  };
  const current = record.owner === owner ? record : { visits: [], reminders: {}, loading: true, error: '' };
  return (
    <Context.Provider value={{
      user: session?.user || null, owner, authReady, authError, accountsConfigured,
      ...current, saving, refresh, saveVisit, removeVisit, enableReminders, signOut, deleteAccount,
    }}>
      {children}
    </Context.Provider>
  );
}
export const useAppData = () => useContext(Context);
