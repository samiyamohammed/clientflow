import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, FolderKanban, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';
import FormField, { Input, Textarea, Select } from '../components/FormField';
import Badge from '../components/Badge';
import styles from './Projects.module.css';

const empty = { name: '', description: '', clientId: '', status: 'pending' };
const statuses = ['pending', 'in-progress', 'done'];

export default function Projects() {
  const { clients, projects, addProject, updateProject, deleteProject } = useStore();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);
  const sorted = [...filtered].sort((a, b) => b.createdAt - a.createdAt);

  const openAdd = () => { setEditing(null); setForm(empty); setErrors({}); setModal(true); };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, description: p.description, clientId: p.clientId, status: p.status });
    setErrors({});
    setModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.clientId) e.clientId = 'Select a client';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    editing ? updateProject(editing, form) : addProject(form);
    setModal(false);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this project and its payments?')) deleteProject(id);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const counts = {
    all: projects.length,
    pending: projects.filter(p => p.status === 'pending').length,
    'in-progress': projects.filter(p => p.status === 'in-progress').length,
    done: projects.filter(p => p.status === 'done').length,
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.subtitle}>{projects.length} total project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>
          <Plus size={16} /> New Project
        </button>
      </div>

      <div className={styles.filters}>
        {['all', ...statuses].map(s => (
          <button
            key={s}
            className={`${styles.filterBtn} ${filter === s ? styles.active : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'All' : s.replace('-', ' ')}
            <span className={styles.filterCount}>{counts[s]}</span>
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <div className={styles.list}>
          <AnimatePresence>
            {sorted.map((p, i) => {
              const client = clients.find(c => c.id === p.clientId);
              return (
                <motion.div
                  key={p.id}
                  className={styles.card}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  layout
                >
                  <div className={styles.cardLeft}>
                    <div className={styles.iconWrap}><FolderKanban size={16} /></div>
                    <div className={styles.info}>
                      <span className={styles.name}>{p.name}</span>
                      {p.description && <span className={styles.desc}>{p.description}</span>}
                      <span className={styles.client}>{client?.name ?? 'Unknown client'}</span>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <Badge status={p.status} />
                    <div className={styles.actions}>
                      <button className={styles.iconBtn} onClick={() => openEdit(p)} aria-label="Edit">
                        <Pencil size={13} />
                      </button>
                      <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => handleDelete(p.id)} aria-label="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Project' : 'New Project'}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField label="Project Name" error={errors.name}>
            <Input placeholder="Website Redesign" value={form.name} onChange={set('name')} />
          </FormField>
          <FormField label="Client" error={errors.clientId}>
            <Select value={form.clientId} onChange={set('clientId')}>
              <option value="">Select a client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={set('status')}>
              {statuses.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
            </Select>
          </FormField>
          <FormField label="Description">
            <Textarea placeholder="Brief project description..." value={form.description} onChange={set('description')} />
          </FormField>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>
              {editing ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <motion.div className={styles.empty} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <FolderKanban size={40} strokeWidth={1} />
      <p>No projects yet</p>
      <button className={styles.addBtn} onClick={onAdd}><Plus size={15} /> Create first project</button>
    </motion.div>
  );
}
