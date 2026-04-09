import { env } from './config/env';
import { app } from './app';

app.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
});
