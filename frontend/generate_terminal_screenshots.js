import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const backendLogPath = 'C:/Users/lucky/.gemini/antigravity/brain/dee57e37-b5fb-4b4c-b474-63b4d0a6260e/.system_generated/tasks/task-26.log';
const frontendLogPath = 'C:/Users/lucky/.gemini/antigravity/brain/dee57e37-b5fb-4b4c-b474-63b4d0a6260e/.system_generated/tasks/task-34.log';
const screenshotDir = path.resolve('../docs/test-reports/screenshots');

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateTerminalHtml(title, logContent) {
  const lines = logContent.split('\n');
  const formattedLines = lines.map(line => {
    let escaped = escapeHtml(line);
    // Simple coloring for test output
    if (escaped.includes('PASSED') || escaped.includes('✓')) {
      escaped = escaped.replace(/PASSED/g, '<span class="pass">PASSED</span>')
                       .replace(/✓/g, '<span class="pass">✓</span>');
    } else if (escaped.includes('FAILED') || escaped.includes('✖') || escaped.includes('ERROR:')) {
      escaped = escaped.replace(/FAILED/g, '<span class="fail">FAILED</span>')
                       .replace(/✖/g, '<span class="fail">✖</span>')
                       .replace(/ERROR:/g, '<span class="fail">ERROR:</span>');
    }
    if (escaped.startsWith('====') || escaped.startsWith('----')) {
      escaped = `<span class="header">${escaped}</span>`;
    }
    return escaped;
  }).join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    background-color: #0b0e14;
    margin: 0;
    padding: 20px;
    font-family: 'Consolas', 'Courier New', monospace;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  .terminal {
    background-color: #11151c;
    border: 1px solid #2d3139;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    width: 900px;
    overflow: hidden;
  }
  .terminal-header {
    background-color: #161b22;
    padding: 10px 15px;
    border-bottom: 1px solid #2d3139;
    display: flex;
    align-items: center;
    position: relative;
  }
  .buttons {
    display: flex;
    gap: 8px;
  }
  .button {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .button.close { background-color: #ff5f56; }
  .button.minimize { background-color: #ffbd2e; }
  .button.maximize { background-color: #27c93f; }
  .title {
    color: #8b949e;
    font-size: 13px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  .terminal-body {
    padding: 15px;
    color: #c9d1d9;
    font-size: 14px;
    line-height: 1.5;
    overflow-x: auto;
    white-space: pre-wrap;
  }
  .pass {
    color: #58a6ff;
    font-weight: bold;
  }
  .fail {
    color: #f85149;
    font-weight: bold;
  }
  .header {
    color: #388bfd;
  }
  .green-text {
    color: #34d399;
  }
  /* Custom overrides for specific passes/fails */
  span.pass:contains("PASSED"), span.pass:contains("✓") {
    color: #34d399;
  }
</style>
</head>
<body>
  <div class="terminal">
    <div class="terminal-header">
      <div class="buttons">
        <div class="button close"></div>
        <div class="button minimize"></div>
        <div class="button maximize"></div>
      </div>
      <div class="title">${title}</div>
    </div>
    <div class="terminal-body">${formattedLines}</div>
  </div>
</body>
</html>
  `;
}

async function captureLogScreenshot(logPath, title, outputName) {
  if (!fs.existsSync(logPath)) {
    console.error(`Log file not found: ${logPath}`);
    return;
  }

  const logContent = fs.readFileSync(logPath, 'utf8');
  const htmlContent = generateTerminalHtml(title, logContent);
  const tempHtmlPath = path.join(screenshotDir, `${outputName}.html`);
  
  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');
  console.log(`Generated HTML at: ${tempHtmlPath}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Convert local file path to file URL
  const fileUrl = `file://${path.resolve(tempHtmlPath)}`;
  await page.goto(fileUrl);
  
  // Wait for rendering
  await page.waitForTimeout(500);

  // Take screenshot of only the terminal element
  const terminalElement = await page.$('.terminal');
  if (terminalElement) {
    await terminalElement.screenshot({ path: path.join(screenshotDir, `${outputName}.png`) });
    console.log(`Saved screenshot to ${path.join(screenshotDir, `${outputName}.png`)}`);
  } else {
    await page.screenshot({ path: path.join(screenshotDir, `${outputName}.png`), fullPage: true });
    console.log(`Saved fullpage screenshot to ${path.join(screenshotDir, `${outputName}.png`)}`);
  }

  await browser.close();
  
  // Clean up temporary HTML file
  fs.unlinkSync(tempHtmlPath);
}

async function run() {
  console.log('Generating terminal screenshots...');
  try {
    await captureLogScreenshot(backendLogPath, 'PowerShell - pytest (Backend Unit/API Tests)', 'pytest_terminal');
    await captureLogScreenshot(frontendLogPath, 'PowerShell - vitest (Frontend Unit Tests)', 'vitest_terminal');
    console.log('Terminal screenshots completed successfully!');
  } catch (error) {
    console.error('Error generating screenshots:', error);
  }
}

run();
