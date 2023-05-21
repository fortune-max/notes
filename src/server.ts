import app from './my-express';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { DEFAULT_PORT } from './constants';

config();
const port = process.env.PORT || DEFAULT_PORT;

mongoose.connect(process.env.MONGODB_URL as string).then(() => {
  app.listen(port, () => {
    console.log('server is running on port', port);
  });
}).catch((err) => {
  console.log(err);
});
