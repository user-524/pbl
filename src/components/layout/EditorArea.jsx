import { useRef, useState, useEffect, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import AstTreeViewer from '../ast/AstTreeViewer.jsx'
import { parseCodeToAst } from '../../utils/simpleAstParser.js'

function EditorArea({ value, language, onChange }) {
  const editorRef = useRef(null)
  const dividerRef = useRef(null)
  const containerRef = useRef(null)

  const [astData, setAstData] = useState(null)
  const [splitRatio, setSplitRatio] = useState(50) // 왼쪽 %
  const [isDragging, setIsDragging] = useState(false)

  // 코드 변경 시 300ms debounce로 AST 갱신
  const debounceTimer = useRef(null)
  useEffect(() => {
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      const ast = parseCodeToAst(value || '', language)
      setAstData(ast)
    }, 300)
    return () => clearTimeout(debounceTimer.current)
  }, [value, language])

  // 드래그로 분할 비율 조절
  const handleDividerMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const newRatio = ((e.clientX - rect.left) / rect.width) * 100
    setSplitRatio(Math.min(70, Math.max(30, newRatio)))
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleEditorMount = (editor) => {
    editorRef.current = editor
  }

  const handleNodeClick = (line) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(line)
      editorRef.current.setPosition({ lineNumber: line, column: 1 })
      editorRef.current.focus()
    }
  }

  return (
    <div
      ref={containerRef}
      style={{ ...styles.container, cursor: isDragging ? 'col-resize' : 'default' }}
    >
      {/* 왼쪽: 코드 에디터 */}
      <div style={{ ...styles.panel, width: `${splitRatio}%` }}>
        <div style={styles.panelHeader}>
          <span style={styles.panelLabel}>코드 에디터</span>
        </div>
        <div style={styles.editorWrapper}>
          <Editor
            height="100%"
            language={language}
            value={value}
            onChange={(newValue) => onChange && onChange(newValue || '')}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              tabSize: 2,
            }}
          />
        </div>
      </div>

      {/* 구분선 */}
      <div
        ref={dividerRef}
        style={styles.divider}
        onMouseDown={handleDividerMouseDown}
      />

      {/* 오른쪽: AST 트리 */}
      <div style={{ ...styles.panel, flex: 1 }}>
        <div style={styles.panelHeader}>
          <span style={styles.panelLabel}>AST 트리 (실시간)</span>
        </div>
        <div style={styles.astWrapper}>
          <AstTreeViewer data={astData} onNodeClick={handleNodeClick} />
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    backgroundColor: 'var(--color-ide-bg)',
    userSelect: 'none',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  panelHeader: {
    height: '32px',
    backgroundColor: 'var(--color-ide-titlebar)',
    borderBottom: '1px solid var(--color-ide-border)',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '12px',
    flexShrink: 0,
  },
  panelLabel: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '12px',
    fontWeight: '500',
  },
  editorWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  astWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  divider: {
    width: '4px',
    backgroundColor: 'var(--color-ide-border)',
    cursor: 'col-resize',
    flexShrink: 0,
    transition: 'background-color 0.15s',
  },
}

export default EditorArea
