# Bitwarden Secret Management - Replace .env Files

## 🎯 **Problem Solved**: No More Overwritten .env Files

Instead of storing secrets in `.env` files that get overwritten, use **Bitwarden** (which we just configured as an MCP server) to manage all your project secrets securely.

---

## 🔐 **Bitwarden Secret Management Setup**

### **1. Create a Project Secrets Folder**

```bash
# Create a dedicated folder for project secrets
bw get folder "Project Secrets" 2>/dev/null || bw create folder "Project Secrets"
```

### **2. Store Project Secrets in Bitwarden**

```bash
# Database credentials
bw create item --name "Inbox Zero Database" \
  --username "postgres" \
  --password "your_db_password" \
  --field "DATABASE_URL=postgresql://postgres:password@localhost:5432/inboxzero" \
  --folder "Project Secrets"

# API Keys
bw create item --name "Google OAuth" \
  --field "GOOGLE_CLIENT_ID=your_client_id" \
  --field "GOOGLE_CLIENT_SECRET=your_client_secret" \
  --folder "Project Secrets"

# AI/LLM Keys
bw create item --name "OpenRouter API" \
  --field "OPENROUTER_API_KEY=your_api_key" \
  --folder "Project Secrets"

# Auth Secrets
bw create item --name "Auth Secrets" \
  --field "AUTH_SECRET=your_auth_secret" \
  --field "NEXTAUTH_SECRET=your_nextauth_secret" \
  --folder "Project Secrets"
```

### **3. Retrieve Secrets Programmatically**

```javascript
// utils/secrets.js
import { execSync } from "child_process";

export function getSecret(itemName, fieldName) {
  try {
    const result = execSync(
      `bw get item "${itemName}" --field "${fieldName}"`,
      { encoding: "utf8" },
    ).trim();
    return result;
  } catch (error) {
    console.error(`Failed to get secret: ${itemName} - ${fieldName}`);
    return null;
  }
}

// Usage
const dbUrl = getSecret("Inbox Zero Database", "DATABASE_URL");
const apiKey = getSecret("OpenRouter API", "OPENROUTER_API_KEY");
```

---

## 🚀 **Bitwarden MCP Integration**

### **Query Secrets Through OpenCode**

```bash
# Get database URL
opencode run --prompt "Get the DATABASE_URL from Bitwarden 'Inbox Zero Database' item"

# Retrieve API keys
opencode run --prompt "Get OPENROUTER_API_KEY from Bitwarden"

# List all project secrets
opencode run --prompt "List all items in the 'Project Secrets' folder"
```

### **Automated Secret Loading**

```javascript
// config/secrets.js
export async function loadSecrets() {
  const secrets = {};

  // Load from Bitwarden
  secrets.DATABASE_URL = await getSecret("Inbox Zero Database", "DATABASE_URL");
  secrets.GOOGLE_CLIENT_ID = await getSecret(
    "Google OAuth",
    "GOOGLE_CLIENT_ID",
  );
  secrets.OPENROUTER_API_KEY = await getSecret(
    "OpenRouter API",
    "OPENROUTER_API_KEY",
  );

  // Fallback to environment variables if Bitwarden fails
  secrets.DATABASE_URL ||= process.env.DATABASE_URL;
  secrets.GOOGLE_CLIENT_ID ||= process.env.GOOGLE_CLIENT_ID;

  return secrets;
}
```

---

## 🔄 **Migration from .env to Bitwarden**

### **Step 1: Export Current .env**

```bash
# Backup current .env
cp .env .env.backup

# Extract secrets (be careful with sensitive data)
grep "=" .env | head -10
```

### **Step 2: Import to Bitwarden**

```bash
# Create items in Bitwarden
while IFS='=' read -r key value; do
  if [[ $key == *SECRET* ]] || [[ $key == *KEY* ]] || [[ $key == *PASSWORD* ]]; then
    bw create item --name "$key" --field "$key=$value" --folder "Project Secrets"
  fi
done < .env
```

### **Step 3: Remove .env from Git**

```bash
# Add .env to .gitignore if not already there
echo ".env" >> .gitignore

# Remove from git tracking
git rm --cached .env 2>/dev/null || true
```

### **Step 4: Update Application Code**

```javascript
// Instead of dotenv
// require('dotenv').config();

// Use Bitwarden
import { loadSecrets } from "./config/secrets";
const secrets = await loadSecrets();
```

---

## 🛡️ **Security Benefits**

### **✅ Bitwarden Advantages**

- **End-to-End Encryption**: Only you can decrypt your data
- **Zero-Knowledge**: Bitwarden can't read your secrets
- **Cross-Device Sync**: Access secrets from any device
- **Audit Trail**: Track who accessed what secrets
- **Secure Sharing**: Share secrets with team members safely

### **✅ Development Workflow**

- **No More Overwrites**: Secrets stored securely in Bitwarden
- **Version Control Safe**: No sensitive data in git
- **Environment Agnostic**: Same secrets work across all environments
- **Automated Retrieval**: Programmatic access to secrets

---

## 📋 **Bitwarden Commands Reference**

### **Secret Management**

```bash
# List items
bw list items --folder "Project Secrets"

# Get specific field
bw get item "Database Config" --field "DATABASE_URL"

# Update secret
bw edit item "API Keys" --field "OPENROUTER_API_KEY=new_key"

# Delete secret
bw delete item "Old Secret"
```

### **Folder Management**

```bash
# Create folder
bw create folder "Project Secrets"

# List folders
bw list folders

# Move item to folder
bw move "item_id" "folder_id"
```

### **Session Management**

```bash
# Login (already done)
bw login

# Unlock vault
bw unlock

# Lock vault
bw lock

# Check status
bw status
```

---

## 🎯 **Implementation Plan**

### **Phase 1: Setup (Today)**

```bash
✅ Bitwarden MCP server configured
✅ BW_SESSION environment variable set
✅ Basic secret retrieval working
```

### **Phase 2: Migration (Next)**

```bash
# Move critical secrets to Bitwarden
bw create item --name "Database" --field "DATABASE_URL=..." --folder "Project Secrets"
bw create item --name "Google OAuth" --field "CLIENT_ID=..." --folder "Project Secrets"

# Update application to use Bitwarden
# Remove .env from version control
```

### **Phase 3: Automation (Future)**

```bash
# Automated secret loading
# CI/CD integration
# Environment-specific secrets
# Team secret sharing
```

---

## 🚀 **Ready to Use Bitwarden!**

Your **Bitwarden MCP server** is now active and ready to manage all your project secrets securely. No more overwritten `.env` files!

**Start using Bitwarden for secret management:**

```bash
opencode run --prompt "Help me store my project secrets in Bitwarden"
```

**🎉 Secure secret management without .env file conflicts!** 🔐✨
