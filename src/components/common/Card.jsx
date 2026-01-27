import styles from './Card.module.css';

export default function Card({
  children,
  variant = 'default',
  padding = 'medium',
  hover = false,
  onClick,
  className = ''
}) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`
        ${styles.card}
        ${styles[variant]}
        ${styles[`padding-${padding}`]}
        ${hover ? styles.hover : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`${styles.header} ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={`${styles.body} ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`${styles.footer} ${className}`}>
      {children}
    </div>
  );
}
