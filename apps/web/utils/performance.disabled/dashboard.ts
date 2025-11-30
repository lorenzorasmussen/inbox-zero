/**
 * Performance dashboard configuration for Inbox Zero
 * Provides comprehensive monitoring dashboard setup
 */

export interface DashboardConfig {
  refreshInterval: number; // seconds
  retentionPeriod: number; // days
  maxDataPoints: number;
  charts: {
    enabled: string[];
    defaultTimeRange: string; // '1h' | '6h' | '24h' | '7d' | '30d'
  };
  alerts: {
    enabled: boolean;
    autoRefresh: boolean;
    maxAlerts: number;
  };
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'pie' | 'gauge';
  title: string;
  metric: string;
  yAxisLabel?: string;
  color?: string;
  target?: number;
  thresholds?: {
    warning?: number;
    critical?: number;
  };
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'alert' | 'table';
  title: string;
  config: any;
  refreshInterval?: number;
}

// Default dashboard configuration
export const defaultDashboardConfig: DashboardConfig = {
  refreshInterval: 30, // 30 seconds
  retentionPeriod: 30, // 30 days
  maxDataPoints: 1000, // Maximum 1000 data points per chart
  charts: {
    enabled: [
      'api-response-time',
      'api-throughput',
      'error-rate',
      'database-query-time',
      'frontend-performance',
      'bundle-size',
      'user-satisfaction',
      'feature-usage',
    ],
    defaultTimeRange: '24h',
  },
  alerts: {
    enabled: true,
    autoRefresh: true,
    maxAlerts: 50,
  },
};

// Chart configurations
export const chartConfigs: Record<string, ChartConfig> = {
  'api-response-time': {
    type: 'line',
    title: 'API Response Time',
    metric: 'api_response_time_p95',
    yAxisLabel: 'Response Time (ms)',
    color: '#3b82f6',
    thresholds: {
      warning: 300,
      critical: 500,
    },
  },
  'api-throughput': {
    type: 'line',
    title: 'API Throughput',
    metric: 'api_throughput',
    yAxisLabel: 'Requests/Minute',
    color: '#10b981',
    thresholds: {
      warning: 800,
      critical: 500,
    },
  },
  'error-rate': {
    type: 'line',
    title: 'Error Rate',
    metric: 'api_error_rate',
    yAxisLabel: 'Error Rate (%)',
    color: '#ef4444',
    thresholds: {
      warning: 2,
      critical: 5,
    },
  },
  'database-query-time': {
    type: 'line',
    title: 'Database Query Time',
    metric: 'database_query_time_avg',
    yAxisLabel: 'Query Time (ms)',
    color: '#8b5cf6',
    thresholds: {
      warning: 100,
      critical: 200,
    },
  },
  'frontend-performance': {
    type: 'line',
    title: 'Frontend Performance',
    metric: 'first_contentful_paint',
    yAxisLabel: 'Time (ms)',
    color: '#f59e0b',
    thresholds: {
      warning: 2000,
      critical: 3000,
    },
  },
  'bundle-size': {
    type: 'bar',
    title: 'Bundle Size',
    metric: 'bundle_size',
    yAxisLabel: 'Size (KB)',
    color: '#6366f1',
    target: 500, // 500KB target
  },
  'user-satisfaction': {
    type: 'gauge',
    title: 'User Satisfaction',
    metric: 'user_satisfaction',
    color: '#10b981',
    thresholds: {
      warning: 3,
      critical: 2,
    },
  },
  'feature-usage': {
    type: 'pie',
    title: 'Feature Usage',
    metric: 'feature_usage',
    color: '#f97316',
  },
};

// Dashboard widgets configuration
export const dashboardWidgets: DashboardWidget[] = [
  {
    id: 'api-performance',
    type: 'chart',
    title: 'API Performance',
    config: {
      charts: ['api-response-time', 'api-throughput', 'error-rate'],
      layout: 'grid',
      timeRange: true,
    },
    refreshInterval: 15,
  },
  {
    id: 'database-performance',
    type: 'chart',
    title: 'Database Performance',
    config: {
      charts: ['database-query-time'],
      layout: 'grid',
      timeRange: true,
    },
    refreshInterval: 30,
  },
  {
    id: 'frontend-performance',
    type: 'chart',
    title: 'Frontend Performance',
    config: {
      charts: ['frontend-performance'],
      layout: 'grid',
      timeRange: true,
    },
    refreshInterval: 10,
  },
  {
    id: 'bundle-analysis',
    type: 'chart',
    title: 'Bundle Analysis',
    config: {
      charts: ['bundle-size'],
      layout: 'grid',
      timeRange: false,
    },
    refreshInterval: 60, // Refresh every minute for bundle analysis
  },
  },
  {
    id: 'user-metrics',
    type: 'chart',
    title: 'User Metrics',
    config: {
      charts: ['user-satisfaction', 'feature-usage'],
      layout: 'grid',
      timeRange: true,
    },
    refreshInterval: 60,
  },
  {
    id: 'alerts',
    type: 'alert',
    title: 'Performance Alerts',
    config: {
      maxAlerts: 20,
      autoRefresh: true,
      severityLevels: true,
    },
    refreshInterval: 5, // Refresh every 5 seconds for alerts
  },
  {
    id: 'system-health',
    type: 'metric',
    title: 'System Health',
    config: {
      metrics: ['cpu', 'memory', 'disk', 'uptime'],
      layout: 'vertical',
      refreshInterval: 10,
    },
    refreshInterval: 30,
  },
];

// Dashboard data structure
export interface DashboardData {
  timestamp: number;
  metrics: any;
  charts: Record<string, any>;
  alerts: any[];
  systemHealth: {
    cpu: number;
    memory: number;
    disk: number;
    uptime: number;
  };
}

// Dashboard API endpoints
export const dashboardApiEndpoints = {
  metrics: '/api/dashboard/metrics',
  alerts: '/api/dashboard/alerts',
  charts: '/api/dashboard/charts',
  config: '/api/dashboard/config',
  health: '/api/dashboard/health',
};

// Performance dashboard initialization
export const initializePerformanceDashboard = (config: DashboardConfig = defaultDashboardConfig): void => {
  // Store configuration in environment
  if (typeof window !== 'undefined') {
    (window as any).dashboardConfig = config;
  }

  // Initialize dashboard components
  if (typeof document !== 'undefined') {
    const dashboardContainer = document.getElementById('performance-dashboard');
    if (dashboardContainer) {
      this.renderDashboard(dashboardContainer, config);
    }
  }
};

// Dashboard rendering
export const renderDashboard = (container: HTMLElement, config: DashboardConfig): void => {
  container.innerHTML = `
    <div class="performance-dashboard">
      <header class="dashboard-header">
        <h1>Inbox Zero Performance Dashboard</h1>
        <div class="dashboard-controls">
          <button onclick="refreshDashboard()">Refresh</button>
          <select onchange="changeTimeRange(this.value)">
            <option value="1h">1 Hour</option>
            <option value="6h">6 Hours</option>
            <option value="24h" selected>24 Hours</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
          </select>
        </div>
      </header>
      
      <main class="dashboard-content">
        ${dashboardWidgets.map(widget => this.renderWidget(widget)).join('')}
      </main>
    </div>
    
    <style>
      .performance-dashboard {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f8fafc;
        color: #1f2937;
        margin: 0;
        padding: 20px;
      }
      
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .dashboard-controls {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      
      .dashboard-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }
      
      .dashboard-widget {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      
      .chart-container {
        height: 300px;
      }
    </style>
  `;
};

// Widget rendering
export const renderWidget = (widget: DashboardWidget): string => {
  switch (widget.type) {
    case 'chart':
      return `
        <div class="dashboard-widget" id="${widget.id}">
          <h3>${widget.title}</h3>
          <div class="chart-container">
            <canvas id="${widget.id}-chart"></canvas>
          </div>
        </div>
      `;
    
    case 'alert':
      return `
        <div class="dashboard-widget" id="${widget.id}">
          <h3>${widget.title}</h3>
          <div class="alert-container" id="${widget.id}-alerts">
            <!-- Alerts will be populated here -->
          </div>
        </div>
      `;
    
    case 'metric':
      return `
        <div class="dashboard-widget" id="${widget.id}">
          <h3>${widget.title}</h3>
          <div class="metric-container" id="${widget.id}-metrics">
            <!-- Metrics will be populated here -->
          </div>
        </div>
      `;
    
    default:
      return `
        <div class="dashboard-widget" id="${widget.id}">
          <h3>${widget.title}</h3>
          <div>Unknown widget type: ${widget.type}</div>
        </div>
      `;
  }
};

// Global functions for dashboard interaction
declare global {
  function refreshDashboard(): void;
  function changeTimeRange(range: string): void;
}

export default {
  defaultDashboardConfig,
  dashboardWidgets,
  chartConfigs,
  dashboardApiEndpoints,
  initializePerformanceDashboard,
  renderDashboard,
  renderWidget,
};