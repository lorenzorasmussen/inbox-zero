---
description: "Execute comprehensive security audit following Inbox Zero security guidelines"
agent: build
subtask: true
---

# 🔒 Security Audit Generator

Perform comprehensive security audit following Inbox Zero security patterns, vulnerability assessment, and compliance validation.

## Phase 1: Audit Scope Selection

**What type of security audit are you performing?**

- `full` - Complete security audit of entire codebase
- `api` - API routes and endpoint security
- `auth` - Authentication and authorization systems
- `data` - Data handling and validation security
- `infrastructure` - Infrastructure and deployment security
- `dependencies` - Third-party dependencies and supply chain
- `compliance` - Regulatory compliance (GDPR, SOC2, etc.)

**User provided:** $1

## Phase 2: Audit Configuration

**Audit Details:**

- **Target:** $2 (specific file, directory, or component)
- **Scope:** $3 (files/patterns to include, e.g., `apps/web/app/api/**`, `utils/actions/**`)
- **Depth:** $4 (shallow scan vs deep analysis)
- **Standards:** $5 (OWASP, NIST, ISO 27001, custom)

**Generated Reports:**

- Security audit report with findings and recommendations
- Vulnerability assessment with severity levels
- Compliance validation report
- Remediation roadmap with priorities

## Phase 3: Security Analysis Framework

### Authentication & Authorization Audit

#### JWT Token Security

```typescript
// Audit: JWT implementation security
interface JWTAudit {
  tokenValidation: {
    algorithm: string; // HS256 vs RS256
    secretStrength: "weak" | "medium" | "strong";
    expirationPolicy: "too-short" | "reasonable" | "too-long";
    refreshRotation: boolean;
  };
  middlewareImplementation: {
    properErrorHandling: boolean;
    tokenExtraction: "header" | "cookie" | "both";
    csrfProtection: boolean;
    rateLimiting: boolean;
  };
}

// Audit checklist
const jwtAuditChecklist = {
  // Token Security
  "Strong signing algorithm used": false, // RS256 recommended
  "Secure secret storage": false, // Environment variables
  "Appropriate expiration": true, // 15-60 minutes
  "Refresh token rotation": false, // Should implement

  // Middleware Security
  "Proper error handling": true,
  "Token extraction from Authorization header": true,
  "CSRF protection implemented": true,
  "Rate limiting configured": true,

  // Session Management
  "Secure session storage": false, // HttpOnly, Secure cookies
  "Session invalidation on logout": true,
  "Concurrent session handling": true,
};
```

#### OAuth2 Security

```typescript
// Audit: OAuth2 implementation security
interface OAuth2Audit {
  providerSecurity: {
    clientSecretStorage: "plaintext" | "encrypted" | "environment";
    redirectUriValidation: boolean;
    stateParameterUsage: boolean;
    pkceImplementation: boolean;
  };
  tokenSecurity: {
    accessTokenEncryption: boolean;
    refreshTokenRotation: boolean;
    tokenScopeMinimization: boolean;
    tokenRevocationSupport: boolean;
  };
}

// Audit checklist
const oauth2AuditChecklist = {
  // Provider Security
  "Client secrets stored securely": false, // Environment variables
  "Redirect URI validation implemented": true,
  "State parameter used for CSRF protection": true,
  "PKCE implemented for public clients": false,

  // Token Security
  "Access tokens encrypted at rest": false,
  "Refresh token rotation implemented": false,
  "Minimal token scopes requested": true,
  "Token revocation supported": true,
};
```

### API Security Audit

#### Input Validation & Sanitization

```typescript
// Audit: Input validation security
interface InputValidationAudit {
  validationFramework: {
    schemaValidation: "zod" | "joi" | "custom" | "none";
    typeChecking: "strict" | "lenient" | "none";
    sanitizationLibrary: "dompurify" | "sanitize-html" | "none";
  };
  parameterSecurity: {
    sqlInjectionPrevention: boolean;
    xssPrevention: boolean;
    commandInjectionPrevention: boolean;
    pathTraversalPrevention: boolean;
    fileUploadValidation: boolean;
  };
}

// Audit checklist
const inputValidationAuditChecklist = {
  // Validation Framework
  "Schema validation implemented (Zod)": true,
  "TypeScript strict mode enabled": true,
  "HTML sanitization for user content": true,

  // Parameter Security
  "Parameterized queries used (Prisma)": true,
  "XSS prevention implemented": true,
  "Command injection prevention": true,
  "Path traversal prevention": true,
  "File upload validation implemented": true,

  // Input Validation
  "All inputs validated before processing": true,
  "Length and format constraints enforced": true,
  "Whitelist approach for sensitive operations": true,
};
```

#### Authorization & Access Control

```typescript
// Audit: Authorization security
interface AuthorizationAudit {
  accessControl: {
    rbacImplementation: boolean;
    principleOfLeastPrivilege: boolean;
    resourceOwnershipValidation: boolean;
    sessionBasedAuthorization: boolean;
  };
  apiSecurity: {
    properMiddlewareUsage: boolean;
    endpointSpecificAuthorization: boolean;
    rateLimitingImplementation: boolean;
    corsConfiguration: "secure" | "permissive" | "none";
  };
}

// Audit checklist
const authorizationAuditChecklist = {
  // Access Control
  "Role-based access control implemented": true,
  "Principle of least privilege enforced": true,
  "Resource ownership validation implemented": true,
  "Session-based authorization working": true,

  // API Security
  "Proper middleware usage (withAuth, withEmailAccount)": true,
  "Endpoint-specific authorization implemented": true,
  "Rate limiting configured": true,
  "CORS configured securely": true,

  // Data Access
  "User-scoped data queries only": true,
  "No direct object references without ownership check": true,
  "Admin endpoints properly protected": true,
};
```

### Data Security Audit

#### Encryption & Storage

```typescript
// Audit: Data encryption and storage security
interface DataSecurityAudit {
  encryption: {
    dataAtRestEncryption: boolean;
    dataInTransitEncryption: boolean;
    keyManagement: "secure" | "weak" | "compromised";
    algorithmStrength: "weak" | "medium" | "strong";
  };
  storage: {
    sensitiveDataHandling: "encrypted" | "plaintext" | "mixed";
    dataMinimization: boolean;
    dataRetentionPolicy: boolean;
    backupSecurity: boolean;
  };
}

// Audit checklist
const dataSecurityAuditChecklist = {
  // Encryption
  "Data encrypted at rest (AES-256)": true,
  "Data encrypted in transit (TLS 1.3)": true,
  "Encryption keys managed securely": false, // Should use KMS
  "Strong encryption algorithms used": true,

  // Storage
  "Sensitive data encrypted in storage": true,
  "Data minimization principle followed": true,
  "Data retention policy implemented": false,
  "Secure backup procedures": true,
};
```

### Infrastructure Security Audit

#### Container & Deployment Security

```typescript
// Audit: Infrastructure security
interface InfrastructureAudit {
  containerSecurity: {
    baseImageSecurity: boolean;
    rootUserUsage: boolean;
    secretManagement: "secure" | "environment" | "plaintext";
    networkIsolation: boolean;
  };
  deploymentSecurity: {
    sslConfiguration: boolean;
    firewallConfiguration: boolean;
    monitoringImplementation: boolean;
    backupStrategy: boolean;
  };
}

// Audit checklist
const infrastructureAuditChecklist = {
  // Container Security
  "Non-root container user used": false, // Should use non-root
  "Minimal base images used": true,
  "Secrets managed securely": false, // Should use KMS
  "Container network isolation implemented": true,

  // Deployment Security
  "SSL/TLS properly configured": true,
  "Firewall rules configured": true,
  "Security monitoring implemented": true,
  "Secure backup strategy implemented": true,
};
```

## Phase 4: Vulnerability Assessment

### OWASP Top 10 Analysis

#### A01: Broken Access Control

```typescript
// Audit: Broken access control vulnerabilities
interface AccessControlVulnerabilities {
  idorVulnerabilities: {
    directObjectReferences: boolean;
    parameterManipulation: boolean;
    privilegeEscalation: boolean;
  };
  authorizationFlaws: {
    missingAuthentication: boolean;
    weakAuthentication: boolean;
    authorizationBypass: boolean;
  };
}

// Vulnerability detection patterns
const accessControlVulnerabilityPatterns = [
  {
    pattern: /prisma\..*\.findUnique\(\s*\{\s*id:\s*['"`]?\s*req/,
    description: "Direct object reference without ownership check",
    severity: "HIGH",
    cwe: "CWE-89",
  },
  {
    pattern: /req\.params\.id/,
    description: "Direct parameter usage without validation",
    severity: "HIGH",
    cwe: "CWE-89",
  },
  {
    pattern: /WHERE.*userId.*=.*req\.params/,
    description: "SQL injection through parameter manipulation",
    severity: "CRITICAL",
    cwe: "CWE-89",
  },
];
```

#### A02: Cryptographic Failures

```typescript
// Audit: Cryptographic vulnerabilities
interface CryptoVulnerabilities {
  encryption: {
    weakAlgorithms: boolean;
    keyManagementIssues: boolean;
    ivReuse: boolean;
  };
  hashing: {
    weakHashFunctions: boolean;
    saltUsage: boolean;
    rainbowTableVulnerability: boolean;
  };
}

// Vulnerability detection patterns
const cryptoVulnerabilityPatterns = [
  {
    pattern: /md5|sha1/,
    description: "Weak cryptographic hash function",
    severity: "HIGH",
    cwe: "CWE-327",
  },
  {
    pattern: /crypto\.createCipher\(['"`]?)aes128|des|rc4/,
    description: "Weak encryption algorithm",
    severity: "HIGH",
    cwe: "CWE-327",
  },
];
```

#### A03: Injection

```typescript
// Audit: Injection vulnerabilities
interface InjectionVulnerabilities {
  sqlInjection: {
    parameterizedQueries: boolean;
    inputValidation: boolean;
    ormUsage: boolean;
  };
  commandInjection: {
    inputSanitization: boolean;
    parameterPassing: boolean;
    shellEscaping: boolean;
  };
  xssInjection: {
    outputEncoding: boolean;
    inputSanitization: boolean;
    cspHeaders: boolean;
  };
}

// Vulnerability detection patterns
const injectionVulnerabilityPatterns = [
  {
    pattern: /SELECT.*FROM.*WHERE.*\+.*req/,
    description: "SQL injection through string concatenation",
    severity: "CRITICAL",
    cwe: "CWE-89",
  },
  {
    pattern: /exec\(|system\(|shell\(/,
    description: "Command injection vulnerability",
    severity: "CRITICAL",
    cwe: "CWE-78",
  },
  {
    pattern: /innerHTML.*=.*req/,
    description: "Cross-site scripting (XSS) vulnerability",
    severity: "HIGH",
    cwe: "CWE-79",
  },
];
```

## Phase 5: Compliance Assessment

### GDPR Compliance

```typescript
// Audit: GDPR compliance
interface GDPRCompliance {
  dataProtection: {
    lawfulBasis: boolean;
    purposeLimitation: boolean;
    dataMinimization: boolean;
    accuracyGuarantee: boolean;
    storageLimitation: boolean;
  };
  userRights: {
    rightToAccess: boolean;
    rightToRectification: boolean;
    rightToErasure: boolean;
    rightToPortability: boolean;
    rightToObject: boolean;
  };
}

// GDPR compliance checklist
const gdprComplianceChecklist = {
  // Data Protection Principles
  "Lawful basis for processing identified": true,
  "Purpose limitation implemented": true,
  "Data minimization principle followed": true,
  "Data accuracy maintained": true,
  "Storage limitation implemented": false,

  // User Rights
  "Right to access data implemented": true,
  "Right to rectification implemented": true,
  "Right to erasure implemented": true,
  "Right to data portability implemented": true,
  "Right to object implemented": true,

  // Technical Implementation
  "Consent management implemented": true,
  "Data breach notification system": true,
  "Privacy by design implemented": true,
  "Data protection officer designated": false,
};
```

### SOC 2 Compliance

```typescript
// Audit: SOC 2 compliance
interface SOC2Compliance {
  accessControl: {
    userAccessReview: boolean;
    accessRevocation: boolean;
    privilegedAccessMonitoring: boolean;
    remoteAccessControl: boolean;
  };
  securityOperations: {
    incidentResponse: boolean;
    vulnerabilityManagement: boolean;
    securityAwarenessTraining: boolean;
    securityTesting: boolean;
  };
}

// SOC 2 compliance checklist
const soc2ComplianceChecklist = {
  // Access Control
  "User access reviews performed regularly": false,
  "Access revocation process implemented": true,
  "Privileged access monitoring implemented": true,
  "Remote access controls implemented": true,

  // Security Operations
  "Incident response plan established": false,
  "Vulnerability management process implemented": true,
  "Security awareness training provided": true,
  "Regular security testing performed": true,
};
```

## Phase 6: Security Testing

### Automated Security Testing

```typescript
// Security test automation
interface SecurityTestSuite {
  staticAnalysis: {
    dependencyScanning: boolean;
    codeAnalysis: boolean;
    configurationScanning: boolean;
  };
  dynamicAnalysis: {
    penetrationTesting: boolean;
    fuzzing: boolean;
    runtimeSecurityTesting: boolean;
  };
  complianceTesting: {
    accessibilityTesting: boolean;
    performanceSecurityTesting: boolean;
  };
}

// Security test implementation
const securityTestImplementation = {
  // Static Analysis
  dependencyScanning: "npm audit && snyk test",
  codeAnalysis: "semgrep --config=security",
  configurationScanning: "checkov --config-file",

  // Dynamic Analysis
  penetrationTesting: "owasp-zap baseline",
  fuzzing: "ffuf -w wordlist.txt",
  runtimeSecurityTesting: "node --inspect --security-tests",

  // Compliance Testing
  accessibilityTesting: "axe --include wcag2a",
  performanceSecurityTesting: "lighthouse --security-only",
};
```

### Security Test Cases

```typescript
// Security test cases
interface SecurityTestCases {
  authenticationTests: {
    validCredentials: boolean;
    invalidCredentials: boolean;
    tokenExpiration: boolean;
    tokenRefresh: boolean;
  };
  authorizationTests: {
    validAccess: boolean;
    unauthorizedAccess: boolean;
    privilegeEscalation: boolean;
  };
  inputValidationTests: {
    sqlInjection: boolean;
    xssInjection: boolean;
    commandInjection: boolean;
    pathTraversal: boolean;
  };
}

// Security test implementation
const securityTestCases = {
  // Authentication Tests
  validCredentials: "test with valid credentials",
  invalidCredentials: "test with invalid credentials",
  tokenExpiration: "test with expired token",
  tokenRefresh: "test token refresh mechanism",

  // Authorization Tests
  validAccess: "test with proper permissions",
  unauthorizedAccess: "test without permissions",
  privilegeEscalation: "test privilege escalation attempts",

  // Input Validation Tests
  sqlInjection: "test SQL injection payloads",
  xssInjection: "test XSS attack vectors",
  commandInjection: "test command injection attempts",
  pathTraversal: "test path traversal attacks",
};
```

## Phase 7: Remediation Planning

### Vulnerability Remediation

```typescript
// Remediation planning
interface RemediationPlan {
  vulnerabilities: {
    critical: Vulnerability[];
    high: Vulnerability[];
    medium: Vulnerability[];
    low: Vulnerability[];
  };
  timeline: {
    immediate: string[]; // 0-7 days
    shortTerm: string[]; // 8-30 days
    mediumTerm: string[]; // 31-90 days
    longTerm: string[]; // 90+ days
  };
  resources: {
    developmentTeam: string[];
    securityTeam: string[];
    externalConsultants: string[];
  };
}

// Vulnerability interface
interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  cwe: string;
  cvssScore: number;
  affectedFiles: string[];
  remediation: {
    description: string;
    complexity: "LOW" | "MEDIUM" | "HIGH";
    estimatedTime: string;
    codeExample: string;
  };
}
```

### Security Roadmap

```typescript
// Security improvement roadmap
interface SecurityRoadmap {
  immediateActions: {
    week1: SecurityAction[];
    week2: SecurityAction[];
    month1: SecurityAction[];
  };
  quarterlyGoals: {
    q1: SecurityGoal[];
    q2: SecurityGoal[];
    q3: SecurityGoal[];
    q4: SecurityGoal[];
  };
  annualObjectives: {
    compliance: SecurityObjective[];
    technology: SecurityObjective[];
    training: SecurityObjective[];
  };
}

// Security action interface
interface SecurityAction {
  title: string;
  description: string;
  owner: string;
  deadline: string;
  status: "planned" | "in-progress" | "completed" | "blocked";
  dependencies: string[];
  successCriteria: string[];
}
```

## Phase 8: Reporting & Documentation

### Security Audit Report

```markdown
# Security Audit Report

## Executive Summary

- **Audit Date**: [Date]
- **Audit Scope**: [Scope description]
- **Overall Risk Level**: [CRITICAL/HIGH/MEDIUM/LOW]
- **Key Findings**: [Summary of major issues]

## Vulnerability Findings

### Critical Vulnerabilities

| ID   | Title   | Severity | Affected Files | CVSS Score | Remediation   |
| ---- | ------- | -------- | -------------- | ---------- | ------------- |
| [ID] | [Title] | CRITICAL | [files]        | [score]    | [description] |

### High Vulnerabilities

| ID   | Title   | Severity | Affected Files | CVSS Score | Remediation   |
| ---- | ------- | -------- | -------------- | ---------- | ------------- |
| [ID] | [Title] | HIGH     | [files]        | [score]    | [description] |

### Medium Vulnerabilities

| ID   | Title   | Severity | Affected Files | CVSS Score | Remediation   |
| ---- | ------- | -------- | -------------- | ---------- | ------------- |
| [ID] | [Title] | MEDIUM   | [files]        | [score]    | [description] |

### Low Vulnerabilities

| ID   | Title   | Severity | Affected Files | CVSS Score | Remediation   |
| ---- | ------- | -------- | -------------- | ---------- | ------------- |
| [ID] | [Title] | LOW      | [files]        | [score]    | [description] |

## Compliance Assessment

### GDPR Compliance

| Requirement   | Status                    | Gap           | Remediation |
| ------------- | ------------------------- | ------------- | ----------- |
| [Requirement] | [Compliant/Non-compliant] | [Description] | [Action]    |

### SOC 2 Compliance

| Control   | Status                    | Gap           | Remediation |
| --------- | ------------------------- | ------------- | ----------- |
| [Control] | [Compliant/Non-compliant] | [Description] | [Action]    |

## Recommendations

### Immediate Actions (0-7 days)

1. [Action description]
2. [Action description]
3. [Action description]

### Short-term Actions (8-30 days)

1. [Action description]
2. [Action description]
3. [Action description]

### Long-term Actions (30+ days)

1. [Action description]
2. [Action description]
3. [Action description]

## Appendix

### Methodology

- [Audit methodology description]
- [Tools used]
- [Testing scope]
- [Limitations]

### Glossary

- [Security terms and definitions]
- [Acronyms and abbreviations]
```

## Phase 9: File Generation

**Generate the following files:**

1. `security-audit-report.md` - Comprehensive security audit report
2. `vulnerability-findings.json` - Structured vulnerability data
3. `remediation-plan.md` - Detailed remediation roadmap
4. `security-test-results/` - Test results and evidence
5. `compliance-assessment.md` - Compliance evaluation report

## Phase 10: Execution Protocol

**NOW execute the following:**

1. **Parse Arguments**: Extract audit type, target, scope, and standards
2. **Select Audit Framework**: Choose appropriate security analysis framework
3. **Perform Static Analysis**: Scan code for security vulnerabilities
4. **Conduct Dynamic Testing**: Execute security tests and penetration testing
5. **Assess Compliance**: Evaluate against GDPR, SOC 2, and other standards
6. **Document Findings**: Create comprehensive vulnerability reports
7. **Plan Remediation**: Develop prioritized remediation roadmap
8. **Generate Reports**: Create all documentation and evidence files

**Examples:**

```bash
/security-audit full apps/web "comprehensive" "OWASP,NIST"
/security-audit api apps/web/app/api "endpoint-security" "OWASP"
/security-audit auth utils/auth "authentication" "NIST,ISO27001"
/security-audit dependencies . "supply-chain" "CISA,CVE"
/security-audit compliance . "GDPR,SOC2" "regulatory"
```

Execute comprehensive security audit now.
