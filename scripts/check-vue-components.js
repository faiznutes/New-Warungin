#!/usr/bin/env node

/**
 * Vue Component Checker
 * Memvalidasi struktur Vue components sesuai checklist
 * 
 * Usage: node scripts/check-vue-components.js [file-path]
 */

const fs = require('fs');
const path = require('path');

const issues = [];
const warnings = [];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const scriptStart = content.indexOf('<script setup');
  
  if (scriptStart === -1) {
    return; // Not a Vue component with script setup
  }

  const scriptContent = content.substring(scriptStart);
  const scriptEnd = scriptContent.indexOf('</script>');
  const script = scriptContent.substring(0, scriptEnd);

  const fileIssues = [];
  const fileWarnings = [];

  // Check 1: Imports
  const hasUseNotificationImport = script.includes("import { useNotification }") || 
                                   script.includes('import { useNotification }');
  const usesShowSuccess = script.includes('showSuccess') || script.includes('showError') || script.includes('showConfirm');
  
  if (usesShowSuccess && !hasUseNotificationImport) {
    fileIssues.push({
      type: 'error',
      message: 'Missing import: useNotification is used but not imported',
      line: findLineNumber(content, 'showSuccess') || findLineNumber(content, 'showError'),
    });
  }

  // Check 2: Order of declarations
  const useNotificationCall = script.match(/const\s*\{[^}]*\}\s*=\s*useNotification\(\)/);
  const showSuccessUsage = script.match(/showSuccess\(/);
  
  if (useNotificationCall && showSuccessUsage) {
    const callIndex = script.indexOf(useNotificationCall[0]);
    const usageIndex = script.indexOf(showSuccessUsage[0]);
    
    if (usageIndex < callIndex) {
      fileIssues.push({
        type: 'error',
        message: 'useNotification() is called AFTER showSuccess/showError is used. Move it to the top!',
        line: findLineNumber(content, useNotificationCall[0]),
      });
    }
  }

  // Check 3: Missing await
  const showSuccessWithoutAwait = script.match(/(?<!await\s)showSuccess\(/g);
  if (showSuccessWithoutAwait) {
    showSuccessWithoutAwait.forEach(() => {
      fileWarnings.push({
        type: 'warning',
        message: 'showSuccess called without await. Consider adding await.',
      });
    });
  }

  // Check 4: Composable inside function
  const composableInFunction = script.match(/(const|let|var)\s+\{[^}]*\}\s*=\s*useNotification\(\)/g);
  if (composableInFunction) {
    composableInFunction.forEach((match) => {
      const context = script.substring(Math.max(0, script.indexOf(match) - 100), script.indexOf(match) + 100);
      if (context.includes('=>') || context.includes('function')) {
        fileIssues.push({
          type: 'error',
          message: 'useNotification() is called inside a function. It should be at top-level!',
          line: findLineNumber(content, match),
        });
      }
    });
  }

  if (fileIssues.length > 0 || fileWarnings.length > 0) {
    log(`\n📄 ${filePath}`, 'cyan');
    
    fileIssues.forEach(issue => {
      log(`  ❌ ${issue.message}`, 'red');
      if (issue.line) {
        log(`     Line: ${issue.line}`, 'yellow');
      }
    });
    
    fileWarnings.forEach(warning => {
      log(`  ⚠️  ${warning.message}`, 'yellow');
    });
    
    issues.push(...fileIssues);
    warnings.push(...fileWarnings);
  }
}

function findLineNumber(content, searchText) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchText)) {
      return i + 1;
    }
  }
  return null;
}

function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .git
      if (file !== 'node_modules' && file !== '.git' && !file.startsWith('.')) {
        scanDirectory(filePath, fileList);
      }
    } else if (file.endsWith('.vue')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main execution
const targetPath = process.argv[2] || path.join(__dirname, '../client/src');

log('🔍 Scanning Vue components...', 'blue');
log('='.repeat(50), 'cyan');

let files = [];

if (fs.statSync(targetPath).isFile()) {
  files = [targetPath];
} else {
  files = scanDirectory(targetPath);
}

files.forEach(file => {
  try {
    checkFile(file);
  } catch (error) {
    log(`Error checking ${file}: ${error.message}`, 'red');
  }
});

log('\n' + '='.repeat(50), 'cyan');
log(`\n📊 Summary:`, 'blue');
log(`   Files checked: ${files.length}`, 'cyan');
log(`   ❌ Errors: ${issues.length}`, issues.length > 0 ? 'red' : 'green');
log(`   ⚠️  Warnings: ${warnings.length}`, warnings.length > 0 ? 'yellow' : 'green');

if (issues.length === 0 && warnings.length === 0) {
  log('\n✅ All checks passed!', 'green');
  process.exit(0);
} else {
  log('\n❌ Some issues found. Please fix them before committing.', 'red');
  process.exit(1);
}
