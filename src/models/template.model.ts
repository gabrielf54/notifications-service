// src/models/template.model.ts
import { Schema, model, Document } from 'mongoose';

export interface TemplateVersion {
  versionId: string;
  channel: string;
  subject?: string;
  content: string;
  parameters: string[];
  active: boolean;
  createdAt: Date;
}

export interface TemplateDocument extends Document {
  name: string;
  displayName: string;
  description: string;
  versions: TemplateVersion[];
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const templateSchema = new Schema<TemplateDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    versions: [
      {
        versionId: {
          type: String,
          required: true,
        },
        channel: {
          type: String,
          enum: ['sms', 'whatsapp', 'email'],
          required: true,
        },
        subject: {
          type: String,
          required: false,
        },
        content: {
          type: String,
          required: true,
        },
        parameters: {
          type: [String],
          default: [],
        },
        active: {
          type: Boolean,
          default: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    category: {
      type: String,
      enum: ['transactional', 'marketing', 'alerts', 'system'],
      default: 'transactional',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhorar a performance das consultas
templateSchema.index({ name: 1 }, { unique: true });
templateSchema.index({ category: 1 });
templateSchema.index({ tags: 1 });

export const TemplateModel = model<TemplateDocument>('Template', templateSchema);
