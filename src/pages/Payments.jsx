import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, CreditCard, DollarSign, CheckCircle2, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';
import FormField, { Input, Select } from '../components/FormField';
import Badge from '../components/Badge';
import styles from './Payments.module.css';

const empty = { projectId: '', amount: '', status: 'unpaid', description: '' };

export default function Payments() {
  const { clients, projects, payments, addPayment, updatePayment, deletePayment } = useStore();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);
  const sorted = [...filtered].sort((a, b) => b.createdAt - a.createdAt);

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const totalUnpaid = payments.filter(p => p.status === 'unpaid').reduce((s, p) => s + Number(p.amount), 0);

  const openAdd = () => { setEditing(null); setForm(empty); setErrors({}); setModal(true); };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({ projectId: p.projectId, amount: p.amount, status: p.status, description: p.description ?? '' });
    setErrors({});
    setModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.projectId) e.projectId = 'Select a project';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    editing ? updatePayment(editing, form) : addPayment(form);
    setModal(false);
  };

  const toggleStatus = (p) => {
    updatePayment(p.id, { status: p.status === 'paid' ? 'unpaid' : 'paid' });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this payment?')) deletePayment(id);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const getProjectClient = (projectId) => {
    const proj = projects.find(p => p.id === projectId);
    const client = clients.find(c => c.id === proj?.clientId);
    return { proj, client };
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Payments</h1>
          <p className={styles.subtitle}>{payments.length} total payment{payments.length !== 1 ? 's' : ''}</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>
          <Plus size={16} /> Add Payment
        </button>
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <CheckCircle2 size={16} className={styles.greenIcon} />
          <div>
            <span className={styles.summaryLabel}>Collected</span>
            <span className={styles.summaryValue}>${totalPaid.toLocaleString()}</span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <Clock size={16} className={styles.yellowIcon} />
          <div>
            <span className={styles.summaryLabel}>Pending</span>
            <span className={styles.summaryValue}>${totalUnpaid.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        {['all', 'paid', 'unpaid'].map(s => (
          <button
            key={s}
            className={`${styles.filterBtn} ${filter === s ? styles.active : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'All' : s}
            <span className={styles.filterCount}>
              {s === 'all' ? payments.length : payments.filter(p => p.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <div className={styles.list}>
          <AnimatePresence>
            {sorted.map((p, i) => {
              const { proj, client } = getProjectClient(p.projectId);
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
                    <div className={`${styles.iconWrap} ${p.status === 'paid' ? styles.paidIcon : styles.unpaidIcon}`}>
                      <DollarSign size={15} />
                    </div>
                    <div className={styles.info}>
                      <span className={styles.amount}>${Number(p.amount).toLocaleString()}</span>
                      <span className={styles.project}>{proj?.name ?? 'Unknown project'}</span>
                      {client && <span className={styles.client}>{client.name}</span>}
                      {p.description && <span className={styles.desc}>{p.description}</span>}
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <Badge status={p.status} />
                    <button
                      className={styles.toggleBtn}
                      onClick={() => toggleStatus(p)}
                      title={p.status === 'paid' ? 'Mark as unpaid' : 'Mark as paid'}
                    >
                      {p.status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                    </button>
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

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Payment' : 'Add Payment'}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField label="Project" error={errors.projectId}>
            <Select value={form.projectId} onChange={set('projectId')}>
              <option value="">Select a project...</option>
              {projects.map(p => {
                const c = clients.find(cl => cl.id === p.clientId);
                return <option key={p.id} value={p.id}>{p.name} {c ? `(${c.name})` : ''}</option>;
              })}
            </Select>
          </FormField>
          <FormField label="Amount ($)" error={errors.amount}>
            <Input type="number" min="0" step="0.01" placeholder="500.00" value={form.amount} onChange={set('amount')} />
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={set('status')}>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </Select>
          </FormField>
          <FormField label="Description">
            <Input placeholder="Invoice #001, milestone, etc." value={form.description} onChange={set('description')} />
          </FormField>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>
              {editing ? 'Save Changes' : 'Add Payment'}
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
      <CreditCard size={40} strokeWidth={1} />
      <p>No payments yet</p>
      <button className={styles.addBtn} onClick={onAdd}><Plus size={15} /> Add first payment</button>
    </motion.div>
  );
}
