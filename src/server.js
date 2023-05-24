import app from './my-express.js';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { DEFAULT_PORT } from './constants.js';

config();

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  app.listen(DEFAULT_PORT, () => {
    console.log('server is running on port', DEFAULT_PORT);
  });
}).catch((err) => {
  console.log(err);
});