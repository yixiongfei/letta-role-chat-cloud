import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import roleRoutes from "./routes/roles";
import messageRoutes from "./routes/messages";
import { initDb } from "./storage/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 路由注册
app.use("/api/roles", roleRoutes);
app.use("/api/messages", messageRoutes);

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 初始化数据库并启动服务器
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to start server due to DB error:", err);
});
