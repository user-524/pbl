const COLOR_MAP = {
  blue: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  orange: { backgroundColor: '#fef3c7', color: '#b45309' },
  green: { backgroundColor: '#d1fae5', color: '#065f46' },
  gray: { backgroundColor: '#f3f4f6', color: '#374151' },
}

function Badge({ color = 'gray', children }) {
  return (
    <span
      style={{
        ...COLOR_MAP[color],
        borderRadius: '999px',
        padding: '4px 10px',
        fontSize: '13px',
        fontWeight: '600',
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  )
}

export default Badge
