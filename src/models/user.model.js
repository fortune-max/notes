import { model, Schema } from "mongoose";

// Define schema for User
export const UserSchema = new Schema({
  username: { type: String, unique: true },
  password: String,
});

// Export the model
export const User = model('User', UserSchema);
