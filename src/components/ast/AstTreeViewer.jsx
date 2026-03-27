import { useState } from 'react'

const NODE_COLORS = {
  Function: '#569cd6',
  Class: '#4ec9b0',
  Condition: '#ce9178',
  Return: '#6a9955',
  Loop: '#c586c0',
  Variable: '#9cdcfe',
  TryCatch: '#dcdcaa',
  Module: '#858585',
}

function getNodeColor(type) {
  return NODE_COLORS[type] || '#858585'
}

function AstNode({ node, depth, onNodeClick }) {
  const [collapsed, setCollapsed] = useState(false)
  const color = getNodeColor(node.type)
  const hasChildren = node.children && node.children.length > 0

  const handleToggle = (e) => {
    e.stopPropagation()
    setCollapsed((prev) => !prev)
  }

  const handleClick = () => {
    if (onNodeClick && node.line) {
      onNodeClick(node.line)
    }
  }

  return (
    <div style={depth > 0 ? styles.childWrapper : undefined}>
      <div
        style={{ ...styles.nodeRow, cursor: onNodeClick ? 'pointer' : 'default' }}
        onClick={handleClick}
      >
        {hasChildren && (
          <span style={styles.toggle} onClick={handleToggle}>
            {collapsed ? '▶' : '▼'}
          </span>
        )}
        {!hasChildren && <span style={styles.togglePlaceholder} />}

        <span style={{ ...styles.typeBadge, backgroundColor: color }}>
          {node.type}
        </span>
        <span style={styles.nodeName}>{node.name}</span>
        {node.line && (
          <span style={styles.lineNum}>:{node.line}</span>
        )}
      </div>

      {!collapsed && hasChildren && (
        <div style={styles.childrenContainer}>
          {node.children.map((child, index) => (
            <AstNode
              key={index}
              node={child}
              depth={depth + 1}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AstTreeViewer({ data, onNodeClick }) {
  if (!data) {
    return (
      <div style={styles.container}>
        <p style={styles.empty}>코드를 입력하면 AST가 표시됩니다.</p>
      </div>
    )
  }
  return (
    <div style={styles.container}>
      <AstNode node={data} depth={0} onNodeClick={onNodeClick} />
    </div>
  )
}

const styles = {
  container: {
    backgroundColor: 'var(--color-ide-bg)',
    height: '100%',
    padding: '12px',
    fontFamily: '"Consolas", "Monaco", monospace',
    fontSize: '13px',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  empty: {
    color: 'var(--color-ide-text-dim)',
    fontStyle: 'italic',
    margin: '16px 0',
  },
  nodeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 4px',
    borderRadius: '4px',
  },
  toggle: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '10px',
    width: '14px',
    flexShrink: 0,
    cursor: 'pointer',
    userSelect: 'none',
  },
  togglePlaceholder: {
    width: '14px',
    flexShrink: 0,
  },
  typeBadge: {
    color: '#1e1e1e',
    borderRadius: '4px',
    padding: '1px 6px',
    fontSize: '11px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  nodeName: {
    color: 'var(--color-ide-text)',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  lineNum: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
    flexShrink: 0,
  },
  childWrapper: {
    borderLeft: '1px solid #3e3e42',
    marginLeft: '18px',
    paddingLeft: '6px',
  },
  childrenContainer: {
    marginLeft: '2px',
  },
}

export default AstTreeViewer
