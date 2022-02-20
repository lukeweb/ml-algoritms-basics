import { distance, mean } from '../helpers';

export class KMeansAlgorithm implements KMeansInterface {
  private error = 0;
  private iterations = 0;
  private iterationLogs: IterationsLogs[] = [];
  private centroids: number[][] = [];
  private centroidsAssignments: number[] = [];

  constructor(private k: number, private data: number[][]) {
    this.k = k;
    this.data = data;
    this.reset();
  }

  /**
   * The method which runs algorithm with the given or maximum iterations
   * and returns the last iteration log as result.
   *
   * @param maxIterations number
   * @returns IterationsLogs
   */
  solve(maxIterations = 1000): IterationsLogs {
    while (this.iterations < maxIterations) {
      const didAssignmentChange: boolean = this.assignPointsToCentroids();
      this.updateCentroidLocations();

      this.iterationLogs[this.iterations] = {
        centroids: [...this.centroids],
        iterations: this.iterations + 1,
        error: this.calculateError(),
        didReachSteadyState: !didAssignmentChange,
      };

      if (!didAssignmentChange) {
        break;
      }

      this.iterations++;
    }

    return this.iterationLogs[this.iterationLogs.length - 1];
  }

  /**
   * Returns number od dimensions in data collection.
   *
   * @returns this.data[0].length number
   */
  getDimensionality(): number {
    return this.data[0].length;
  }

  /**
   * Returns all iteration logs created during process
   *
   * @returns this.iterationLogs IterationsLogs[]
   */
  getIterationsLogs(): IterationsLogs[] {
    return this.iterationLogs;
  }

  /**
   * For current dimension in data collection, this method determines min and max values.
   * This values are used for random centroid initialization.
   *
   * @param n number
   * @returns dimensionRange DimensionRange
   */
  getRangeForDimensions(n: number): DimensionRange {
    const values = this.data.map<number>((point: number[]) => point[n]);

    return {
      min: Math.min.apply(null, values),
      max: Math.max.apply(null, values),
    };
  }

  /**
   * Returns and array in which indexes are size values calculated by getRangeForDimensions
   *
   * @returns dimensionRanges DimensionRange[]
   */
  getAllDimensionRanges(): DimensionRange[] {
    const dimensionRanges: DimensionRange[] = [];

    for (let dimension = 0; dimension < this.getDimensionality(); dimension++) {
      dimensionRanges[dimension] = this.getRangeForDimensions(dimension);
    }

    return dimensionRanges;
  }

  /**
   * This method initializes the random centroids using data range for defining
   * min and max values for generated centroids.
   *
   * @returns centroids number[][]
   */
  initRandomCentroids(): number[][] {
    const centroids: number[][] = [];

    for (let i = 0; i < this.k; i++) {
      const point = [];

      for (
        let dimension = 0;
        dimension < this.getDimensionality();
        dimension++
      ) {
        const { min, max } = this.getAllDimensionRanges()[dimension];
        point[dimension] = min + Math.random() * (max - min);
      }

      centroids.push(point);
    }

    return centroids;
  }

  /**
   * With chosen data point, this method finds the centroid which is closest to it and
   * assigns this point with the found centroid.
   * It returns a logic value if the relation between point and centroid was changed.
   *
   * @param pointIndex number
   * @returns lastAssignedCentroid !== assignedCentroid boolean
   */
  assignPointToCentroid(pointIndex: number): boolean {
    const lastAssignedCentroid: number = this.centroidsAssignments[pointIndex];
    const point: number[] = this.data[pointIndex];
    let minDistance = 0;
    let assignedCentroid = 0;

    for (let i = 0; i < this.centroids.length; i++) {
      const centroid: number[] = this.centroids[i];
      const distanceToCentroid: number = distance(point, centroid);

      if (minDistance === 0 || distanceToCentroid < minDistance) {
        minDistance = distanceToCentroid;
        assignedCentroid = i;
      }
    }

    this.centroidsAssignments[pointIndex] = assignedCentroid;

    return lastAssignedCentroid !== assignedCentroid;
  }

  /**
   * For all the data points, method runs assignPointToCentroid() and returns information
   * if any of the points related to a centroid was changed.
   *
   * @returns didAnyPointGetReassigned boolean
   */
  assignPointsToCentroids(): boolean {
    let didAnyPointGetReassigned = false;
    for (let i = 0; i < this.data.length; i++) {
      const wasReassigned: boolean = this.assignPointToCentroid(i);
      if (wasReassigned) didAnyPointGetReassigned = true;
    }

    return didAnyPointGetReassigned;
  }

  /**
   * The method returns an array of all related points with a given centroid.
   *
   * @param centroidIndex number
   * @returns points number[][]
   */
  getPointsForCentroid(centroidIndex: number): number[][] {
    const points: number[][] = [];

    for (let i = 0; i < this.data.length; i++) {
      const assignment: number = this.centroidsAssignments[i];
      if (assignment === centroidIndex) {
        points.push(this.data[i]);
      }
    }

    return points;
  }

  /**
   * For the current centroid, this method calculates the mean value of the distance between it
   * and related points and use the result to replace an old value
   *
   * @param centroidIndex number
   * @returns newCentroid number[]
   */
  updateCentroidLocation(centroidIndex: number): number[] {
    const thisCentroidPoints: number[][] =
      this.getPointsForCentroid(centroidIndex);
    const newCentroid: number[] = [];

    for (let dimension = 0; dimension < this.getDimensionality(); dimension++) {
      newCentroid[dimension] = mean(
        thisCentroidPoints.map((point) => point[dimension]),
      );
    }

    this.centroids[centroidIndex] = newCentroid;

    return newCentroid;
  }

  /**
   * Updates location of all centroids
   */
  updateCentroidLocations(): void {
    for (let i = 0; i < this.centroids.length; i++) {
      this.updateCentroidLocation(i);
    }
  }

  /**
   * Calculates error for actual centroid state and points related to it.
   * In this case, an error is defined as the mean square distance between
   * the centroid and all points related to it.
   *
   * @returns this.error
   */
  calculateError(): number {
    let sumDistanceSquared = 0;

    for (let i = 0; i < this.data.length; i++) {
      const centroidIndex: number = this.centroidsAssignments[i];
      const centroid: number[] = this.centroids[centroidIndex];
      const point: number[] = this.data[i];
      const thisDistance: number = distance(point, centroid);
      sumDistanceSquared = thisDistance * thisDistance;
    }

    this.error = Math.sqrt(sumDistanceSquared / this.data.length);

    return this.error;
  }

  /**
   * Resets class state to starting values
   */
  reset(): void {
    this.error = 0;
    this.iterations = 0;
    this.iterationLogs = [];
    this.centroids = this.initRandomCentroids();
    this.centroidsAssignments = [];
  }
}

interface KMeansInterface {
  solve(maxIterations: number): IterationsLogs;
  getDimensionality(): number;
  getIterationsLogs(): IterationsLogs[];
  getRangeForDimensions(n: number): DimensionRange;
  getAllDimensionRanges(): DimensionRange[];
  initRandomCentroids(): number[][];
  assignPointToCentroid(pointIndex: number): boolean;
  assignPointsToCentroids(): boolean;
  getPointsForCentroid(centroidIndex: number): number[][];
  updateCentroidLocation(centroidIndex: number): number[];
  updateCentroidLocations(): void;
  calculateError(): number;
  reset(): void;
}

export interface IterationsLogs {
  centroids: number[][];
  iterations: number;
  error: number;
  didReachSteadyState: boolean;
}

export interface DimensionRange {
  min: number;
  max: number;
}
