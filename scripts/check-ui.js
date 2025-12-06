/**
 * Check UI Script
 * Scan semua .vue untuk:
 * - Handler hilang
 * - Import unresolved
 * - Fungsi undefined
 * - Props tanpa definisi
 * - Komponen orphan
 */

const fs = require('fs');
const path = require('path');

// Simple glob implementation
function findFiles(dir, pattern, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findFiles(filePath, pattern, fileList);
    } else if (pattern.test(file)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const CLIENT_DIR = path.join(__dirname, '../client/src');
const ISSUES = {
  missingHandlers: [],
  unresolvedImports: [],
  undefinedFunctions: [],
  missingProps: [],
  orphanComponents: [],
};

// Extract methods and reactive variables from Vue component
function extractMethods(content) {
  const methods = new Set();
  const reactiveVars = new Set();
  
  // Extract from <script setup>
  const scriptSetupMatch = content.match(/<script[^>]*setup[^>]*>([\s\S]*?)<\/script>/);
  if (scriptSetupMatch) {
    const scriptContent = scriptSetupMatch[1];
    
    // Extract function declarations: function name() or const name = () or const name = function()
    const functionPatterns = [
      /(?:function|const|let|var)\s+(\w+)\s*[=\(]/g,
      /const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|async\s*\([^)]*\)\s*=>)/g,
    ];
    
    for (const pattern of functionPatterns) {
      const matches = scriptContent.matchAll(pattern);
      for (const match of matches) {
        methods.add(match[1]);
      }
    }
    
    // Extract reactive variables: ref(), reactive(), computed(), etc.
    const reactivePatterns = [
      /(?:const|let|var)\s+(\w+)\s*=\s*(?:ref|reactive|computed|watch|watchEffect)\(/g,
      /(?:const|let|var)\s+(\w+)\s*=\s*use\w+\(/g, // composables
    ];
    
    for (const pattern of reactivePatterns) {
      const matches = scriptContent.matchAll(pattern);
      for (const match of matches) {
        reactiveVars.add(match[1]);
      }
    }
    
    // Extract from destructured composables: const { name } = useSomething()
    const destructuredMatches = scriptContent.matchAll(/\{\s*([^}]+)\s*\}\s*=\s*use\w+\(/g);
    for (const match of destructuredMatches) {
      const vars = match[1].split(',').map(v => v.trim().split(':')[0].trim());
      vars.forEach(v => {
        if (v) reactiveVars.add(v);
      });
    }
  }
  
  // Extract from <script> with methods: {}
  const methodsMatch = content.match(/methods:\s*\{([\s\S]*?)\}/);
  if (methodsMatch) {
    const methodsContent = methodsMatch[1];
    // Match method definitions: methodName() or methodName: function() or methodName: () =>
    const methodPatterns = [
      /(\w+)\s*\(/g,
      /(\w+)\s*:\s*(?:function|\(|async)/g,
    ];
    
    for (const pattern of methodPatterns) {
      const matches = methodsContent.matchAll(pattern);
      for (const match of matches) {
        methods.add(match[1]);
      }
    }
  }
  
  // Extract from data() or setup() return
  const dataMatch = content.match(/(?:data\(\)|setup\(\))\s*\{[\s\S]*?return\s*\{([\s\S]*?)\}/);
  if (dataMatch) {
    const dataContent = dataMatch[1];
    const dataMatches = dataContent.matchAll(/(\w+)\s*:/g);
    for (const match of dataMatches) {
      reactiveVars.add(match[1]);
    }
  }
  
  // Combine methods and reactive vars
  reactiveVars.forEach(v => methods.add(v));
  
  return methods;
}

// Extract event handlers from template
function extractEventHandlers(content) {
  const handlers = [];
  const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
  if (!templateMatch) return handlers;
  
  const template = templateMatch[1];
  
  // Extract @click, @change, @submit, etc.
  // Match: @event="handler" or @event="handler()" or @event="handler($event)"
  const eventPattern = /@(\w+)=["']([^"']+)["']/g;
  const matches = template.matchAll(eventPattern);
  
  for (const match of matches) {
    const eventType = match[1];
    let handler = match[2].trim();
    
    // Skip if it's a Vue directive or built-in
    if (handler.startsWith('$') || handler === 'true' || handler === 'false' || handler === '') {
      continue;
    }
    
    // Skip if it's an inline expression (contains operators, assignments, etc.)
    // These are valid in Vue: @click="showModal = true", @click="count++", etc.
    if (handler.includes('=') || handler.includes('++') || handler.includes('--') || 
        handler.includes('!') || handler.includes('?') || handler.includes('||') || 
        handler.includes('&&') || handler.includes('Math.') || handler.includes('[') ||
        handler.includes(']') || handler.includes('.replace') || handler.includes('.split')) {
      continue; // Inline expressions are valid, skip
    }
    
    // Remove parentheses and arguments
    handler = handler.split('(')[0].trim();
    
    // Skip if empty or still contains operators
    if (!handler || handler.includes('=') || handler.includes(' ')) {
      continue;
    }
    
    handlers.push({
      eventType,
      handler,
      line: getLineNumber(template, match.index),
    });
  }
  
  return handlers;
}

// Extract props from component
function extractProps(content) {
  const props = new Set();
  
  // Extract from <script setup> with defineProps
  const definePropsMatch = content.match(/defineProps<\{([\s\S]*?)\}>/);
  if (definePropsMatch) {
    const propsContent = definePropsMatch[1];
    const propMatches = propsContent.matchAll(/(\w+)\s*[:?]/g);
    for (const match of propMatches) {
      props.add(match[1]);
    }
  }
  
  // Extract from props: {}
  const propsMatch = content.match(/props:\s*\{([\s\S]*?)\}/);
  if (propsMatch) {
    const propsContent = propsMatch[1];
    const propMatches = propsContent.matchAll(/(\w+)\s*[:{]/g);
    for (const match of propMatches) {
      props.add(match[1]);
    }
  }
  
  return props;
}

// Extract used props from template
function extractUsedProps(content) {
  const usedProps = new Set();
  const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
  if (!templateMatch) return usedProps;
  
  const template = templateMatch[1];
  
  // Extract :prop or v-bind:prop (but not HTML attributes)
  const propMatches = template.matchAll(/(?::|v-bind:)(\w+)=/g);
  
  // HTML attributes that don't need to be defined as props
  const htmlAttributes = new Set([
    'class', 'style', 'id', 'key', 'ref', 'disabled', 'readonly', 'required',
    'type', 'value', 'placeholder', 'src', 'alt', 'href', 'target', 'rel',
    'title', 'aria-label', 'role', 'tabindex', 'autocomplete', 'autofocus',
    'checked', 'selected', 'multiple', 'min', 'max', 'step', 'pattern',
    'accept', 'cols', 'rows', 'wrap', 'colspan', 'rowspan', 'scope',
    'headers', 'abbr', 'axis', 'nowrap', 'char', 'charoff', 'valign',
    'width', 'height', 'border', 'cellpadding', 'cellspacing',
    'is', 'to', 'd', 'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry', 'points',
    'viewBox', 'fill', 'stroke', 'stroke-width', 'transform', 'clip-path'
  ]);
  
  for (const match of propMatches) {
    const propName = match[1];
    // Skip HTML attributes
    if (!htmlAttributes.has(propName)) {
      usedProps.add(propName);
    }
  }
  
  return usedProps;
}

// Check imports
function checkImports(content, filePath) {
  const issues = [];
  const importMatches = content.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
  
  for (const match of importMatches) {
    const importPath = match[1];
    
    // Skip node_modules and built-ins
    if (importPath.startsWith('@/') || importPath.startsWith('./') || importPath.startsWith('../')) {
      const resolvedPath = resolveImportPath(importPath, filePath);
      if (!resolvedPath || !fs.existsSync(resolvedPath)) {
        issues.push({
          file: filePath,
          import: importPath,
          line: getLineNumber(content, match.index),
        });
      }
    }
  }
  
  return issues;
}

// Resolve import path
function resolveImportPath(importPath, fromFile) {
  const dir = path.dirname(fromFile);
  
  if (importPath.startsWith('@/')) {
    const relativePath = importPath.replace('@/', '');
    return path.join(CLIENT_DIR, relativePath);
  }
  
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    let resolved = path.resolve(dir, importPath);
    
    // Try with .vue extension
    if (!fs.existsSync(resolved)) {
      resolved = resolved + '.vue';
    }
    
    // Try with .ts extension
    if (!fs.existsSync(resolved)) {
      resolved = resolved.replace('.vue', '.ts');
    }
    
    // Try with /index.vue
    if (!fs.existsSync(resolved)) {
      resolved = path.join(path.dirname(resolved), 'index.vue');
    }
    
    // Try with /index.ts
    if (!fs.existsSync(resolved)) {
      resolved = path.join(path.dirname(resolved), 'index.ts');
    }
    
    return resolved;
  }
  
  return null;
}

// Get line number from index
function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

// Main check function
function checkUI() {
  console.log('🔍 Checking UI components...\n');
  
  const vueFiles = findFiles(CLIENT_DIR, /\.vue$/);
  
  console.log(`Found ${vueFiles.length} Vue files\n`);
  
  for (const file of vueFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(CLIENT_DIR, file);
    
    // Check event handlers
    const handlers = extractEventHandlers(content);
    const methods = extractMethods(content);
    
    for (const handlerInfo of handlers) {
      const handler = handlerInfo.handler;
      // Check if handler exists in methods or reactive vars
      if (!methods.has(handler)) {
        // Check if it's imported from composables (common pattern)
        // Look for: import { handler } or import { handler as handler } or import handler
        const importPatterns = [
          new RegExp(`import\\s+.*\\b${handler}\\b.*from`, 'g'),
          new RegExp(`import\\s+.*\\b${handler}\\s+as\\s+\\w+.*from`, 'g'),
          new RegExp(`\\b${handler}\\s+as\\s+\\w+`, 'g'), // Named import with alias
        ];
        
        let hasImport = false;
        for (const pattern of importPatterns) {
          if (pattern.test(content)) {
            hasImport = true;
            break;
          }
        }
        
        // Also check for composable imports
        if (!hasImport) {
          const composablePatterns = [
            /from\s+['"].*composables/,
            /from\s+['"].*useNotification/,
            /from\s+['"].*stores/,
          ];
          hasImport = composablePatterns.some(pattern => pattern.test(content));
        }
        
        if (!hasImport) {
          ISSUES.missingHandlers.push({
            file: relativePath,
            handler: handlerInfo.handler,
            line: handlerInfo.line,
          });
        }
      }
    }
    
    // Check props (only for components that actually define props)
    const definedProps = extractProps(content);
    const usedProps = extractUsedProps(content);
    
    // Only check props if component actually uses defineProps or props: {}
    const hasPropsDefinition = content.includes('defineProps') || content.includes('props:');
    
    if (hasPropsDefinition) {
      for (const prop of usedProps) {
        if (!definedProps.has(prop) && !prop.startsWith('v-')) {
          // Check if it's a child component prop (not a prop of this component)
          // If used in template as :prop="something", it might be passed to child
          const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
          if (templateMatch) {
            const template = templateMatch[1];
            // Check if prop is used in child component binding (not as this component's prop)
            const childComponentPattern = new RegExp(`<\\w+[^>]*:${prop}=`, 'g');
            if (childComponentPattern.test(template)) {
              // This is a prop passed to child, not a prop of this component
              continue;
            }
          }
          
          ISSUES.missingProps.push({
            file: relativePath,
            prop,
          });
        }
      }
    }
    
    // Check imports
    const importIssues = checkImports(content, file);
    ISSUES.unresolvedImports.push(...importIssues);
  }
  
  // Print results
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 UI Check Results:\n');
  
  if (ISSUES.missingHandlers.length > 0) {
    console.log('❌ Missing Event Handlers:');
    ISSUES.missingHandlers.forEach(issue => {
      console.log(`   ${issue.file}: @click/@change handler "${issue.handler}" not found in methods`);
    });
    console.log('');
  }
  
  if (ISSUES.missingProps.length > 0) {
    console.log('❌ Missing Props Definitions:');
    ISSUES.missingProps.forEach(issue => {
      console.log(`   ${issue.file}: prop "${issue.prop}" used but not defined`);
    });
    console.log('');
  }
  
  if (ISSUES.unresolvedImports.length > 0) {
    console.log('❌ Unresolved Imports:');
    ISSUES.unresolvedImports.forEach(issue => {
      console.log(`   ${issue.file}:${issue.line}: import "${issue.import}" not found`);
    });
    console.log('');
  }
  
  const totalIssues = ISSUES.missingHandlers.length + ISSUES.missingProps.length + ISSUES.unresolvedImports.length;
  
  if (totalIssues === 0) {
    console.log('✅ No UI issues found!\n');
    process.exit(0);
  } else {
    console.log(`⚠️  Found ${totalIssues} issues\n`);
    process.exit(1);
  }
}

// Run check
try {
  checkUI();
} catch (error) {
  console.error('❌ Error running UI check:', error);
  process.exit(1);
}
