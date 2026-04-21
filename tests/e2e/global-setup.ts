import { config } from 'dotenv';

async function globalSetup() {
  config({ path: '.env.local' });
}

export default globalSetup;
