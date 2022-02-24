import { Logger } from 'pino';
import { KNNAlgorithm } from '../algorithms/knn';
import { KMeansAlgorithm } from '../algorithms/k-means';
import { runBayesAlgorithm } from './bayes-runner';

export const runAlgorithms = (logger: Logger): void => {
  runKMeansAlgorithm(logger.child({ name: 'K-means algorithm' }));
  runKNNAlgorithm(logger.child({ name: 'K-NN algorithm' }));

  runBayesAlgorithm(logger.child({ name: 'Bayes algorithm' }));
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
    logger.info({ [key]: result[key] });
  });
  logger.info('=====================  END K-MEANS  =======================');
};

export const runKNNAlgorithm = (logger: Logger) => {
  const labels: string[] = ['Male', 'Female'];
  const testData: { data: number[][]; labels: string[] } = {
    data: [],
    labels: [],
  };

  for (let i = 0; i < 1000; i++) {
    testData.data.push([
      Math.floor(Math.random() * (220 - 150 + 1) + 150),
      Math.floor(Math.random() * (120 - 55 + 1) + 55),
    ]);

    testData.labels.push(labels[0]);
  }

  for (let i = 0; i < 1000; i++) {
    testData.data.push([
      Math.floor(Math.random() * (185 - 140 + 1) + 140),
      Math.floor(Math.random() * (100 - 45 + 1) + 45),
    ]);

    testData.labels.push(labels[1]);
  }

  logger.info('===================  START KNN  =======================');

  const knn = new KNNAlgorithm(3, testData.data, testData.labels);

  logger.info('Process result:');
  const firstResult = knn.predict([181, 65]);
  const secondResult = knn.predict([161, 58]);
  logger.info('-------------  FIRST RESULT -------------------------- ');
  Object.keys(firstResult).forEach((key) => {
    logger.info({ [key]: firstResult[key] });
  });

  logger.info('-------------  SECOND RESULT -------------------------- ');
  Object.keys(secondResult).forEach((key) => {
    logger.info({ [key]: firstResult[key] });
  });

  logger.info('===================  END KNN  =======================');
};
