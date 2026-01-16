
import { lettaClient } from "./client";
import { store } from "../storage/memoryStore";

export const agentService = {
  /**
   * 创建角色（Role）= 创建 Letta Agent，并把 persona/human 写入 memoryBlocks
   */
  async createRole(name: string, persona: string, human: string) {
    // 1) 先在本地 store 创建 role（得到 roleId）
    const role = store.createRole({ name, persona, human });

    // 2) 在 Letta Cloud 创建 agent（v0.x：memoryBlocks）
    const agent = await lettaClient.agents.create({
      name,
      // ✅ v0.x 用 memoryBlocks，不是 memory
      memoryBlocks: [
        { label: "persona", value: persona },
        { label: "human", value: human },
      ],
      // ✅ 使用 Letta 文档/示例中的 model handle 风格
      model: "openai/gpt-4o-mini",
      // ✅ 建议指定 embedding（示例中也指定了 embedding）
      embedding: "openai/text-embedding-3-small",
    });

    // 3) 回填 agentId（后续发消息/创建 conversation 需要）
    store.updateRole(role.id, { agentId: agent.id });

    // 4) 返回更新后的 role
    return store.getRole(role.id)!;
  },

  async listRoles() {
    return store.listRoles();
  },

  async getRole(id: string) {
    return store.getRole(id);
  },
};
