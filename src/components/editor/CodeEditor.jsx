import Editor from '@monaco-editor/react'

function CodeEditor({ language, value, onChange }) {
  return (
    <div style={styles.wrapper}>
      <Editor
        height="320px"
        language={language}
        value={value}
        onChange={(newValue) => onChange(newValue || '')}
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