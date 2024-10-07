import express, { Application } from 'express';
import cors from 'cors';
import notFound from './app/middleware/notFound';
import router from './app/routes';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middleware/globalErrorHandlear';
const app: Application = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  }),
);

app.use('/api/v1', router);

app.get('/test', async (req, res) => {
  const a = 'Server Running SuccessFully';
  res.send(a);
});

app.use(globalErrorHandler);
app.use('*', notFound);

export default app;