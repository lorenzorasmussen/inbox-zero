# Playwright Setup Guide - Complete Requirements & Installation

## 🎭 **Playwright Browser Automation Requirements**

### **System Requirements**

- **Node.js**: 18+ (recommended 20+)
- **Operating System**: macOS, Linux, or Windows
- **RAM**: Minimum 512MB, recommended 1GB+
- **Disk Space**: ~300MB for browsers
- **Network**: Internet connection for browser downloads

### **Supported Browsers**

- **Chromium** (default, recommended)
- **Firefox**
- **WebKit** (Safari)
- **Mobile emulation** (Chrome DevTools Protocol)

---

## 📦 **Installation Steps**

### **1. Install Playwright**

```bash
# Install as dev dependency
npm install --save-dev playwright

# Or globally
npm install -g playwright
```

### **2. Install Browsers**

```bash
# Install all browsers
npx playwright install

# Install specific browser
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### **3. Verify Installation**

```bash
# Check Playwright version
npx playwright --version

# List installed browsers
npx playwright install-deps
```

---

## ⚙️ **Configuration for MCP Server**

### **Playwright MCP Server Setup**

```bash
# Install Playwright MCP server
npm install -g mcp-playwright-network

# Or use npx
npx mcp-playwright-network --headless
```

### **OpenCode Configuration** (Already Done)

```json
{
  "playwright": {
    "command": ["npx", "-y", "mcp-playwright-network", "--headless"],
    "enabled": true
  }
}
```

---

## 🚀 **Usage Examples**

### **Basic Browser Automation**

```javascript
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("https://example.com");
  await page.screenshot({ path: "screenshot.png" });
  await browser.close();
})();
```

### **MCP Server Integration**

```bash
# Through OpenCode
opencode run --prompt "Take a screenshot of https://example.com"

# Browser automation
opencode run --prompt "Navigate to Google and search for 'playwright'"

# Network monitoring
opencode run --prompt "Monitor network requests on a webpage"
```

---

## 🔧 **Troubleshooting Playwright Issues**

### **Common Issues & Solutions**

#### **1. Browser Download Failures**

```bash
# Manual browser installation
npx playwright install chromium --force

# Check system dependencies
npx playwright install-deps
```

#### **2. Permission Issues**

```bash
# macOS - Allow system access
tccutil reset All com.microsoft.VSCode

# Linux - Install dependencies
sudo apt-get install -y libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2
```

#### **3. Memory Issues**

```bash
# Run with limited memory
node --max-old-space-size=512 your-script.js

# Use headless mode
const browser = await chromium.launch({ headless: true });
```

#### **4. Network Issues**

```bash
# Set proxy if needed
const browser = await chromium.launch({
  proxy: { server: 'http://proxy.company.com:8080' }
});
```

---

## 🎯 **Playwright MCP Server Capabilities**

### **Available Tools**

- **Page Navigation**: `page_navigate` - Load URLs
- **Element Interaction**: `click`, `type_text`, `select_option`
- **Screenshots**: `take_screenshot` - Capture page images
- **Network Monitoring**: `monitor_requests` - Track HTTP requests
- **JavaScript Execution**: `evaluate_script` - Run JS on pages
- **Form Handling**: `fill_form`, `submit_form`
- **Waiting**: `wait_for_element`, `wait_for_load`

### **Use Cases for Your Project**

- **E2E Testing**: Test email interfaces
- **Screenshot Testing**: Capture email layouts
- **Network Analysis**: Monitor email API calls
- **Accessibility Testing**: Check email client compatibility
- **Performance Monitoring**: Test email loading speeds

---

## 📊 **Performance Optimization**

### **Headless Mode** (Recommended)

```javascript
const browser = await chromium.launch({
  headless: true, // Faster, less resource intensive
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
```

### **Browser Context Management**

```javascript
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  userAgent: "custom-user-agent",
});
```

### **Resource Cleanup**

```javascript
// Always close browsers
await browser.close();

// Use context isolation
const context = await browser.newContext();
const page = await context.newPage();
// ... use page ...
await context.close();
```

---

## 🔍 **Using Context7 for Playwright Research**

Since Context7 is now active, you can research Playwright extensively:

### **Context7 Queries for Playwright**

```bash
# Through OpenCode (recommended)
opencode run --prompt "Latest Playwright best practices for 2024"
opencode run --prompt "Playwright vs Puppeteer vs Selenium comparison"
opencode run --prompt "Advanced Playwright testing patterns and examples"
opencode run --prompt "Playwright CI/CD integration guides"
```

### **Playwright Documentation & Updates**

```bash
opencode run --prompt "Find the official Playwright GitHub repository"
opencode run --prompt "Latest Playwright version features and changelog"
opencode run --prompt "Playwright community plugins and extensions"
```

---

## ✅ **Next Steps for Playwright Setup**

1. **Install Playwright**:

   ```bash
   cd your-project
   npm install --save-dev playwright
   ```

2. **Install Browsers**:

   ```bash
   npx playwright install
   ```

3. **Test Installation**:

   ```bash
   npx playwright --version
   ```

4. **Use with MCP**:

   ```bash
   opencode run --prompt "Automate browser testing for email interfaces"
   ```

5. **Research with Context7**:
   ```bash
   opencode run --prompt "Advanced Playwright patterns for web automation"
   ```

**Playwright is now ready for browser automation and testing in your Inbox Zero project! 🎭**
