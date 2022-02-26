import pino, { Logger } from 'pino';
import { runAlgorithms } from './services/run-algorithms';

const logger: Logger = pino({ name: 'Main', level: 'debug' });

(async () => {
  try {
    logger.info('Starting ML training application... 👋');
    await runAlgorithms(logger);
  } catch (err) {
    logger.error(err);
    process.nextTick(() => process.exit(1));
  }
})();
