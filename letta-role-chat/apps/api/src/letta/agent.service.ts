import { lettaClient } from "./client";
import pool from "../storage/db";
import { v4 as uuidv4 } from "uuid";

export const agentService = {
  // 从 Letta Cloud 同步 Agent 数据到本地数据库
  async syncFromCloud() {
    try {
      const cloudAgents = await lettaClient.agents.list();
      
      for (const agent of cloudAgents) {
        // 提取 persona 和 human
        const persona = agent.memoryBlocks?.find(b => b.label === 'persona')?.value || '';
        const human = agent.memoryBlocks?.find(b => b.label === 'human')?.value || '';

        // 检查本地是否已存在
        const [rows]: any = await pool.query('SELECT id FROM agents WHERE agent_id = ?', [agent.id]);
        
        if (rows.length === 0) {
          // 如果不存在，则插入
          await pool.query(
            'INSERT INTO agents (id, name, persona, human, agent_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [uuidv4(), agent.name, persona, human, agent.id, Date.now()]
          );
        } else {
          // 如果已存在，则更新
          await pool.query(
            'UPDATE agents SET name = ?, persona = ?, human = ? WHERE agent_id = ?',
            [agent.name, persona, human, agent.id]
          );
        }
      }
      return { success: true, count: cloudAgents.length };
    } catch (error) {
      console.error('Sync from cloud failed:', error);
      throw error;
    }
  },

  async createRole(name: string, persona: string, human: string) {
    // 1) 在 Letta Cloud 创建 agent
    const agent = await lettaClient.agents.create({
      name,
      memoryBlocks: [
        { label: "persona", value: persona },
        { label: "human", value: human },
      ],
      model: "openai/gpt-4o-mini",
      embedding: "openai/text-embedding-3-small",
    });

    // 2) 保存到 MySQL 数据库
    const id = uuidv4();
    const createdAt = Date.now();
    await pool.query(
      'INSERT INTO agents (id, name, persona, human, agent_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, persona, human, agent.id, createdAt]
    );

    return {
      id,
      name,
      persona,
      human,
      agentId: agent.id,
      createdAt,
    };
  },

  async listRoles() {
    const [rows]: any = await pool.query('SELECT * FROM agents ORDER BY created_at DESC');
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      persona: row.persona,
      human: row.human,
      agentId: row.agent_id,
      createdAt: row.created_at
    }));
  },

  async getRole(id: string) {
    const [rows]: any = await pool.query('SELECT * FROM agents WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      persona: row.persona,
      human: row.human,
      agentId: row.agent_id,
      createdAt: row.created_at
    };
  },
};
