function Spinner({ size = 32, color = 'var(--color-primary)' }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid ${color}22`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block',
      }}
    />
  )
}

export default Spinner
