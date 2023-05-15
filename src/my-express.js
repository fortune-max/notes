import express from 'express';

const app = express();

app.all('*', (req, res) => {
  res.status(404).send('Not Found!\n');
});

export default app;
