import Redis from 'ioredis';
require('dotenv').config();

const redisClient = (): Redis => {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
        console.log("Redis connected");
        return new Redis(redisUrl);
    }
    throw new Error("Redis URL not provided");
};

export const redis = redisClient();
