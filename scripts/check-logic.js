/**
 * Check Logic Script
 * - Trace dependency tree service → cari circular
 * - Cek semua async/await consistency
 * - Cek fungsi kritikal tanpa error handling
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

const SRC_DIR = path.join(__dirname, '../src');
const ISSUES = {
  circularDependencies: [],
  asyncAwaitIssues: [],
  missingErrorHandling: [],
};

// Extract imports from file
function extractImports(content) {
  const imports = new Set();
  
  // Extract from import statements
  const importMatches = content.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
  for (const match of importMatches) {
    const importPath = match[1];
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      imports.add(importPath);
    }
  }
  
  // Extract from require statements
  const requireMatches = content.matchAll(/require\(['"]([^'"]+)['"]\)/g);
  for (const requireMatch of requireMatches) {
    const requirePath = requireMatch[1];
    if (requirePath.startsWith('./') || requirePath.startsWith('../')) {
      imports.add(requirePath);
    }
  }
  
  return imports;
}

// Resolve import to absolute path
function resolveImport(importPath, fromFile) {
  const dir = path.dirname(fromFile);
  let resolved = path.resolve(dir, importPath);
  
  // Try with .ts extension
  if (!fs.existsSync(resolved)) {
    resolved = resolved + '.ts';
  }
  
  // Try with /index.ts
  if (!fs.existsSync(resolved)) {
    resolved = path.join(path.dirname(resolved), 'index.ts');
  }
  
  return resolved;
}

// Build dependency graph
function buildDependencyGraph(files) {
  const graph = new Map();
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const imports = extractImports(content);
    const dependencies = [];
    
    for (const imp of imports) {
      const resolved = resolveImport(imp, file);
      if (fs.existsSync(resolved)) {
        dependencies.push(resolved);
      }
    }
    
    graph.set(file, dependencies);
  }
  
  return graph;
}

// Detect circular dependencies using DFS
function detectCircularDependencies(graph) {
  const visited = new Set();
  const recursionStack = new Set();
  const cycles = [];
  
  function dfs(node, path) {
    if (recursionStack.has(node)) {
      // Found cycle
      const cycleStart = path.indexOf(node);
      const cycle = path.slice(cycleStart).concat(node);
      cycles.push(cycle);
      return;
    }
    
    if (visited.has(node)) {
      return;
    }
    
    visited.add(node);
    recursionStack.add(node);
    
    const dependencies = graph.get(node) || [];
    for (const dep of dependencies) {
      dfs(dep, path.concat(node));
    }
    
    recursionStack.delete(node);
  }
  
  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }
  
  return cycles;
}

// Check async/await consistency
function checkAsyncAwait(content, filePath) {
  const issues = [];
  
  // Find async functions
  const asyncFunctions = content.matchAll(/async\s+(?:function\s+)?(\w+)\s*\(/g);
  
  for (const match of asyncFunctions) {
    const funcName = match[1];
    const funcStart = match.index;
    
    // Find function body
    let braceCount = 0;
    let inFunction = false;
    let funcBody = '';
    
    for (let i = funcStart; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++;
        inFunction = true;
      } else if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0 && inFunction) {
          funcBody = content.substring(funcStart, i + 1);
          break;
        }
      }
    }
    
    // Check if function has await but is not async
    const hasAwait = funcBody.includes('await ');
    const hasPromise = funcBody.match(/\.then\(|\.catch\(|Promise\./);
    
    if (hasAwait || hasPromise) {
      // Check if all promises are awaited
      const promiseMatches = funcBody.matchAll(/(\w+)\([^)]*\)(?!\s*\.(then|catch|finally))/g);
      for (const promiseMatch of promiseMatches) {
        const call = promiseMatch[0];
        if (call.includes('Service.') || call.includes('prisma.') || call.includes('fetch(')) {
          // Potential unhandled promise
          if (!call.includes('await ')) {
            issues.push({
              file: path.relative(SRC_DIR, filePath),
              function: funcName,
              issue: `Potential unhandled promise: ${call.substring(0, 50)}`,
            });
          }
        }
      }
    }
  }
  
  return issues;
}

// Check critical functions without error handling
function checkErrorHandling(content, filePath) {
  const issues = [];
  
  // Critical function patterns
  const criticalPatterns = [
    /(?:create|update|delete|save|remove|destroy)\w*\(/gi,
    /(?:process|handle|execute)\w*\(/gi,
    /(?:payment|order|transaction|user|tenant)\w*\(/gi,
  ];
  
  // Find critical functions
  for (const pattern of criticalPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const funcCall = match[0];
      const index = match.index;
      
      // Check if wrapped in try-catch
      const beforeCall = content.substring(Math.max(0, index - 200), index);
      const afterCall = content.substring(index, Math.min(content.length, index + 200));
      
      const hasTryCatch = beforeCall.includes('try {') || beforeCall.includes('try{');
      const hasCatch = afterCall.includes('catch') || beforeCall.includes('catch');
      
      if (!hasTryCatch || !hasCatch) {
        // Check if it's in a service method (should have error handling)
        const lineBefore = content.substring(Math.max(0, index - 500), index);
        if (lineBefore.includes('async ') || lineBefore.includes('export ')) {
          issues.push({
            file: path.relative(SRC_DIR, filePath),
            function: funcCall,
            line: getLineNumber(content, index),
            issue: 'Critical function call without error handling',
          });
        }
      }
    }
  }
  
  return issues;
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

// Main check function
function checkLogic() {
  console.log('🔍 Checking logic and dependencies...\n');
  
  let tsFiles = findFiles(SRC_DIR, /\.ts$/);
  // Filter out test files and node_modules
  tsFiles = tsFiles.filter(file => 
    !file.includes('.test.ts') && 
    !file.includes('.spec.ts') && 
    !file.includes('node_modules')
  );
  
  console.log(`Found ${tsFiles.length} TypeScript files\n`);
  
  // Build dependency graph
  console.log('📊 Building dependency graph...');
  const graph = buildDependencyGraph(tsFiles);
  
  // Detect circular dependencies
  console.log('🔍 Detecting circular dependencies...');
  const cycles = detectCircularDependencies(graph);
  ISSUES.circularDependencies = cycles.map(cycle => ({
    cycle: cycle.map(f => path.relative(SRC_DIR, f)),
  }));
  
  // Check async/await
  console.log('🔍 Checking async/await consistency...');
  for (const file of tsFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const asyncIssues = checkAsyncAwait(content, file);
    ISSUES.asyncAwaitIssues.push(...asyncIssues);
    
    const errorHandlingIssues = checkErrorHandling(content, file);
    ISSUES.missingErrorHandling.push(...errorHandlingIssues);
  }
  
  // Print results
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Logic Check Results:\n');
  
  if (ISSUES.circularDependencies.length > 0) {
    console.log('❌ Circular Dependencies:');
    ISSUES.circularDependencies.forEach(issue => {
      console.log(`   Cycle: ${issue.cycle.join(' → ')}`);
    });
    console.log('');
  }
  
  if (ISSUES.asyncAwaitIssues.length > 0) {
    console.log('⚠️  Async/Await Issues:');
    ISSUES.asyncAwaitIssues.slice(0, 10).forEach(issue => {
      console.log(`   ${issue.file}:${issue.function} - ${issue.issue}`);
    });
    if (ISSUES.asyncAwaitIssues.length > 10) {
      console.log(`   ... and ${ISSUES.asyncAwaitIssues.length - 10} more`);
    }
    console.log('');
  }
  
  if (ISSUES.missingErrorHandling.length > 0) {
    console.log('⚠️  Missing Error Handling:');
    ISSUES.missingErrorHandling.slice(0, 10).forEach(issue => {
      console.log(`   ${issue.file}:${issue.line} - ${issue.function} ${issue.issue}`);
    });
    if (ISSUES.missingErrorHandling.length > 10) {
      console.log(`   ... and ${ISSUES.missingErrorHandling.length - 10} more`);
    }
    console.log('');
  }
  
  const totalIssues = ISSUES.circularDependencies.length + ISSUES.asyncAwaitIssues.length + ISSUES.missingErrorHandling.length;
  
  if (totalIssues === 0) {
    console.log('✅ No logic issues found!\n');
    process.exit(0);
  } else {
    console.log(`⚠️  Found ${totalIssues} issues\n`);
    process.exit(1);
  }
}

// Run check
try {
  checkLogic();
} catch (error) {
  console.error('❌ Error running logic check:', error);
  process.exit(1);
}
