import mongoose from 'mongoose';

const PromptItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['vqa', 'grounding', 'captioning'],
    required: true,
  },
  prompt: {
    type: String,
    required: true,
    trim: true,
  },
  order: {
    type: Number,
    required: true, 
  },
});

const RoutineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    prompts: [PromptItemSchema], 
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0, 
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
RoutineSchema.index({ user: 1, isActive: 1 });
RoutineSchema.index({ user: 1, lastUsedAt: -1 });
RoutineSchema.methods.recordUsage = function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

export default mongoose.models.Routine || mongoose.model('Routine', RoutineSchema);
