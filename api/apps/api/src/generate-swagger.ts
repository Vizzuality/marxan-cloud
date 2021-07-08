import { writeFileSync } from 'fs';
import { addSwagger } from './add-swagger';
import { bootstrapSetUp } from './bootstrap-app';

export async function generateSwagger() {
  const app = await bootstrapSetUp();
  const swaggerDocument = addSwagger(app);
  writeFileSync('./swagger.json', JSON.stringify(swaggerDocument));
}
generateSwagger();
