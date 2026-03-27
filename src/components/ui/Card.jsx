function Card({ children, style }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
        padding: '32px',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export default Card
