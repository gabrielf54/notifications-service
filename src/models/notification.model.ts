// src/models/notification.model.ts
import { Schema, model, Document } from 'mongoose';

export interface Recipient {
  type: 'phone' | 'email';
  value: string;
}

export interface NotificationContent {
  templateId?: string;
  text?: string;
  subject?: string;
  html?: string;
  parameters?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

export interface NotificationOptions {
  scheduledFor?: Date;
  expiresAt?: Date;
  fallbackChannels?: string[];
  priority?: 'high' | 'normal' | 'low';
  retryCount: number;
  maxRetries: number;
}

export interface StatusHistoryItem {
  status: string;
  timestamp: Date;
  details: string;
}

export interface ProviderResponse {
  messageId: string;
  providerTimestamp: string;
  rawResponse: any;
}

export interface NotificationDocument extends Document {
  recipient: Recipient;
  channel: string;
  provider: string;
  content: NotificationContent;
  status: string;
  statusHistory: StatusHistoryItem[];
  metadata: Record<string, any>;
  options: NotificationOptions;
  providerResponse?: ProviderResponse;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    recipient: {
      type: {
        type: String,
        enum: ['phone', 'email'],
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
    },
    channel: {
      type: String,
      enum: ['sms', 'whatsapp', 'email'],
      required: true,
    },
    provider: {
      type: String,
      required: false,
    },
    content: {
      templateId: {
        type: String,
        required: false,
      },
      text: {
        type: String,
        required: false,
      },
      subject: {
        type: String,
        required: false,
      },
      html: {
        type: String,
        required: false,
      },
      parameters: {
        type: Map,
        of: Schema.Types.Mixed,
        required: false,
      },
      attachments: [
        {
          filename: String,
          content: String,
          contentType: String,
        },
      ],
    },
    status: {
      type: String,
      enum: ['queued', 'scheduled', 'processing', 'sent', 'delivered', 'failed', 'cancelled', 'read'],
      default: 'queued',
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        details: {
          type: String,
          required: false,
        },
      },
    ],
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    options: {
      scheduledFor: {
        type: Date,
        required: false,
      },
      expiresAt: {
        type: Date,
        required: false,
      },
      fallbackChannels: {
        type: [String],
        default: [],
      },
      priority: {
        type: String,
        enum: ['high', 'normal', 'low'],
        default: 'normal',
      },
      retryCount: {
        type: Number,
        default: 0,
      },
      maxRetries: {
        type: Number,
        default: 5,
      },
    },
    providerResponse: {
      messageId: {
        type: String,
        required: false,
      },
      providerTimestamp: {
        type: String,
        required: false,
      },
      rawResponse: {
        type: Schema.Types.Mixed,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhorar a performance das consultas
notificationSchema.index({ 'recipient.value': 1 });
notificationSchema.index({ channel: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ 'options.scheduledFor': 1 });
notificationSchema.index({ createdAt: 1 });

export const NotificationModel = model<NotificationDocument>('Notification', notificationSchema);
