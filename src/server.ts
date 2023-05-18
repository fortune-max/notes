import app from './my-express';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { DEFAULT_PORT } from './constants';

config();

mongoose.connect(process.env.MONGODB_URL as string).then(() => {
  app.listen(DEFAULT_PORT, () => {
    console.log('server is running on port', DEFAULT_PORT);
  });
}).catch((err) => {
  console.log(err);
});