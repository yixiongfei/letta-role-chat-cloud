import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rolesRoutes  from './routes/roles';
import messageRoutes from './routes/messages';
import { lettaClient } from "./letta/client";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 路由注册
app.use('/api/roles', rolesRoutes);
app.use('/api/messages', messageRoutes);

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("messages keys:", Object.keys((lettaClient as any).agents.messages));
});
