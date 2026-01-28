import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  icon: Icon,
  className = ''
}) {
  return (
    <button
      type={type}
      className={`
        ${styles.button}
        ${styles[variant]}
        ${styles[size]}
        ${fullWidth ? styles.fullWidth : ''}
        ${className}
      `}
      disabled={disabled}
      onClick={onClick}
    >
      {Icon && <Icon className={styles.icon} size={size === 'small' ? 16 : 20} />}
      {children}
    </button>
  );
}
