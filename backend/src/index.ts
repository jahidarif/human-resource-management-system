import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:5173', // your Vite frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));