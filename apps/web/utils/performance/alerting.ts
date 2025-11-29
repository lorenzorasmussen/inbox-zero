/**
 * Performance alerting system for Inbox Zero
 * Provides comprehensive alerting with multiple notification channels
 */

import { performanceCollector, Alert, NotificationChannel } from './monitoring';

export interface AlertingConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  thresholds: {
    apiResponseTime: number;
    errorRate: number;
    databaseQueryTime: number;
    frontendPerformance: number;
  };
  escalation: {
    enabled: boolean;
    levels: {
      warning: number;
      critical: number;
    };
    cooldown: number; // minutes between alerts
  };
}

export interface AlertHistory {
  alerts: Alert[];
  lastSent: Record<string, number>;
  cooldowns: Record<string, number>;
}

// Default alerting configuration
export const defaultAlertingConfig: AlertingConfig = {
  enabled: true,
  channels: [
    {
      type: 'email',
      config: {
        recipients: ['devops@inboxzero.com'],
        template: 'performance-alert',
      },
    },
    {
      type: 'slack',
      config: {
        webhook: process.env.SLACK_WEBHOOK_URL,
        channel: '#performance',
        username: 'InboxZero Bot',
      },
    },
  ],
  thresholds: {
    apiResponseTime: 200, // ms
    errorRate: 0.01, // 1%
    databaseQueryTime: 50, // ms
    frontendPerformance: 1500, // ms (FCP)
  },
  escalation: {
    enabled: true,
    levels: {
      warning: 2, // 2 warnings before escalation
      critical: 1, // 1 critical alert before escalation
    },
    cooldown: 5, // 5 minutes between same alert type
  },
};

// Alerting system
class PerformanceAlerting {
  private config: AlertingConfig;
  private history: AlertHistory;
  private static instance: PerformanceAlerting;

  private constructor(config: AlertingConfig = defaultAlertingConfig) {
    this.config = config;
    this.history = {
      alerts: [],
      lastSent: {},
      cooldowns: {},
    };
  }

  public static getInstance(config?: AlertingConfig): PerformanceAlerting {
    if (!PerformanceAlerting.instance) {
      PerformanceAlerting.instance = new PerformanceAlerting(config);
    }
    return PerformanceAlerting.instance;
  }

  // Main alerting method
  async checkAndSendAlerts(): Promise<void> {
    if (!this.config.enabled) return;

    const metrics = performanceCollector.getMetrics();
    const alerts = performanceCollector.analyzePerformance();

    for (const alert of alerts) {
      if (this.shouldSendAlert(alert)) {
        await this.sendAlert(alert);
        this.updateHistory(alert);
      }
    }
  }

  // Check if alert should be sent
  private shouldSendAlert(alert: Alert): boolean {
    const alertKey = `${alert.type}_${alert.metric}`;
    const now = Date.now();

    // Check cooldown
    const lastSent = this.history.lastSent[alertKey];
    if (
      lastSent &&
      now - lastSent < this.config.escalation.cooldown * 60 * 1000
    ) {
      return false;
    }

    // Check escalation levels
    const alertCount = this.getAlertCount(alert.type, alert.metric);
    const escalationLevel = this.config.escalation.levels;

    if (alertCount >= escalationLevel.critical) {
      return true;
    }

    if (alert.severity === 'HIGH' && alertCount >= escalationLevel.warning) {
      return true;
    }

    // Check thresholds
    switch (alert.type) {
      case 'PERFORMANCE_DEGRADATION':
        return alert.value > this.config.thresholds.apiResponseTime;
      case 'HIGH_ERROR_RATE':
        return alert.value > this.config.thresholds.errorRate;
      case 'DATABASE_PERFORMANCE':
        return alert.value > this.config.thresholds.databaseQueryTime;
      case 'FRONTEND_PERFORMANCE':
        return alert.value > this.config.thresholds.frontendPerformance;
      default:
        return true;
    }
  }

  // Send alert through configured channels
  private async sendAlert(alert: Alert): Promise<void> {
    const promises = this.config.channels.map((channel) =>
      this.sendToChannel(alert, channel)
    );
    await Promise.allSettled(promises);
  }

  // Send to specific channel
  private async sendToChannel(
    alert: Alert,
    channel: NotificationChannel
  ): Promise<void> {
    try {
      switch (channel.type) {
        case 'email':
          await this.sendEmailAlert(alert, channel.config);
          break;
        case 'slack':
          await this.sendSlackAlert(alert, channel.config);
          break;
        case 'webhook':
          await this.sendWebhookAlert(alert, channel.config);
          break;
        case 'pagerduty':
          await this.sendPagerDutyAlert(alert, channel.config);
          break;
      }
    } catch (error) {
      console.error(`Failed to send alert to ${channel.type}:`, error);
    }
  }

  // Email alert implementation
  private async sendEmailAlert(alert: Alert, config: any): Promise<void> {
    const { default: fetch } = require('node-fetch');

    const emailContent = this.formatEmailAlert(alert);

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'alerts@inboxzero.com',
        to: config.recipients,
        subject: `Performance Alert: ${alert.type}`,
        html: emailContent,
      }),
    });
  }

  // Slack alert implementation
  private async sendSlackAlert(alert: Alert, config: any): Promise<void> {
    const { default: fetch } = require('node-fetch');

    const slackMessage = this.formatSlackAlert(alert);

    await fetch(config.webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: slackMessage,
        username: config.username,
        channel: config.channel,
        icon_emoji: this.getAlertEmoji(alert.severity),
      }),
    });
  }

  // Webhook alert implementation
  private async sendWebhookAlert(alert: Alert, config: any): Promise<void> {
    const { default: fetch } = require('node-fetch');

    const payload = {
      alert,
      timestamp: new Date().toISOString(),
      service: 'inbox-zero-performance',
    };

    await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'InboxZero-Alerting/1.0',
      },
      body: JSON.stringify(payload),
    });
  }

  // PagerDuty alert implementation
  private async sendPagerDutyAlert(alert: Alert, config: any): Promise<void> {
    const { default: fetch } = require('node-fetch');

    const payload = {
      payload: {
        summary: `${alert.severity}: ${alert.type}`,
        severity: alert.severity.toLowerCase(),
        source: 'inbox-zero-performance',
        details: {
          alert_type: alert.type,
          metric: alert.metric,
          value: alert.value,
          threshold: alert.threshold,
          message: alert.message,
        },
        timestamp: alert.timestamp.toISOString(),
      },
      routing_key: config.routingKey,
    };

    await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token token=${config.apiToken}`,
      },
      body: JSON.stringify(payload),
    });
  }

  // Format alerts for different channels
  private formatEmailAlert(alert: Alert): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #d73027; margin: 0 0 10px 0;">🚨 Performance Alert</h2>
          <div style="background: white; padding: 15px; border-radius: 6px;">
            <p><strong>Alert Type:</strong> ${alert.type}</p>
            <p><strong>Severity:</strong> ${alert.severity}</p>
            <p><strong>Metric:</strong> ${alert.metric}</p>
            <p><strong>Value:</strong> ${alert.value}</p>
            <p><strong>Threshold:</strong> ${alert.threshold}</p>
            ${alert.message ? `<p><strong>Message:</strong> ${alert.message}</p>` : ''}
            <p><strong>Time:</strong> ${alert.timestamp.toISOString()}</p>
          </div>
        </div>
      </div>
    `;
  }

  private formatSlackAlert(alert: Alert): string {
    const emoji = this.getAlertEmoji(alert.severity);
    const color = this.getAlertColor(alert.severity);

    return (
      `${emoji} *Performance Alert: ${alert.type}*\n` +
      `*Severity:* ${alert.severity}\n` +
      `*Metric:* ${alert.metric}\n` +
      `*Value:* ${alert.value}\n` +
      `*Threshold:* ${alert.threshold}\n` +
      `${alert.message ? `*Message:* ${alert.message}\n` : ''}` +
      `*Time:* ${alert.timestamp.toISOString()}`
    );
  }

  private getAlertEmoji(severity: string): string {
    switch (severity) {
      case 'CRITICAL':
        return '🚨';
      case 'HIGH':
        return '⚠️';
      case 'MEDIUM':
        return '⚡';
      case 'LOW':
        return 'ℹ️';
      default:
        return '📊';
    }
  }

  private getAlertColor(severity: string): string {
    switch (severity) {
      case 'CRITICAL':
        return '#ff0000';
      case 'HIGH':
        return '#ff9900';
      case 'MEDIUM':
        return '#ffcc00';
      case 'LOW':
        return '#36a64f';
      default:
        return '#36a64f';
    }
  }

  // History management
  private updateHistory(alert: Alert): void {
    const alertKey = `${alert.type}_${alert.metric}`;
    const now = Date.now();

    // Update last sent time
    this.history.lastSent[alertKey] = now;

    // Add to alerts history
    this.history.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.history.alerts.length > 100) {
      this.history.alerts = this.history.alerts.slice(-100);
    }
  }

  // Alert count for escalation
  private getAlertCount(type: string, metric: string): number {
    return this.history.alerts.filter(
      (alert) => alert.type === type && alert.metric === metric
    ).length;
  }

  // Get alert history
  getAlertHistory(): AlertHistory {
    return this.history;
  }

  // Clear alert history
  clearHistory(): void {
    this.history = {
      alerts: [],
      lastSent: {},
      cooldowns: {},
    };
  }
}

// Initialize alerting system
export const alerting = PerformanceAlerting.getInstance();

// Export alerting utilities
export const setupAlerting = (config?: AlertingConfig): void => {
  if (config) {
    PerformanceAlerting.getInstance(config);
  }

  // Start alerting check interval
  setInterval(async () => {
    await alerting.checkAndSendAlerts();
  }, 60000); // Every minute
};

export default PerformanceAlerting;
