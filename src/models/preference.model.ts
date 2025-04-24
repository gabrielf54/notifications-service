// src/models/preference.model.ts
import { Schema, model, Document } from 'mongoose';

export interface ChannelPreference {
  enabled: boolean;
  value: string;
  verified: boolean;
  priority: number;
}

export interface NotificationPreferences {
  allowedTimeStart: string;
  allowedTimeEnd: string;
  timezone: string;
  categories: {
    marketing: boolean;
    transactional: boolean;
    alerts: boolean;
  };
  frequency: {
    maxPerDay: number;
    maxPerWeek: number;
  };
}

export interface PreferenceDocument extends Document {
  userId: string;
  channels: {
    sms?: ChannelPreference;
    email?: ChannelPreference;
    whatsapp?: ChannelPreference;
  };
  preferences: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const preferenceSchema = new Schema<PreferenceDocument>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    channels: {
      sms: {
        enabled: {
          type: Boolean,
          default: false,
        },
        value: {
          type: String,
          required: false,
        },
        verified: {
          type: Boolean,
          default: false,
        },
        priority: {
          type: Number,
          default: 2,
        },
      },
      email: {
        enabled: {
          type: Boolean,
          default: false,
        },
        value: {
          type: String,
          required: false,
        },
        verified: {
          type: Boolean,
          default: false,
        },
        priority: {
          type: Number,
          default: 1,
        },
      },
      whatsapp: {
        enabled: {
          type: Boolean,
          default: false,
        },
        value: {
          type: String,
          required: false,
        },
        verified: {
          type: Boolean,
          default: false,
        },
        priority: {
          type: Number,
          default: 0,
        },
      },
    },
    preferences: {
      allowedTimeStart: {
        type: String,
        default: '08:00',
      },
      allowedTimeEnd: {
        type: String,
        default: '22:00',
      },
      timezone: {
        type: String,
        default: 'America/Sao_Paulo',
      },
      categories: {
        marketing: {
          type: Boolean,
          default: false,
        },
        transactional: {
          type: Boolean,
          default: true,
        },
        alerts: {
          type: Boolean,
          default: true,
        },
      },
      frequency: {
        maxPerDay: {
          type: Number,
          default: 5,
        },
        maxPerWeek: {
          type: Number,
          default: 20,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhorar a performance das consultas
preferenceSchema.index({ userId: 1 }, { unique: true });
preferenceSchema.index({ 'channels.sms.value': 1 });
preferenceSchema.index({ 'channels.email.value': 1 });
preferenceSchema.index({ 'channels.whatsapp.value': 1 });

export const PreferenceModel = model<PreferenceDocument>('Preference', preferenceSchema);
