#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');

class CSPMonitor {
  constructor() {
    this.violations = [];
    this.recommendations = [];
  }

  analyzeNextConfig() {
    const configPath = './next.config.ts';
    
    if (!fs.existsSync(configPath)) {
      this.violations.push('next.config.ts not found');
      return;
    }

    const config = fs.readFileSync(configPath, 'utf8');
    
    // Check for CSP headers
    if (!config.includes('Content-Security-Policy')) {
      this.violations.push('CSP headers not configured');
      return;
    }

    // Check for unsafe-inline
    if (config.includes("'unsafe-inline'")) {
      this.violations.push('CSP uses unsafe-inline - security risk');
      this.recommendations.push('Replace unsafe-inline with nonces or hashes');
    }

    // Check for unsafe-eval
    if (config.includes("'unsafe-eval'")) {
      this.violations.push('CSP uses unsafe-eval - security risk');
      this.recommendations.push('Remove unsafe-eval and use safer alternatives');
    }

    console.log('✅ CSP configuration found');
  }

  generateScriptHashes() {
    const publicDir = './public';
    const scriptHashes = [];

    if (!fs.existsSync(publicDir)) return scriptHashes;

    const files = fs.readdirSync(publicDir, { recursive: true });
    
    for (const file of files) {
      if (typeof file === 'string' && file.endsWith('.js')) {
        const filePath = `${publicDir}/${file}`;
        const content = fs.readFileSync(filePath, 'utf8');
        const hash = crypto.createHash('sha256').update(content).digest('base64');
        scriptHashes.push(`'sha256-${hash}'`);
      }
    }

    return scriptHashes;
  }

  generateCSPRecommendation() {
    const scriptHashes = this.generateScriptHashes();
    
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https: wss: ws:",
      "frame-src 'self' https:",
    ].join('; ');

    console.log('\n🔒 Recommended CSP:');
    console.log(csp);

    if (scriptHashes.length > 0) {
      console.log('\n📝 Script hashes for inline scripts:');
      scriptHashes.forEach(hash => console.log(`  ${hash}`));
    }
  }

  checkInlineScripts() {
    const srcFiles = this.getAllFiles('./src', ['.tsx', '.ts', '.jsx', '.js']);
    
    srcFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for dangerouslySetInnerHTML
      if (content.includes('dangerouslySetInnerHTML')) {
        this.violations.push(`Potentially unsafe innerHTML in ${file}`);
      }

      // Check for eval usage
      if (content.includes('eval(')) {
        this.violations.push(`eval() usage detected in ${file}`);
      }
    });
  }

  getAllFiles(dir, extensions) {
    const files = [];
    
    function traverse(currentDir) {
      if (!fs.existsSync(currentDir)) return;
      
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = `${currentDir}/${entry.name}`;
        
        if (entry.isDirectory() && !['node_modules', '.next', '.git'].includes(entry.name)) {
          traverse(fullPath);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }
    
    traverse(dir);
    return files;
  }

  run() {
    console.log('🔒 Starting CSP Security Analysis...\n');
    
    this.analyzeNextConfig();
    this.checkInlineScripts();
    this.generateCSPRecommendation();
    
    console.log('\n📊 Security Analysis Results:');
    
    if (this.violations.length > 0) {
      console.log('\n❌ Security Issues:');
      this.violations.forEach(violation => console.log(`  - ${violation}`));
    }
    
    if (this.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    
    if (this.violations.length === 0) {
      console.log('✅ No critical security issues found');
    }
  }
}

const monitor = new CSPMonitor();
monitor.run();