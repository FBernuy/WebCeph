/// <reference path="./resize-observer.d.ts" />
/// <reference path="./deep-diff.d.ts" />

type AngularUnit = 'degree' | 'radian';
type LinearUnit = 'mm' | 'cm' | 'in';
type oLandmarkType = 'angle' | 'point' | 'line' | 'distance';

/**
 * A generic interface that represents any cephalometric landmark, including
 * angles, lines and points.
 * Landmarks may also have names and units.
 */
interface BaseCephaloLandmark {
  name?: string,
  /**
   * Each landmark must have a symbol which acts as the unique identifier for that landmark.
   */
  symbol: string,
  description?: string,
  type: LandmarkType,
  unit?: AngularUnit | LinearUnit,
  /**
   * Some landmarks are composed of more basic components; for example, a line is
   * composed of two points.
   */
  components: CephaloLandmark[],
  /**
   * An optional custom calculation method.
   * It is passed the computed values for each of this landmark's components
   * in the same order they were declared.
   */
  calculate?(...args: number[]): number,
}

interface CephaloPoint extends BaseCephaloLandmark {
  type: 'point',
}

 interface CephaloLine extends BaseCephaloLandmark {
  type: 'line',
  unit: LinearUnit,
  components: CephaloPoint[],
}

interface CephaloDistance extends BaseCephaloLandmark {
  type: 'distance';
  unit: LinearUnit;
  components: CephaloPoint[];
}

interface CephaloAngle extends BaseCephaloLandmark {
  type: 'angle';
  unit: AngularUnit;
  components: CephaloPoint[] | CephaloLine[];
}

type CephaloLandmark = CephaloPoint | CephaloLine | CephaloAngle | CephaloDistance;

/**
 * Describes a geometrical point in a 2D-plane
 */
interface GeometricalPoint {
  x: number,
  y: number,
};

/**
 * Describes a geometrical line in a 2D-plane
 */
interface GeometricalLine {
  x1: number,
  x2: number,
  y1: number,
  y2: number,
}

type GeometricalObject = GeometricalLine | GeometricalPoint;


type EvaluatedValue = GeometricalObject | number;

/** A result of interpreting the evaluated components of a cephalometric analysis */
enum AnalysisResult {
  // Skeletal pattern
  
  CLASS_I_SKELETAL_PATTERN,
  CLASS_II_SKELETAL_PATTERN,
  CLASS_III_SKELETAL_PATTERN,

  // Maxilla
  PROGNATHIC_MAXILLA,
  RETROGNATHIC_MAXILLA,
  /** Indicates the maxilla is neither prognathic nor prognathic */
  NORMAL_MAXILLA,

  // Mandible
  PROGNATHIC_MANDIBLE,
  RETROGNATHIC_MANDIBLE,
  /** Indicates the mandible is neither prognathic nor prognathic */
  NORMAL_MANDIBLE,
}

type AnalysisComponent = {
  landmark: CephaloLandmark;
  norm: number;
  stdDev?: number;
};


interface Analysis {
  id: string;
  components: AnalysisComponent[];

  /** Given a map of the evaluated values of this analysis components,
   * this function should return an array of interpreted results.
   * For example, given a computed value of 7 for angle ANB,
   * the returned value should have a result of type CLASS_II_SKELETAL_PATTERN
   */
  interpret(values: { [id: string]: EvaluatedValue }): AnalysisResult[];
};

/**
 * A Mapper object maps cephalometric landmarks to geometrical objects
 */
interface CephaloMapper {
  toLine(landmark: CephaloLine): GeometricalLine;
  toPoint(landmark: CephaloPoint): GeometricalPoint;
  /**
   * The scale factor is required to calculate linear measurements
   * It is expected to map pixels on the screen to millimeters.
   */
  scaleFactor: number;
}

type StepState = 'done' | 'current' | 'pending' | 'evaluating';
type Step = CephaloLandmark & { title: string, state: StepState };

interface StoreState {
  'env.compatiblity.isIgnored': boolean;
  'env.compatiblity.missingFeatures': MissingBrowserFeature[];
  'env.compatiblity.isBeingChecked': boolean;
  'cephalo.workspace.image.data': string | null;
  'cephalo.workspace.error': { message: string } | null;
  'cephalo.workspace.canvas.height': number;
  'cephalo.workspace.canvas.width': number;
  'cephalo.workspace.image.isLoading': boolean;
  'cephalo.workspace.image.isCephalo': boolean;
  'cephalo.workspace.image.isFrontal': boolean;
  'cephalo.workspace.workers': {
    [id: string]: {
      isBusy: boolean,
      error?: { message: string },
    },
  };
  'cephalo.workspace.image.shouldFlipX': boolean;
  'cephalo.workspace.image.shouldFlipY': boolean;
  'cephalo.workspace.image.flipX': boolean;
  'cephalo.workspace.image.flipY': boolean;
  'cephalo.workspace.image.brightness': number;
  'cephalo.workspace.image.invert': boolean;
  'cephalo.workspace.image.contrast': number;
  'cephalo.workspace.analysis.activeAnalysis': Analysis | null;
  'cephalo.workspace.analysis.stepsBeingEvaluated': string[];
  'cephalo.workspace.analysis.isLoading': boolean;
  'cephalo.workspace.landmarks': {
    [id: string]: number | (GeometricalObject & {
      visible?: boolean;
    });
  };
}

/** Browser compatiblity checking */
type BrowserId = 'Chrome' | 'Firefox' | 'Opera' | 'Microsoft Edge' | 'Safari';
type OsId = 'mac' | 'windows' | 'linux' | 'chromeos' | 'ios' | 'android';

interface BrowserFeature {
  id: string;
  available: boolean;
  optional: boolean;
}

type MissingBrowserFeature = BrowserFeature & { available: false };

interface Browser {
  id: BrowserId | string;
  /** Display name for the browser */
  name: string;
  /**
   * The current version of the browser
   */
  version: string;
  /**
   * URL to the download page of the browser
   */
  downloadUrl: string;
}

interface BrowserRecommendation {
  id: BrowserId;
  /** Display name for the browser */
  name: string;
}