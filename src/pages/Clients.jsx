import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Mail, Phone, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';
import FormField, { Input, Textarea } from '../components/FormField';
import styles from './Clients.module.css';

const empty = { name: '', email: '', phone: '', notes: '' };

export default function Clients() {
  const { clients, projects, addClient, updateClient, deleteClient } = useStore();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(empty); setErrors({}); setModal(true); };
  const openEdit = (c) => { setEditing(c.id); setForm({ name: c.name, email: c.email, phone: c.phone, notes: c.notes }); setErrors({}); setModal(true); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    editing ? updateClient(editing, form) : addClient(form);
    setModal(false);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this client and all their projects/payments?')) deleteClient(id);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Clients</h1>
          <p className={styles.subtitle}>{clients.length} total client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>
          <Plus size={16} /> Add Client
        </button>
      </div>

      <div className={styles.searchWrap}>
        <Search size={15} className={styles.searchIcon} />
        <input
          className={styles.search}
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState onAdd={openAdd} hasSearch={!!search} />
      ) : (
        <div className={styles.grid}>
          <AnimatePresence>
            {filtered.map((c, i) => {
              const projCount = projects.filter(p => p.clientId === c.id).length;
              return (
                <motion.div
                  key={c.id}
                  className={styles.card}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  layout
                >
                  <div className={styles.cardTop}>
                    <div className={styles.avatar}>{c.name[0].toUpperCase()}</div>
                    <div className={styles.actions}>
                      <button className={styles.iconBtn} onClick={() => openEdit(c)} aria-label="Edit">
                        <Pencil size={14} />
                      </button>
                      <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => handleDelete(c.id)} aria-label="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h3 className={styles.name}>{c.name}</h3>
                  <div className={styles.meta}>
                    {c.email && <span><Mail size={12} /> {c.email}</span>}
                    {c.phone && <span><Phone size={12} /> {c.phone}</span>}
                  </div>
                  {c.notes && <p className={styles.notes}>{c.notes}</p>}
                  <div className={styles.cardFooter}>
                    <span className={styles.projCount}>{projCount} project{projCount !== 1 ? 's' : ''}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Client' : 'Add Client'}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField label="Name" error={errors.name}>
            <Input placeholder="Jane Doe" value={form.name} onChange={set('name')} />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <Input type="email" placeholder="jane@example.com" value={form.email} onChange={set('email')} />
          </FormField>
          <FormField label="Phone">
            <Input placeholder="+1 555 000 0000" value={form.phone} onChange={set('phone')} />
          </FormField>
          <FormField label="Notes">
            <Textarea placeholder="Any notes about this client..." value={form.notes} onChange={set('notes')} />
          </FormField>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>
              {editing ? 'Save Changes' : 'Add Client'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function EmptyState({ onAdd, hasSearch }) {
  return (
    <motion.div
      className={styles.empty}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <User size={40} strokeWidth={1} />
      <p>{hasSearch ? 'No clients match your search' : 'No clients yet'}</p>
      {!hasSearch && (
        <button className={styles.addBtn} onClick={onAdd}>
          <Plus size={15} /> Add your first client
        </button>
      )}
    </motion.div>
  );
}
