import { isArray } from 'lodash';
import { Logger } from 'pino';
import { KMeansAlgorithm } from '../algorithms/k-means';

export const runAlgorithms = (logger: Logger): void => {
  runKMeansAlgorithm(logger.child({ name: 'K-means algorithm' }));
};

export const runKMeansAlgorithm = (logger: Logger): void => {
  const test2Dimensional = [
    [1, 4],
    [6, 7],
    [18, 9],
    [10, 19],
    [2, 7],
    [10, 0],
    [2, 6],
    [8, 13],
    [11, 5],
  ];

  logger.info('===================  START K-MEANS  =======================');

  const kMeans = new KMeansAlgorithm(3, test2Dimensional);
  const result = kMeans.solve();

  logger.info('Process result:');
  Object.keys(result).forEach((key: string) => {
    if (isArray(result[key])) {
      logger.info(`${key}:`);
      result[key].map((record: number, index: number) =>
        logger.info(`${index + 1}:[${record}]`),
      );
    } else {
      logger.info(`${key}: ${result[key]}`);
    }
  });
  logger.info('=====================  END K-MEANS  =======================');
};
