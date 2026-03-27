import { motion } from 'framer-motion';
import styles from './StatCard.module.css';

export default function StatCard({ icon: Icon, label, value, sub, color = 'accent', index = 0 }) {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3, ease: 'easeOut' }}
    >
      <div className={`${styles.iconWrap} ${styles[color]}`}>
        <Icon size={18} />
      </div>
      <div className={styles.info}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        {sub && <span className={styles.sub}>{sub}</span>}
      </div>
    </motion.div>
  );
}
