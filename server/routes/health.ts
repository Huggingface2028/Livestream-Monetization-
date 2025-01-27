import { redisClient } from "../database/redis";

const express = require('express');
const router = express.Router();

router.get('/health/redis', async (req, res) => {
  try {
    const ping = await redisClient.ping();
    const memory = await redisClient.info('memory');
    
    res.json({
      status: ping === 'PONG' ? 'healthy' : 'degraded',
      memory: memory.split('\r\n')[1],
      connections: await redisClient.client('LIST')
    });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy' });
  }
});
