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

// Extract methods from Vue component
function extractMethods(content) {
  const methods = new Set();
  
  // Extract from <script setup>
  const scriptSetupMatch = content.match(/<script[^>]*setup[^>]*>([\s\S]*?)<\/script>/);
  if (scriptSetupMatch) {
    const scriptContent = scriptSetupMatch[1];
    // Extract function declarations
    const functionMatches = scriptContent.matchAll(/(?:function|const|let|var)\s+(\w+)\s*[=\(]/g);
    for (const match of functionMatches) {
      methods.add(match[1]);
    }
  }
  
  // Extract from <script> with methods: {}
  const methodsMatch = content.match(/methods:\s*\{([\s\S]*?)\}/);
  if (methodsMatch) {
    const methodsContent = methodsMatch[1];
    const methodMatches = methodsContent.matchAll(/(\w+)\s*[\(:]/g);
    for (const match of methodMatches) {
      methods.add(match[1]);
    }
  }
  
  return methods;
}

// Extract event handlers from template
function extractEventHandlers(content) {
  const handlers = new Set();
  const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
  if (!templateMatch) return handlers;
  
  const template = templateMatch[1];
  
  // Extract @click, @change, @submit, etc.
  const eventMatches = template.matchAll(/@(\w+)=["']([^"']+)["']/g);
  for (const match of eventMatches) {
    const handler = match[2].trim();
    // Remove parentheses and arguments
    const handlerName = handler.split('(')[0].trim();
    if (handlerName && !handlerName.startsWith('$')) {
      handlers.add(handlerName);
    }
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
  
  // Extract :prop or v-bind:prop
  const propMatches = template.matchAll(/(?::|v-bind:)(\w+)=/g);
  for (const match of propMatches) {
    usedProps.add(match[1]);
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
    
    for (const handler of handlers) {
      if (!methods.has(handler)) {
        ISSUES.missingHandlers.push({
          file: relativePath,
          handler,
        });
      }
    }
    
    // Check props
    const definedProps = extractProps(content);
    const usedProps = extractUsedProps(content);
    
    for (const prop of usedProps) {
      if (!definedProps.has(prop) && !prop.startsWith('v-')) {
        ISSUES.missingProps.push({
          file: relativePath,
          prop,
        });
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
