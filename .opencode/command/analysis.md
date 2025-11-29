---
description: "Execute comprehensive project analysis and reporting"
agent: "build"
subtask: true
---

# 📊 Project Analysis & Reporting

Comprehensive project analysis, code quality assessment, and detailed reporting.

## Phase 1: Analysis Type Selection

**What type of analysis are you performing?**

- `code-quality` - Code quality, complexity, and maintainability analysis
- `performance` - Performance profiling and optimization analysis
- `security` - Security vulnerability and compliance analysis
- `architecture` - System architecture and design analysis
- `dependencies` - Dependency analysis and vulnerability assessment
- `testing` - Test coverage and quality analysis
- `documentation` - Documentation completeness and quality analysis
- `full` - Comprehensive analysis across all areas

**User provided:** $1

## Phase 2: Analysis Configuration

**Analysis Details:**

- **Target:** $2 (specific file, directory, or entire project)
- **Scope:** $3 (files/patterns to include, e.g., `apps/web/**`, `utils/**`, `**/*.ts`)
- **Depth:** $4 (shallow vs deep analysis)
- **Format:** $5 (json, markdown, html, pdf)
- **Output:** $6 (file path or location for generated report)

**Generated Reports:**

- Analysis findings with recommendations
- Quality metrics and benchmarks
- Visualizations and charts
- Action items and improvement plans

## Phase 3: Code Quality Analysis

### Code Metrics

```typescript
// Code quality analysis framework
interface CodeQualityMetrics {
  complexity: {
    cyclomaticComplexity: number;
    cognitiveComplexity: number;
    halsteadVolume: number;
    halsteadDifficulty: number;
  };
  maintainability: {
    duplicateCode: number;
    deadCode: number;
    longMethods: number;
    largeClasses: number;
    deepNesting: number;
  };
  standards: {
    typescriptCompliance: number; // 0-100%
    lintingIssues: number;
    formattingIssues: number;
    namingConventions: number;
  };
  testing: {
    testCoverage: number; // percentage
    unitTestCount: number;
    integrationTestCount: number;
    e2eTestCount: number;
  };
  documentation: {
    apiDocumentation: number; // percentage
    codeComments: number; // percentage
    readmeCompleteness: number; // percentage
  };
}

// Analysis implementation
const codeQualityAnalysis = {
  // Complexity analysis
  analyzeComplexity: (filePath: string) => {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    // Cyclomatic complexity
    const complexity = lines.reduce((total, line) => {
      const conditions = (
        line.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bcase\b/g) || []
      ).length;
      const nestedConditions = (line.match(/\bif\b.*\bif\b/g) || []).length;
      return total + conditions + nestedConditions;
    }, 0);

    return {
      cyclomaticComplexity: complexity / lines.length,
      cognitiveComplexity: Math.sqrt(complexity),
      halsteadVolume: Math.log2(lines.length),
      halsteadDifficulty: Math.log2(complexity) / Math.log2(2),
    };
  },

  // Maintainability analysis
  analyzeMaintainability: (directory: string) => {
    const files = glob.sync(`${directory}/**/*.{ts,tsx}`);
    let totalLines = 0;
    let duplicateLines = 0;
    let longMethods = 0;
    let largeClasses = 0;

    files.forEach((file) => {
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split("\n");
      totalLines += lines.length;

      // Check for long methods (>50 lines)
      const methods = content.match(/function\s+\w+\s*\([^)]*\)\s*{/gs) || [];
      methods.forEach((method) => {
        const methodLines = method.split("\n").length;
        if (methodLines > 50) longMethods++;
      });

      // Check for large classes (>500 lines)
      if (lines.length > 500) largeClasses++;
    });

    return {
      duplicateCode: duplicateLines,
      deadCode: 0, // Would need dead code detection
      longMethods,
      largeClasses,
      deepNesting: 0, // Would need nesting analysis
    };
  },

  // Standards compliance
  analyzeStandards: (directory: string) => {
    const files = glob.sync(`${directory}/**/*.{ts,tsx}`);
    let typescriptIssues = 0;
    let lintingIssues = 0;
    let formattingIssues = 0;
    let namingIssues = 0;

    files.forEach((file) => {
      const content = fs.readFileSync(file, "utf8");

      // TypeScript issues
      if (content.includes("any") && !content.includes("// @ts-ignore"))
        typescriptIssues++;
      if (content.includes("// @ts-nocheck")) typescriptIssues++;

      // Linting issues (simplified)
      if (content.includes("console.log")) lintingIssues++;
      if (content.includes("debugger")) lintingIssues++;
      if (!content.includes("import React")) lintingIssues++;

      // Formatting issues
      if (content.includes("  ") && content.includes("\t")) formattingIssues++;

      // Naming issues
      const badNames = content.match(/\b(temp|tmp|data|foo|bar)\b/gi) || [];
      namingIssues += badNames.length;
    });

    const totalFiles = files.length;

    return {
      typescriptCompliance: Math.max(
        0,
        100 - (typescriptIssues / totalFiles) * 100,
      ),
      lintingIssues,
      formattingIssues,
      namingConventions: namingIssues,
    };
  },
};
```

### Quality Assessment

```typescript
// Quality assessment framework
interface QualityAssessment {
  overall: "excellent" | "good" | "fair" | "poor";
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

const assessQuality = (metrics: CodeQualityMetrics): QualityAssessment => {
  let score = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  // Calculate score based on metrics
  if (metrics.standards.typescriptCompliance > 90) score += 20;
  else if (metrics.standards.typescriptCompliance > 80) score += 15;
  else if (metrics.standards.typescriptCompliance > 70) score += 10;

  if (metrics.testing.testCoverage > 90) score += 20;
  else if (metrics.testing.testCoverage > 80) score += 15;
  else if (metrics.testing.testCoverage > 70) score += 10;

  if (metrics.standards.lintingIssues === 0) score += 15;
  else if (metrics.standards.lintingIssues < 5) score += 10;
  else if (metrics.standards.lintingIssues < 10) score += 5;

  if (metrics.maintainability.complexity.cyclomaticComplexity < 10) score += 15;
  else if (metrics.maintainability.complexity.cyclomaticComplexity < 20)
    score += 10;

  // Determine overall quality
  let overall: QualityAssessment["overall"];
  if (score >= 85) {
    overall = "excellent";
    strengths.push("High code quality standards");
    strengths.push("Comprehensive test coverage");
  } else if (score >= 70) {
    overall = "good";
    strengths.push("Good code structure");
  } else if (score >= 50) {
    overall = "fair";
    weaknesses.push("Inconsistent code quality");
  } else {
    overall = "poor";
    weaknesses.push("Significant code quality issues");
  }

  // Generate recommendations
  if (metrics.testing.testCoverage < 80) {
    recommendations.push("Increase test coverage to 80%+");
  }
  if (metrics.standards.typescriptCompliance < 90) {
    recommendations.push("Fix TypeScript strict mode violations");
  }
  if (metrics.standards.lintingIssues > 5) {
    recommendations.push("Address linting issues");
  }
  if (metrics.maintainability.complexity.cyclomaticComplexity > 15) {
    recommendations.push("Reduce method complexity");
  }

  return {
    overall,
    score,
    strengths,
    weaknesses,
    recommendations,
  };
};
```

## Phase 4: Performance Analysis

### Performance Profiling

```typescript
// Performance analysis framework
interface PerformanceMetrics {
  api: {
    responseTime: {
      p50: number;
      p95: number;
      p99: number;
      average: number;
    };
    throughput: {
      requestsPerSecond: number;
      concurrentUsers: number;
    };
    errorRate: number;
  };
  frontend: {
    bundleSize: {
      main: number;
      chunks: number[];
      total: number;
    };
    webVitals: {
      firstContentfulPaint: number;
      largestContentfulPaint: number;
      cumulativeLayoutShift: number;
      firstInputDelay: number;
    };
  };
  database: {
    queryTime: {
      average: number;
      p95: number;
      slowQueries: number;
    };
    connectionCount: number;
    indexUsage: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

// Performance analysis implementation
const performanceAnalysis = {
  // API performance analysis
  analyzeApiPerformance: (logs: string[]) => {
    const responseTimes = logs
      .filter((log) => log.includes("response_time"))
      .map((log) => parseFloat(log.split("response_time:")[1]));

    responseTimes.sort((a, b) => a - b);

    const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)];
    const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
    const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];
    const average =
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    return {
      responseTime: { p50, p95, p99, average },
      throughput: {
        requestsPerSecond: logs.length / 60, // Assuming 1 minute of logs
        concurrentUsers: 100, // Would need actual data
      },
      errorRate:
        logs.filter((log) => log.includes("error")).length / logs.length,
    };
  },

  // Frontend performance analysis
  analyzeFrontendPerformance: (bundleStats: any) => {
    return {
      bundleSize: {
        main: bundleStats.main || 0,
        chunks: bundleStats.chunks || [],
        total: bundleStats.total || 0,
      },
      webVitals: {
        firstContentfulPaint: bundleStats.fcp || 0,
        largestContentfulPaint: bundleStats.lcp || 0,
        cumulativeLayoutShift: bundleStats.cls || 0,
        firstInputDelay: bundleStats.fid || 0,
      },
    };
  },

  // Database performance analysis
  analyzeDatabasePerformance: (queryStats: any[]) => {
    const queryTimes = queryStats.map((stat) => stat.averageTime);
    queryTimes.sort((a, b) => a - b);

    const average = queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length;
    const p95 = queryTimes[Math.floor(queryTimes.length * 0.95)];
    const slowQueries = queryStats.filter(
      (stat) => stat.averageTime > 1000,
    ).length;

    return {
      queryTime: { average, p95, slowQueries },
      connectionCount: queryStats.reduce(
        (sum, stat) => sum + stat.connectionCount,
        0,
      ),
      indexUsage: queryStats.length, // Simplified
    };
  },
};
```

## Phase 5: Security Analysis

### Security Vulnerability Assessment

```typescript
// Security analysis framework
interface SecurityAnalysis {
  vulnerabilities: {
    critical: Vulnerability[];
    high: Vulnerability[];
    medium: Vulnerability[];
    low: Vulnerability[];
    info: Vulnerability[];
  };
  compliance: {
    owaspTop10: ComplianceCheck[];
    gdpr: ComplianceCheck[];
    soc2: ComplianceCheck[];
  };
  bestPractices: {
    authentication: ComplianceCheck[];
    authorization: ComplianceCheck[];
    dataProtection: ComplianceCheck[];
    infrastructure: ComplianceCheck[];
  };
}

interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  cwe: string;
  cvssScore: number;
  affectedFiles: string[];
  remediation: string;
}

interface ComplianceCheck {
  requirement: string;
  status: "compliant" | "non-compliant" | "partial";
  description: string;
  evidence: string;
}

// Security analysis implementation
const securityAnalysis = {
  // Vulnerability scanning
  scanVulnerabilities: (codebase: string) => {
    const vulnerabilities: Vulnerability[] = [];

    // Check for common security issues
    const securityPatterns = [
      {
        pattern: /eval\s*\(/gi,
        title: "Code Injection",
        severity: "critical",
        cwe: "CWE-94",
        description: "Use of eval() function allows code injection",
      },
      {
        pattern: /innerHTML\s*=\s*[^>]*</gi,
        title: "Cross-Site Scripting (XSS)",
        severity: "high",
        cwe: "CWE-79",
        description: "Direct assignment to innerHTML without sanitization",
      },
      {
        pattern: /SELECT.*FROM.*WHERE.*\+.*req/gi,
        title: "SQL Injection",
        severity: "critical",
        cwe: "CWE-89",
        description: "Concatenation of SQL query strings",
      },
      {
        pattern: /req\.params\./gi,
        title: "Path Traversal",
        severity: "high",
        cwe: "CWE-22",
        description: "Direct use of request parameters without validation",
      },
    ];

    securityPatterns.forEach((pattern) => {
      const matches = codebase.match(pattern.pattern);
      if (matches) {
        matches.forEach((match) => {
          vulnerabilities.push({
            id: `SEC-${Date.now()}-${Math.random()}`,
            title: pattern.title,
            description: pattern.description,
            severity: pattern.severity,
            cwe: pattern.cwe,
            cvssScore:
              pattern.severity === "critical"
                ? 9.5
                : pattern.severity === "high"
                  ? 8.5
                  : pattern.severity === "medium"
                    ? 6.5
                    : 4.0,
            affectedFiles: [], // Would need file tracking
            remediation: `Remove ${pattern.title} vulnerability and use secure alternatives`,
          });
        });
      }
    });

    return vulnerabilities;
  },

  // Compliance assessment
  assessCompliance: (codebase: string) => {
    const owaspChecks: ComplianceCheck[] = [
      {
        requirement: "A01 - Broken Access Control",
        status: codebase.includes("withAuth") ? "compliant" : "non-compliant",
        description: "Proper access control mechanisms",
        evidence: codebase.includes("withAuth")
          ? "Found withAuth middleware"
          : "No access control found",
      },
      {
        requirement: "A02 - Cryptographic Failures",
        status:
          codebase.includes("bcrypt") || codebase.includes("argon2")
            ? "compliant"
            : "partial",
        description: "Strong cryptographic algorithms",
        evidence: codebase.includes("bcrypt")
          ? "Found bcrypt"
          : "No strong encryption found",
      },
      // ... other OWASP checks
    ];

    return {
      owaspTop10: owaspChecks,
      gdpr: [], // Would need GDPR-specific analysis
      soc2: [], // Would need SOC 2 specific analysis
    };
  },
};
```

## Phase 6: Dependency Analysis

### Dependency Assessment

```typescript
// Dependency analysis framework
interface DependencyAnalysis {
  packages: {
    total: number;
    outdated: number;
    vulnerable: number;
    deprecated: number;
    licenseIssues: number;
  };
  security: {
    highRiskVulnerabilities: number;
    mediumRiskVulnerabilities: number;
    lowRiskVulnerabilities: number;
    auditPassed: boolean;
  };
  maintenance: {
    lastUpdate: Date;
    updateFrequency: string;
    communityHealth: string;
  };
}

// Dependency analysis implementation
const dependencyAnalysis = {
  analyzeDependencies: (packageJson: any) => {
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    const packageNames = Object.keys(dependencies);

    return {
      packages: {
        total: packageNames.length,
        outdated: 0, // Would need npm outdated check
        vulnerable: 0, // Would need npm audit
        deprecated: 0, // Would need deprecated package check
        licenseIssues: 0, // Would need license check
      },
      security: {
        highRiskVulnerabilities: 0,
        mediumRiskVulnerabilities: 0,
        lowRiskVulnerabilities: 0,
        auditPassed: true,
      },
      maintenance: {
        lastUpdate: new Date(),
        updateFrequency: "unknown",
        communityHealth: "unknown",
      },
    };
  },
};
```

## Phase 7: Documentation Analysis

### Documentation Assessment

```typescript
// Documentation analysis framework
interface DocumentationAnalysis {
  completeness: {
    apiDocumentation: number; // percentage
    readmeCompleteness: number; // percentage
    codeComments: number; // percentage
  };
  quality: {
    accuracy: number; // percentage
    consistency: number; // percentage
    accessibility: number; // percentage
  };
  coverage: {
    apis: number; // percentage documented
    components: number; // percentage documented
    workflows: number; // percentage documented
  };
}

// Documentation analysis implementation
const documentationAnalysis = {
  analyzeDocumentation: (projectPath: string) => {
    const readmeExists = fs.existsSync(path.join(projectPath, "README.md"));
    const apiDocsExist = fs.existsSync(
      path.join(projectPath, "docs", "api.md"),
    );

    return {
      completeness: {
        apiDocumentation: apiDocsExist ? 80 : 20,
        readmeCompleteness: readmeExists ? 90 : 10,
        codeComments: 60, // Would need actual analysis
      },
      quality: {
        accuracy: 75, // Estimated
        consistency: 80, // Estimated
        accessibility: 70, // Estimated
      },
      coverage: {
        apis: apiDocsExist ? 70 : 10,
        components: 50, // Estimated
        workflows: 30, // Estimated
      },
    };
  },
};
```

## Phase 8: Report Generation

### Comprehensive Report Template

```markdown
# Project Analysis Report

## Executive Summary

- **Analysis Date**: [Date]
- **Project**: [Project Name]
- **Overall Quality Score**: [Score]/100
- **Quality Level**: [Excellent/Good/Fair/Poor]

## Code Quality Analysis

### Metrics

- **TypeScript Compliance**: [percentage]%
- **Test Coverage**: [percentage]%
- **Linting Issues**: [count]
- **Code Complexity**: [metrics]
- **Maintainability**: [assessment]

### Findings

#### Strengths

- [List of strengths]

#### Areas for Improvement

- [List of weaknesses]

#### Recommendations

- [Prioritized recommendations]

## Performance Analysis

### API Performance

- **Average Response Time**: [time]ms
- **95th Percentile**: [time]ms
- **Throughput**: [requests/second]

### Frontend Performance

- **Bundle Size**: [size]KB
- **First Contentful Paint**: [time]s
- **Largest Contentful Paint**: [time]s

## Security Analysis

### Vulnerabilities Found

- **Critical**: [count]
- **High**: [count]
- **Medium**: [count]
- **Low**: [count]

### Compliance Status

- **OWASP Top 10**: [percentage]% compliant
- **GDPR**: [percentage]% compliant
- **SOC 2**: [percentage]% compliant

## Dependency Analysis

### Package Statistics

- **Total Packages**: [count]
- **Outdated**: [count]
- **Vulnerable**: [count]
- **Deprecated**: [count]

### Security Audit

- **High Risk**: [count]
- **Medium Risk**: [count]
- **Low Risk**: [count]
- **Audit Status**: [passed/failed]

## Documentation Analysis

### Completeness

- **API Documentation**: [percentage]%
- **README**: [percentage]%
- **Code Comments**: [percentage]%

### Quality Assessment

- **Accuracy**: [percentage]%
- **Consistency**: [percentage]%
- **Accessibility**: [percentage]%

## Action Items

### Immediate (0-7 days)

1. [Action item]
2. [Action item]
3. [Action item]

### Short-term (8-30 days)

1. [Action item]
2. [Action item]
3. [Action item]

### Long-term (30+ days)

1. [Action item]
2. [Action item]
3. [Action item]

## Appendix

### Detailed Metrics

[Detailed metrics and data]

### Methodology

[Analysis approach and tools used]
```

## Phase 9: File Generation

**Generate the following files:**

1. `analysis-report.md` - Comprehensive analysis report
2. `metrics.json` - Structured metrics data
3. `recommendations.md` - Actionable recommendations
4. `charts/` - Visualization charts (if applicable)

## Phase 10: Execution Protocol

**NOW execute the following:**

1. **Parse Arguments**: Extract analysis type, target, scope, depth, format, and output
2. **Select Analysis Framework**: Choose appropriate analysis tools and methods
3. **Execute Analysis**: Run code quality, performance, security, and dependency analysis
4. **Generate Reports**: Create comprehensive documentation and visualizations
5. **Create Recommendations**: Develop actionable improvement plans
6. **File Creation**: Write all analysis files to appropriate locations

**Examples:**

```bash
/analysis code-quality apps/web "comprehensive" "typescript,react" "deep" "markdown" "./analysis/"
/analysis performance api "api-performance" "logs/**" "shallow" "json" "./metrics/"
/analysis security full apps/web "security-scan" "**/*.ts" "deep" "html" "./security-report/"
/analysis dependencies apps/web "dependency-audit" "package.json" "shallow" "json" "./dependency-report/"
```

Execute comprehensive project analysis now.
