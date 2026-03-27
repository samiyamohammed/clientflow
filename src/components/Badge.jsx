import styles from './Badge.module.css';

const variants = {
  pending:    'yellow',
  'in-progress': 'blue',
  done:       'green',
  paid:       'green',
  unpaid:     'red',
};

export default function Badge({ status }) {
  const color = variants[status] ?? 'default';
  return (
    <span className={`${styles.badge} ${styles[color]}`}>
      {status.replace('-', ' ')}
    </span>
  );
}
