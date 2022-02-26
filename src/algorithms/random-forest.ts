import * as IrisDataset from 'ml-dataset-iris';
import {
  RandomForestBaseOptions,
  RandomForestClassifier,
} from 'ml-random-forest';
import { Logger } from 'pino';
import { kFold } from 'ml-cross-validation';
import { calculateLoss } from './svm';

const irisData = IrisDataset.getNumbers();
const irisLabels = IrisDataset.getClasses().map((element: string) =>
  IrisDataset.getDistinctClasses().indexOf(element),
);

const rfOptions: Partial<RandomForestBaseOptions> = {
  maxFeatures: 3,
  replacement: true,
  nEstimators: 100,
  useSampleBagging: true,
};

export const runRandomForest = (logger: Logger) => {
  logger.info(
    '===================== RANDOM FOREST ALGORITHM START =======================',
  );

  const rf = new RandomForestClassifier(rfOptions);

  rf.train(irisData, irisLabels);

  const predictions: number[] = rf.predict(irisData);

  const confusionMatrix = kFold(
    RandomForestClassifier,
    irisData,
    irisLabels,
    rfOptions,
    10,
  );

  const accuracy: number = confusionMatrix.getAccuracy();

  logger.info('Predictions');
  logger.info({ predictions: predictions.join(',') });

  logger.info(
    `Loss for predictions: ${Math.round(
      calculateLoss(irisLabels, predictions) * 100,
    )}%`,
  );

  logger.info(
    `Loss for predictions after cross validation ${Math.round(
      (1 - accuracy) * 100,
    )}%`,
  );

  logger.info({ confusionMatrix: confusionMatrix });

  logger.info(
    '===================== RANDOM FOREST ALGORITHM END =======================',
  );
};
