import { SVM } from 'libsvm-ts';
import * as IrisDataset from 'ml-dataset-iris';
import { Logger } from 'pino';

const irisData = IrisDataset.getNumbers();
const irisLabels = IrisDataset.getClasses().map((element: string) =>
  IrisDataset.getDistinctClasses().indexOf(element),
);

const calculateLoss = (expected: number[], actual: number[]): number => {
  let incorrect = 0;

  for (let i = 0; i < expected.length; i++) {
    if (expected[i] !== actual[i]) incorrect++;
  }

  return incorrect / expected.length;
};

export const runSVM = async (logger: Logger): Promise<void> => {
  logger.info('==================  START SVM ALGORITHM  =================');

  const svm = new SVM({
    kernel: 'RBF',
    type: 'C_SVC',
    gamma: 0.5,
    cost: 1,
    quiet: true,
  });

  const svmLoaded = await svm.loadWASM();

  svmLoaded.train({ samples: irisData, labels: irisLabels });

  const svmPredictions = svm.predict({ samples: irisData });
  const svmCvPredictions = svm.crossValidation({
    samples: irisData,
    labels: irisLabels,
    kFold: 5,
  });

  logger.info(
    `Loss for predictions: ${
      Math.round(calculateLoss(irisLabels, svmPredictions)) * 100
    }%`,
  );
  logger.info(
    `Loss for predictions after cross checking: ${
      Math.round(calculateLoss(irisLabels, svmCvPredictions as number[])) * 100
    }%`,
  );

  logger.info('==================  END SVM ALGORITHM  =================');
};
