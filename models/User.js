import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    googleProviderId: {
      type: String,
      required: true, 
      unique: true,
    },
    isTooltip: {
      type: Boolean,
      default: true, 
    },
    totalImages: {
      type:Number,
      default:0,
      index: true
    },
  },
  {
    timestamps: true, 
  }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
