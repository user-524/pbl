const NODE_COLORS = {
  Function: '#2563eb',
  Condition: '#f59e0b',
  Return: '#10b981',
}

function getNodeColor(type) {
  return NODE_COLORS[type] || '#6b7280'
}

function AstNode({ node, depth }) {
  const color = getNodeColor(node.type)

  return (
    <div style={depth > 0 ? styles.childWrapper : undefined}>
      <div style={styles.nodeRow}>
        <span style={{ ...styles.typeBadge, backgroundColor: color }}>
          {node.type}
        </span>
        <span style={styles.nodeName}>{node.name}</span>
      </div>
      {node.children && node.children.length > 0 && (
        <div style={styles.childrenContainer}>
          {node.children.map((child, index) => (
            <AstNode key={index} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function AstTreeViewer({ data }) {
  if (!data) return null
  return (
    <div style={styles.container}>
      <AstNode node={data} depth={0} />
    </div>
  )
}

const styles = {
  container: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '16px',
    fontFamily: 'monospace',
    fontSize: '14px',
  },
  nodeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 0',
  },
  typeBadge: {
    color: '#ffffff',
    borderRadius: '6px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  nodeName: {
    color: '#111827',
  },
  childWrapper: {
    borderLeft: '2px solid #d1d5db',
    marginLeft: '12px',
    paddingLeft: '12px',
  },
  childrenContainer: {
    marginLeft: '4px',
  },
}

export default AstTreeViewer
