/**
 * 클라이언트 사이드 간이 AST 파서
 * 외부 라이브러리 없이 정규식 기반으로 코드 구조를 파싱한다.
 * 기존 AstTreeViewer 호환 형식 { type, name, line, children[] } 반환.
 */

function makeNode(type, name, line, children = []) {
  return { type, name, line, children }
}

// ─── Python 파서 ───────────────────────────────────────────────

function parsePython(code) {
  const lines = code.split('\n')
  const root = makeNode('Module', 'module', 0)

  const stack = [{ node: root, indent: -1 }]

  const getIndent = (line) => {
    const match = line.match(/^(\s*)/)
    return match ? match[1].length : 0
  }

  lines.forEach((rawLine, i) => {
    const lineNum = i + 1
    const trimmed = rawLine.trim()
    if (!trimmed) return

    const indent = getIndent(rawLine)
    let node = null

    const funcMatch = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/)
    if (funcMatch) {
      node = makeNode('Function', `def ${funcMatch[1]}(${funcMatch[2]})`, lineNum)
    }

    const classMatch = !node && trimmed.match(/^class\s+(\w+)[\s:(]/)
    if (classMatch) {
      node = makeNode('Class', `class ${classMatch[1]}`, lineNum)
    }

    const ifMatch = !node && trimmed.match(/^(if|elif)\s+(.+):$/)
    if (ifMatch) {
      node = makeNode('Condition', `${ifMatch[1]} ${ifMatch[2].substring(0, 30)}`, lineNum)
    }

    const elseMatch = !node && trimmed.match(/^else\s*:$/)
    if (elseMatch) {
      node = makeNode('Condition', 'else', lineNum)
    }

    const forMatch = !node && trimmed.match(/^for\s+(.+)\s+in\s+(.+):$/)
    if (forMatch) {
      node = makeNode('Loop', `for ${forMatch[1]} in ${forMatch[2].substring(0, 20)}`, lineNum)
    }

    const whileMatch = !node && trimmed.match(/^while\s+(.+):$/)
    if (whileMatch) {
      node = makeNode('Loop', `while ${whileMatch[1].substring(0, 30)}`, lineNum)
    }

    const returnMatch = !node && trimmed.match(/^return\s*(.*)/)
    if (returnMatch) {
      node = makeNode('Return', `return ${returnMatch[1].substring(0, 30)}`, lineNum)
    }

    const tryMatch = !node && trimmed.match(/^try\s*:$/)
    if (tryMatch) {
      node = makeNode('TryCatch', 'try', lineNum)
    }

    const exceptMatch = !node && trimmed.match(/^except(\s+.+)?\s*:$/)
    if (exceptMatch) {
      node = makeNode('TryCatch', `except${exceptMatch[1] || ''}`, lineNum)
    }

    if (!node) return

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }

    stack[stack.length - 1].node.children.push(node)
    stack.push({ node, indent })
  })

  return root.children.length === 1 ? root.children[0] : root
}

// ─── JS/Java 파서 (중괄호 기반) ───────────────────────────────────

function parseJsJava(code) {
  const lines = code.split('\n')
  const root = makeNode('Module', 'module', 0)
  const stack = [{ node: root, depth: 0 }]
  let braceDepth = 0

  const patterns = [
    {
      re: /(?:^|\s)(?:async\s+)?function\s+(\w+)\s*\(/,
      type: 'Function',
      label: (m) => `function ${m[1]}`,
    },
    {
      re: /(?:^|\s)(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(?[^)]*\)?\s*=>/,
      type: 'Function',
      label: (m) => `${m[1]} =>`,
    },
    {
      re: /(?:public|private|protected|static)[\s\w]*\s+(\w+)\s*\([^)]*\)\s*(?:throws\s+\w+\s*)?\{/,
      type: 'Function',
      label: (m) => `${m[1]}()`,
    },
    {
      re: /(?:^|\s)class\s+(\w+)/,
      type: 'Class',
      label: (m) => `class ${m[1]}`,
    },
    {
      re: /(?:^|\s)if\s*\((.{0,30})\)/,
      type: 'Condition',
      label: (m) => `if (${m[1]})`,
    },
    {
      re: /(?:^|\s)else(?:\s+if\s*\((.{0,20})\))?/,
      type: 'Condition',
      label: (m) => m[1] ? `else if (${m[1]})` : 'else',
    },
    {
      re: /(?:^|\s)for\s*\((.{0,30})\)/,
      type: 'Loop',
      label: (m) => `for (${m[1]})`,
    },
    {
      re: /(?:^|\s)while\s*\((.{0,30})\)/,
      type: 'Loop',
      label: (m) => `while (${m[1]})`,
    },
    {
      re: /(?:^|\s)return\s*(.{0,30})/,
      type: 'Return',
      label: (m) => `return ${m[1]}`,
    },
    {
      re: /(?:^|\s)try\s*\{/,
      type: 'TryCatch',
      label: () => 'try',
    },
    {
      re: /(?:^|\s)catch\s*\(/,
      type: 'TryCatch',
      label: () => 'catch',
    },
    {
      re: /(?:^|\s)(?:const|let|var)\s+(\w+)\s*=/,
      type: 'Variable',
      label: (m) => `var ${m[1]}`,
    },
  ]

  lines.forEach((rawLine, i) => {
    const lineNum = i + 1
    const trimmed = rawLine.trim()

    const openCount = (rawLine.match(/\{/g) || []).length
    const closeCount = (rawLine.match(/\}/g) || []).length

    let matchedNode = null

    for (const { re, type, label } of patterns) {
      const m = trimmed.match(re)
      if (m) {
        matchedNode = makeNode(type, label(m), lineNum)
        break
      }
    }

    if (matchedNode) {
      while (stack.length > 1 && stack[stack.length - 1].depth >= braceDepth) {
        stack.pop()
      }
      stack[stack.length - 1].node.children.push(matchedNode)
      if (openCount > closeCount) {
        stack.push({ node: matchedNode, depth: braceDepth + openCount - closeCount })
      }
    }

    braceDepth += openCount - closeCount
    if (braceDepth < 0) braceDepth = 0
  })

  return root.children.length === 1 ? root.children[0] : root
}

// ─── 공개 API ─────────────────────────────────────────────────────

export function parseCodeToAst(code, language) {
  if (!code || !code.trim()) {
    return makeNode('Module', '(비어있음)', 1)
  }

  try {
    if (language === 'python') {
      return parsePython(code)
    }
    return parseJsJava(code)
  } catch {
    return makeNode('Module', '파싱 오류', 1)
  }
}
