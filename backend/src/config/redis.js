const { createClient } = require('redis');

let redisClient;
let redisAvailable = false;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: { reconnectStrategy: false }  // don't keep retrying
    });
    redisClient.on('error', () => {});  // silence all errors
    await redisClient.connect();
    redisAvailable = true;
    console.log('✅ Redis Connected');
  } catch {
    console.log('⚠️  Redis unavailable — caching disabled (app works fine without it)');
  }
};

const getCache = async (key) => {
  if (!redisAvailable || !redisClient?.isOpen) return null;
  try { const d = await redisClient.get(key); return d ? JSON.parse(d) : null; }
  catch { return null; }
};

const setCache = async (key, data, ttl = 300) => {
  if (!redisAvailable || !redisClient?.isOpen) return;
  try { await redisClient.setEx(key, ttl, JSON.stringify(data)); } catch {}
};

const deleteCache = async (key) => {
  if (!redisAvailable || !redisClient?.isOpen) return;
  try { await redisClient.del(key); } catch {}
};

const deleteCachePattern = async (pattern) => {
  if (!redisAvailable || !redisClient?.isOpen) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) await redisClient.del(keys);
  } catch {}
};

module.exports = connectRedis;
module.exports.connectRedis = connectRedis;
module.exports.getCache = getCache;
module.exports.setCache = setCache;
module.exports.deleteCache = deleteCache;
module.exports.deleteCachePattern = deleteCachePattern;