import { useState, useEffect, useCallback } from 'react';

const KEYS = { clients: 'cf_clients', projects: 'cf_projects', payments: 'cf_payments' };

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

let listeners = [];
let state = {
  clients:  load(KEYS.clients,  []),
  projects: load(KEYS.projects, []),
  payments: load(KEYS.payments, []),
};

const notify = () => listeners.forEach(fn => fn({ ...state }));

const setState = (patch) => {
  state = { ...state, ...patch };
  Object.entries(patch).forEach(([k, v]) => save(KEYS[k], v));
  notify();
};

export const useStore = () => {
  const [snap, setSnap] = useState({ ...state });

  useEffect(() => {
    listeners.push(setSnap);
    return () => { listeners = listeners.filter(fn => fn !== setSnap); };
  }, []);

  const addClient = useCallback((client) => {
    const c = { ...client, id: crypto.randomUUID(), createdAt: Date.now() };
    setState({ clients: [...state.clients, c] });
    return c;
  }, []);

  const updateClient = useCallback((id, patch) => {
    setState({ clients: state.clients.map(c => c.id === id ? { ...c, ...patch } : c) });
  }, []);

  const deleteClient = useCallback((id) => {
    setState({
      clients:  state.clients.filter(c => c.id !== id),
      projects: state.projects.filter(p => p.clientId !== id),
      payments: state.payments.filter(p => {
        const proj = state.projects.find(pr => pr.id === p.projectId);
        return proj?.clientId !== id;
      }),
    });
  }, []);

  const addProject = useCallback((project) => {
    const p = { ...project, id: crypto.randomUUID(), createdAt: Date.now() };
    setState({ projects: [...state.projects, p] });
    return p;
  }, []);

  const updateProject = useCallback((id, patch) => {
    setState({ projects: state.projects.map(p => p.id === id ? { ...p, ...patch } : p) });
  }, []);

  const deleteProject = useCallback((id) => {
    setState({
      projects: state.projects.filter(p => p.id !== id),
      payments: state.payments.filter(p => p.projectId !== id),
    });
  }, []);

  const addPayment = useCallback((payment) => {
    const p = { ...payment, id: crypto.randomUUID(), createdAt: Date.now() };
    setState({ payments: [...state.payments, p] });
    return p;
  }, []);

  const updatePayment = useCallback((id, patch) => {
    setState({ payments: state.payments.map(p => p.id === id ? { ...p, ...patch } : p) });
  }, []);

  const deletePayment = useCallback((id) => {
    setState({ payments: state.payments.filter(p => p.id !== id) });
  }, []);

  return {
    ...snap,
    addClient, updateClient, deleteClient,
    addProject, updateProject, deleteProject,
    addPayment, updatePayment, deletePayment,
  };
};
