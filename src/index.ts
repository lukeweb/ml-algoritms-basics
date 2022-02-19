import pino, { Logger } from 'pino';

const logger: Logger = pino({ name: 'Main', level: 'debug' });

(async () => {
  try {
    logger.info('Starting ML training application... 👋');
  } catch (err) {
    logger.error(err);
    process.nextTick(() => process.exit(1));
  }
})();
