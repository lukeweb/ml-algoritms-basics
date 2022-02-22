import { distance } from '../helpers';

export class KNNAlgorithm implements KNNInterface {
  constructor(
    private k: number,
    private data: number[][],
    private labels: string[],
  ) {
    this.k = k;
    this.data = data;
    this.labels = labels;
  }

  /**
   * Method runs algorithm and choses element from the map that got highest number of votes
   * 
   * @param point number[]
   * @returns Prediction
   */
  predict(point: number[]): Prediction {
    const map: MapRecord[] = this.generateDistanceMap(point);
    const votes: MapRecord[] = map.slice(0, this.k);
    const voteCounts: VoteCounts = votes.reduce(
      (obj: unknown, vote: MapRecord) =>
        Object.assign({}, obj, { [vote.label]: (obj[vote.label] || 0) + 1 }),
      {},
    );

    const sortedVotes: Vote[] = Object.keys(voteCounts)
      .map((label: string) => ({ label, count: voteCounts[label] }))
      .sort((a, b) => (a.count > b.count ? -1 : 1));

    return {
      label: sortedVotes[0].label,
      voteCounts,
      votes,
    };
  }

  /**
   * Method finds closest element to given element by calculating distance between them
   * and pushes it to map array with its label.
   * Generated map can hold k elements (k is passed as constructor param) for more efficient work
   * on big sets of data.
   * 
   * @param point number[]
   * @returns map MapRecord[]
   */
  generateDistanceMap(point: number[]): MapRecord[] {
    const map: MapRecord[] = [];
    let maxDistanceInMap: number;

    for (let index = 0, len = this.data.length; index < len; index++) {
      const otherPoint: number[] = this.data[index];
      const otherPointLabel: string = this.labels[index];
      const thisDistance: number = distance(point, otherPoint);

      if (!maxDistanceInMap || thisDistance < maxDistanceInMap) {
        map.push({
          index,
          distance: thisDistance,
          label: otherPointLabel,
        });
      }

      map.sort((a: MapRecord, b: MapRecord) =>
        a.distance < b.distance ? -1 : 1,
      );

      if (map.length > this.k) {
        map.pop();
      }

      maxDistanceInMap = map[map.length - 1].distance;
    }

    return map;
  }
}

export interface KNNInterface {
  generateDistanceMap(point: number[]): MapRecord[];
  predict(point: number[]): Prediction;
}

export interface MapRecord {
  index: number;
  distance: number;
  label: string;
}

export interface Vote {
  label: string;
  count: number;
}

export interface VoteCounts {
  [x: string]: number;
}

export interface Prediction {
  label: string;
  voteCounts: VoteCounts;
  votes: MapRecord[];
}
