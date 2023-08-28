import { Pool } from "pg";
import { RedisClientType } from "redis";

export type Vars = {
    db: Pool;
    redis: RedisClientType;
};