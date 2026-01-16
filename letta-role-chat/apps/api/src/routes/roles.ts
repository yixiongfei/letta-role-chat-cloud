import { Router } from 'express';
import { agentService } from '../letta/agent.service';

const router = Router();

router.get('/', async (req, res) => {
  const roles = await agentService.listRoles();
  res.json(roles);
});

router.post('/', async (req, res) => {
  const { name, persona, human } = req.body;
  const role = await agentService.createRole(name, persona, human);
  res.status(201).json(role);
});

export default router;
