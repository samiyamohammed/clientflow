import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, FolderKanban, DollarSign, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { clients, projects, payments } = useStore();

  const stats = useMemo(() => {
    const totalEarned = payments
      .filter(p => p.status === 'paid')
      .reduce((s, p) => s + Number(p.amount), 0);
    const pendingAmount = payments
      .filter(p => p.status === 'unpaid')
      .reduce((s, p) => s + Number(p.amount), 0);
    const activeProjects = projects.filter(p => p.status === 'in-progress').length;
    return { totalEarned, pendingAmount, activeProjects };
  }, [payments, projects]);

  const recentClients = [...clients].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  const recentProjects = [...projects].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Welcome back — here's your overview</p>
        </div>
        <div className={styles.glow} />
      </motion.div>

      <div className={styles.statsGrid}>
        <StatCard icon={Users}        label="Total Clients"    value={clients.length}  color="accent" index={0} />
        <StatCard icon={FolderKanban} label="Active Projects"  value={stats.activeProjects} color="blue" index={1} />
        <StatCard icon={DollarSign}   label="Total Earned"     value={`$${stats.totalEarned.toLocaleString()}`} color="green" index={2} />
        <StatCard icon={Clock}        label="Pending Payments" value={`$${stats.pendingAmount.toLocaleString()}`} color="yellow" index={3} />
      </div>

      <div className={styles.grid}>
        {/* Recent Clients */}
        <motion.div
          className={styles.panel}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Recent Clients</span>
            <Link to="/clients" className={styles.seeAll}>
              See all <ArrowRight size={13} />
            </Link>
          </div>
          {recentClients.length === 0 ? (
            <EmptyState msg="No clients yet" />
          ) : (
            <div className={styles.list}>
              {recentClients.map((c, i) => (
                <motion.div
                  key={c.id}
                  className={styles.listItem}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                >
                  <div className={styles.avatar}>{c.name[0].toUpperCase()}</div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{c.name}</span>
                    <span className={styles.itemSub}>{c.email}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Projects */}
        <motion.div
          className={styles.panel}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
        >
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Recent Projects</span>
            <Link to="/projects" className={styles.seeAll}>
              See all <ArrowRight size={13} />
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <EmptyState msg="No projects yet" />
          ) : (
            <div className={styles.list}>
              {recentProjects.map((p, i) => {
                const client = clients.find(c => c.id === p.clientId);
                return (
                  <motion.div
                    key={p.id}
                    className={styles.listItem}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                  >
                    <div className={`${styles.avatar} ${styles.projectAvatar}`}>
                      <TrendingUp size={14} />
                    </div>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{p.name}</span>
                      <span className={styles.itemSub}>{client?.name ?? 'Unknown'}</span>
                    </div>
                    <Badge status={p.status} />
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function EmptyState({ msg }) {
  return (
    <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
      {msg}
    </div>
  );
}
