import app from './my-express';
import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

mongoose.connect(process.env.MONGODB_URL as string).then(() => {
  app.listen(process.env.PORT, () => {
    console.log('server is running on port', process.env.PORT);
  });
}).catch((err) => {
  console.log(err);
});