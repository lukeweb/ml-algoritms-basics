import { simpleTokenizer } from '../helpers';
import { BayesClassifier } from '../algorithms/bayes-classifier';
import { Logger } from 'pino';
import { parse } from 'csv-parse';
import { createReadStream, readFile, promises } from 'fs';
import * as path from 'path';

export const runBayesAlgorithm = async (logger: Logger): Promise<void> => {
  const classifier = new BayesClassifier(simpleTokenizer);
  logger.info('=============== BAYES ALGORITHM START ===================');
  logger.info('Training the algorithm');
  const learningFilePath = path.resolve(
    __dirname,
    '../../datasets/IMDB_review_dataset.csv',
  );

  await trainer(learningFilePath, classifier, logger);

  const positiveTestData = await createTestDataFromFiles(
    path.resolve(__dirname, '../../datatests/bayes/pos'),
  );

  const negativeTestData = await createTestDataFromFiles(
    path.resolve(__dirname, '../../datatests/bayes/neg'),
  );

  if (positiveTestData.length > 0 && negativeTestData.length > 0) {
    logger.info('Data for bayes tester created successfully');
  }

  const positiveResult = tester(positiveTestData, classifier, 'positive', logger);
  logger.info(`Positive label testing result:`)
  logger.info(positiveResult);

  const negativeResult = tester(negativeTestData, classifier, 'negative', logger);
  logger.info(`Negative label testing result:`)
  logger.info(negativeResult);

  const result = [
    positiveResult,
    negativeResult,
  ].reduce(
    (object, item) => ({
      total: object.total + item.total,
      correct: object.correct + item.correct,
    }),
    { total: 0, correct: 0 },
  );

  logger.info('Total testing result:');
  logger.info({ result });

  const pct: string = `${((100 * result.correct) / result.total).toFixed(2)}%`;

  logger.info('Test precision: ' + pct);

  logger.info('=============== BAYES ALGORITHM END ===================');
};

export const trainer = (
  filePath: string,
  classifier: BayesClassifier,
  logger: Logger,
): Promise<void> => {
  const parser = parse({
    delimiter: ',',
    columns: true,
  });

  return new Promise<void>((resolve) => {
    createReadStream(filePath)
      .pipe(parser)
      .on('data', (data: { [p: string]: string }[]) => {
        const keys = Object.keys(data);
        classifier.train(data[keys[1]], data[keys[0]]);
      })
      .on('end', () => {
        logger.info('Algorithm finished training');
        resolve();
      });
  });
};

export const tester = (
  data: string[],
  classifier: BayesClassifier,
  label: string,
  logger: Logger,
): { total: number; correct: number } => {
  let total: number = 0;
  let correct: number = 0;

  logger.info(`Testing sample reviews.... for label: ${label}`);

  data.forEach((record: string) => {
    const prediction = classifier.predict(record);
    total++;
    if (prediction.label === label) correct++;
  });

  return { total, correct };
};

const createTestDataFromFiles = async (
  filesPath: string,
): Promise<string[]> => {
  const fileNames = await readFileNamesFromDir(filesPath);
  const promises = fileNames.map((name: string) =>
    readFileByName(filesPath, name),
  );

  return Promise.all(promises);
};

const readFileNamesFromDir = async (filesPath: string): Promise<string[]> =>
  await promises.readdir(filesPath);

const readFileByName = (
  filePath: string,
  filename: string,
): Promise<string> => {
  return new Promise<string>((resolve) => {
    readFile(`${filePath}/${filename}`, (_, data) => {
      resolve(data.toString());
    });
  });
};
