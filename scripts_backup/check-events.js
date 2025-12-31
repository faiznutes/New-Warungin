/**
 * Check Events Script
 * Parse semua @click, @change, @submit
 * Validasi apakah method ada di methods:
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
const ISSUES = [];

// Extract methods from Vue component
function extractMethods(content) {
  const methods = new Set();
  
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
    
    // Extract from defineEmits (these are valid event handlers)
    const emitMatch = scriptContent.match(/defineEmits<\{([\s\S]*?)\}>/);
    if (emitMatch) {
      const emitContent = emitMatch[1];
      const emitMatches = emitContent.matchAll(/(\w+)\s*[:?]/g);
      for (const match of emitMatches) {
        methods.add(match[1]);
      }
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
  
  return methods;
}

// Extract event handlers from template
function extractEventHandlers(content) {
  const handlers = [];
  const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
  if (!templateMatch) return handlers;
  
  const template = templateMatch[1];
  
  // Extract @click, @change, @submit, @input, etc.
  // Match: @event="handler" or @event="handler()" or @event="handler($event)"
  const eventPattern = /@(\w+)=["']([^"']+)["']/g;
  const matches = template.matchAll(eventPattern);
  
  for (const match of matches) {
    const eventType = match[1];
    let handler = match[2].trim();
    
    // Remove parentheses and arguments
    handler = handler.split('(')[0].trim();
    
    // Skip if it's a Vue directive or built-in
    if (handler.startsWith('$') || handler === 'true' || handler === 'false' || handler === '') {
      continue;
    }
    
    // Skip if it's an inline expression (contains operators)
    if (handler.includes('=') || handler.includes('?') || handler.includes('||') || handler.includes('&&')) {
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

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

// Main check function
function checkEvents() {
  console.log('🔍 Checking Vue event handlers...\n');
  
  const vueFiles = findFiles(CLIENT_DIR, /\.vue$/);
  
  console.log(`Found ${vueFiles.length} Vue files\n`);
  
  for (const file of vueFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(CLIENT_DIR, file);
    
    const methods = extractMethods(content);
    const handlers = extractEventHandlers(content);
    
    for (const handlerInfo of handlers) {
      if (!methods.has(handlerInfo.handler)) {
        ISSUES.push({
          file: relativePath,
          event: handlerInfo.eventType,
          handler: handlerInfo.handler,
          line: handlerInfo.line,
        });
      }
    }
  }
  
  // Print results
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Event Handler Check Results:\n');
  
  if (ISSUES.length > 0) {
    console.log('❌ Missing Event Handlers:');
    
    // Group by file
    const issuesByFile = {};
    for (const issue of ISSUES) {
      if (!issuesByFile[issue.file]) {
        issuesByFile[issue.file] = [];
      }
      issuesByFile[issue.file].push(issue);
    }
    
    for (const [file, fileIssues] of Object.entries(issuesByFile)) {
      console.log(`\n   📄 ${file}:`);
      for (const issue of fileIssues) {
        console.log(`      Line ${issue.line}: @${issue.event}="${issue.handler}" - method not found`);
      }
    }
    
    console.log(`\n⚠️  Found ${ISSUES.length} missing event handlers\n`);
    process.exit(1);
  } else {
    console.log('✅ All event handlers are properly defined!\n');
    process.exit(0);
  }
}

// Run check
try {
  checkEvents();
} catch (error) {
  console.error('❌ Error running event check:', error);
  process.exit(1);
}
