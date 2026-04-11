import { env } from './config/env';
import { createApp } from './app';

const app = createApp();

app.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
});
