#!/usr/bin/env pnpm tsx

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = resolve(process.cwd());
const PRD_PATH = resolve(ROOT, 'PRD.md');
const PACKAGE_JSON = resolve(ROOT, 'package.json');

function getPackageJson() {
  const content = readFileSync(PACKAGE_JSON, 'utf8');
  return JSON.parse(content);
}

function getGitInfo() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', windowsHide: true }).trim();
    const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8', windowsHide: true }).trim();
    return { branch, commit };
  } catch {
    return { branch: 'unknown', commit: 'unknown' };
  }
}

function extractApiEndpoints() {
  const endpoints = [];
  const serverIndexPath = resolve(ROOT, 'server', 'index.ts');
  
  try {
    const content = readFileSync(serverIndexPath, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const routeMatch = line.match(/app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
      if (routeMatch) {
        const method = routeMatch[1].toUpperCase();
        const path = routeMatch[2];
        
        let auth = 'Public';
        let description = '';
        
        if (path.includes('/api/admin')) {
          auth = 'Admin';
        }
        
        if (path.includes('health')) description = 'Health check';
        else if (path.includes('csrf-token')) description = 'Get CSRF token';
        else if (path.includes('checkout/initialize')) description = 'Initialize checkout';
        else if (path.includes('checkout/verify')) description = 'Verify payment';
        else if (path.includes('paystack/webhook')) description = 'Payment webhook';
        else if (path === '/api/admin/me') description = 'Get current admin';
        else if (path.includes('admin/stats')) description = 'Dashboard statistics';
        
        endpoints.push({ method, path, auth, description });
      }
    }
  } catch {
    // File not found
  }
  
  return endpoints;
}

function extractDatabaseTables() {
  const tables = [];
  const postgresStorePath = resolve(ROOT, 'server', 'lib', 'postgres-store.ts');
  
  try {
    const content = readFileSync(postgresStorePath, 'utf8');
    const matches = content.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)/g);
    
    for (const match of matches) {
      tables.push(match[1]);
    }
  } catch {
    // File not found
  }
  
  return tables;
}

function countComponents() {
  let count = 0;
  const srcDir = resolve(ROOT, 'src');
  
  try {
    const items = readdirSync(srcDir);
    
    for (const item of items) {
      const itemPath = resolve(srcDir, item);
      const stat = statSync(itemPath);
      
      if (stat.isDirectory()) {
        const files = readdirSync(itemPath);
        count += files.filter(f => f.endsWith('.tsx')).length;
      }
    }
  } catch {
    // Directory not found
  }
  
  return count;
}

function countSecurityControls() {
  const securityPath = resolve(ROOT, 'server', 'lib', 'security.ts');
  let count = 0;
  
  try {
    const content = readFileSync(securityPath, 'utf8');
    const controls = ['helmet', 'cors', 'createRateLimiter', 'csrfProtectionMiddleware', 'getRequiredSecret'];
    
    for (const control of controls) {
      if (content.includes('export function ' + control) || content.includes('export const ' + control)) {
        count++;
      }
    }
  } catch {
    // File not found
  }
  
  return count;
}

function updatePRD() {
  console.log('Starting PRD auto-update...');
  
  const pkg = getPackageJson();
  const gitInfo = getGitInfo();
  const endpoints = extractApiEndpoints();
  const tables = extractDatabaseTables();
  const components = countComponents();
  const securityControls = countSecurityControls();
  
  let prdContent = '';
  try {
    prdContent = readFileSync(PRD_PATH, 'utf8');
  } catch {
    console.log('PRD.md not found');
    process.exit(1);
  }
  
  const newEndpointRows = endpoints
    .map(e => '| ' + e.method + ' | ' + e.path + ' | ' + e.auth + ' | ' + e.description + ' |')
    .join('\n');
  
  const startMarker = '| Method | Endpoint | Auth | Description |';
  const oldTableStart = prdContent.indexOf(startMarker);
  
  if (oldTableStart !== -1) {
    const deleteRowStart = prdContent.indexOf('| DELETE | /api/admin/products/:id |');
    if (deleteRowStart !== -1) {
      const endOfTable = prdContent.indexOf('\n', deleteRowStart) + 1;
      const newTable = startMarker + '\n|---|---|---|---|\n' + newEndpointRows + '\n|';
      prdContent = prdContent.slice(0, oldTableStart) + newTable + prdContent.slice(endOfTable);
    }
  }
  
  prdContent = prdContent.replace(/\*\*Version\*\*: [\d.]+/, '**Version**: ' + pkg.version);
  prdContent = prdContent.replace(/\*\*Last Updated\*\*: [\d-]+/, '**Last Updated**: ' + new Date().toISOString().split('T')[0]);
  
  writeFileSync(PRD_PATH, prdContent);
  
  console.log('PRD updated successfully!');
  console.log('API Endpoints:', endpoints.length);
  console.log('Database Tables:', tables.length);
  console.log('Components:', components);
  console.log('Security Controls:', securityControls);
  console.log('Git: ' + gitInfo.branch + ' @ ' + gitInfo.commit);
}

updatePRD();