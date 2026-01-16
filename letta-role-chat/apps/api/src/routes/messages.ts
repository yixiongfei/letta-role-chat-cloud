
import { Router } from "express";
import { messageService } from "../letta/message.service";
import { store } from "../storage/memoryStore";

const router = Router();

// POST /api/messages/:roleId
router.post("/:roleId", async (req, res) => {
  const { roleId } = req.params;
  const { message } = req.body;

  const role = store.getRole(roleId);
  if (!role?.agentId) {
    return res.status(404).json({ error: "Role or Agent not found" });
  }

  // ✅ v0.x LettaClient：走 agent 级 streaming（不使用 conversations）
  await messageService.sendMessageStream(role.agentId, message, res);
});

export default router;
``
