import { Application } from '../application.ts';
import { GlobalModules } from './app-modules.ts';

const app: Application = new Application({ modules: [GlobalModules] });

const PORT = 8001;

await app.run(PORT);
