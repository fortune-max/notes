import { model, Schema } from "mongoose";

// Define schema for User
export const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

// Export the model
export const User = model('User', UserSchema);
