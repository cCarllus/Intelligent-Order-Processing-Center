import { env } from '../config/env';
import { createDatabaseConnection } from './createConnection';

export const db = createDatabaseConnection(env.databasePath);
