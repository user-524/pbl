import Editor from '@monaco-editor/react'

function CodeEditor({ language, value, onChange, readOnly = false, height = '320px' }) {
  return (
    <div style={styles.wrapper}>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={readOnly ? undefined : (newValue) => onChange(newValue || '')}
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
          readOnly,
        }}
      />
    </div>
  )
}

const styles = {
  wrapper: {
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #d0d7de',
  },
}

export default CodeEditor