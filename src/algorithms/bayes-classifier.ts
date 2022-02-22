import { simpleTokenizer } from '../helpers';

export class BayesClassifier implements BayesClassifierInterface {
  private database: BayesDatabase;

  constructor(private tokenizer?: (p: string) => string[]) {
    this.database = {
      labels: {},
      tokens: {},
    };

    this.tokenizer = tokenizer !== null ? tokenizer : simpleTokenizer;
  }

  /**
   * For passed text input, method predict to which category it will belong to.
   *
   * @param text
   * @returns Prediction
   */
  predict(text: string): Prediction {
    const probabilities: LabelProbability[] =
      this.calculateAllLabelProbabilities(text);
    const best: LabelProbability = probabilities[0];

    return {
      label: best.label,
      probability: best.probability,
      probabilities,
    };
  }

  /**
   * Calculates probability for every label in the input text.
   * First element of returned array is the element with the highest probability.
   *
   * @param text string
   * @returns LabelProbability[]
   */
  calculateAllLabelProbabilities(text: string): LabelProbability[] {
    const tokens: string[] = this.tokenizer(text);
    return this.getAllLabels()
      .map((label: string) => ({
        label,
        probability: this.calculateLabelProbability(label, tokens),
      }))
      .sort((a, b) => (a.probability > b.probability ? -1 : 1));
  }

  /**
   * Based on the document divided to tokens, method calculates probability that
   * given document has passed label.
   *
   * @param label
   * @param tokens
   * @returns number
   */
  calculateLabelProbability(label: string, tokens: string[]): number {
    const probLabel: number = 1 / this.getAllLabels().length;
    const epsilon = 0.15;

    const tokenScores: number[] = tokens
      .map((token) => this.calculateTokenScore(token, label))
      .filter((score: number) => Math.abs(probLabel - score) > epsilon);

    const logSum: number = tokenScores.reduce(
      (sum: number, score: number) =>
        sum + Math.log(1 - score) - Math.log(score),
      0,
    );
    const probability: number = 1 / (1 + Math.exp(logSum));

    return probability;
  }

  /**
   * Method calculates the probability that document will have given label
   * if given token is present in it based on passed token and label.
   *
   * @param token
   * @param label
   * @returns number
   */
  calculateTokenScore(token: string, label: string): number {
    const rareTokenWeight = 3;

    const totalDocumentCount: number = this.getLabelDocumentCount();
    const labelDocumentCount: number = this.getLabelDocumentCount(label);
    const notLabelDocumentCount: number =
      totalDocumentCount - labelDocumentCount;

    const probLabel: number = 1 / this.getAllLabels().length;
    const probNotLabel: number = 1 - probLabel;

    const tokenLabelCount: number = this.getTokenCount(token, label);
    const tokenTotalCount: number = this.getTokenCount(token);
    const tokenNotLabelCount: number = tokenTotalCount - tokenLabelCount;

    const probTokenGivenLabel: number = tokenLabelCount / labelDocumentCount;
    const probTokenGivenNotLabel: number =
      tokenNotLabelCount / notLabelDocumentCount;
    const probTokenLabelSupport: number = probTokenGivenLabel * probLabel;
    const probTokenNotLabelSupport: number =
      probTokenGivenNotLabel * probNotLabel;

    const rawWordScore: number =
      probTokenLabelSupport /
      (probTokenLabelSupport + probTokenNotLabelSupport);

    const s: number = rareTokenWeight;
    const n: number = tokenTotalCount;

    const adjustedTokenScore: number =
      (s * probLabel + (n + (rawWordScore || probLabel))) / (s + n);

    return adjustedTokenScore;
  }

  /**
   * Returns all labels found during the learning process.
   *
   * @returns string[]
   */
  getAllLabels(): string[] {
    return Object.keys(this.database.labels);
  }

  /**
   * Increments of all documents for the given category.
   *
   * @param label
   */
  incrementLabelDocumentCount(label: string): void {
    this.database.labels[label] = this.getLabelDocumentCount(label) + 1;
  }

  /**
   * Return number registered for the given category.
   * If label is null it returns number of all used documents for learning.
   *
   * @param label
   * @returns number
   */
  getLabelDocumentCount(label?: string): number {
    return label
      ? this.database.labels[label] || 0
      : Object.values(this.database.labels).reduce(
          (sum: number, count: number) => sum + count,
          0,
        );
  }

  /**
   * Increments number of token occurrences for the given label.
   *
   * @param token
   * @param label
   * @returns number
   */
  incrementTokenCount(token: string, label: string): number {
    if (typeof this.database.tokens[token] === 'undefined') {
      this.database.tokens[token] = {};
    }

    return (this.database.tokens[token][label] =
      this.getTokenCount(token, label) + 1);
  }

  /**
   * Returns number of occurrences passed token for the given label.
   * If no label was passed, returns how many times token showed in data collection for learning.
   *
   * @param token
   * @param label
   * @returns number
   */
  getTokenCount(token: string, label?: string): number {
    return label
      ? (this.database.tokens[token] || {})[label] || 0
      : Object.values(this.database.tokens[token] || {}).reduce(
          (sum: number, count: number) => sum + count,
          0,
        );
  }
}

export interface BayesClassifierInterface {
  predict(text: string): Prediction;
  calculateAllLabelProbabilities(text: string): LabelProbability[];
  calculateLabelProbability(label: string, tokens: string[]): number;
  calculateTokenScore(token: string, label: string): number;
  getAllLabels(): string[];
  incrementLabelDocumentCount(label: string): void;
  getLabelDocumentCount(label?: string): number;
  incrementTokenCount(token: string, label: string): number;
  getTokenCount(token: string, label?: string): number;
}

export interface BayesDatabase {
  labels: Label;
  tokens: Token;
}

export interface Token {
  [p: string]: unknown;
}

export interface Label {
  [p: string]: number;
}

export interface Prediction {
  label: string;
  probability: number;
  probabilities: LabelProbability[];
}

export interface LabelProbability {
  label: string;
  probability: number;
}
