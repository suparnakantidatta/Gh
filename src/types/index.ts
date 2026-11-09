export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceLandmarks {
  leftEye: Point;
  rightEye: Point;
  nose: Point;
  mouthLeft: Point;
  mouthRight: Point;
  mouthCenter: Point;
  chin: Point;
  forehead: Point;
  leftCheek: Point;
  rightCheek: Point;
  jawline: Point[];
}

export interface DetectedFace {
  id: string;
  box: Rect;
  confidence: number;
  landmarks: FaceLandmarks;
  skinToneHex?: string;
  angle?: number;
}

export interface SwapSettings {
  blendMode: 'seamless' | 'color_transfer' | 'soft_feather' | 'ai_deep';
  skinToneMatch: number; // 0 - 100
  featherRadius: number; // 0 - 60
  opacity: number; // 0 - 100
  scale: number; // 0.5 - 2.0
  offsetX: number; // -100 to 100
  offsetY: number; // -100 to 100
  rotation: number; // -45 to 45 degrees
  lightingMatch: number; // 0 - 100
  colorWarmth: number; // -50 to 50
  contrast: number; // -50 to 50
  preserveExpression: boolean;
  showLandmarks: boolean;
  showSplitView: boolean;
  splitPosition: number; // 0 - 100
}

export interface PresetFace {
  id: string;
  name: string;
  category: 'celebrity' | 'character' | 'historical' | 'editorial' | 'stylized';
  imageUrl: string;
  gender: 'female' | 'male' | 'unisex';
  description: string;
}

export interface TargetMediaItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  category: 'cinematic' | 'fashion' | 'historical' | 'cyberpunk' | 'action';
  defaultFaceBox?: Rect;
  duration?: number;
}

export interface AnalysisData {
  sourceFace?: {
    detected: boolean;
    headPose: string;
    expression: string;
    lighting: string;
    skinToneHex: string;
    estimatedGender?: string;
    faceBox?: Rect;
  };
  targetFace?: {
    detected: boolean;
    headPose: string;
    expression: string;
    lighting: string;
    skinToneHex: string;
    faceBox?: Rect;
  };
  compatibilityScore: number;
  blendRecommendations?: {
    skinToneMatching: number;
    featherRadius: number;
    lightingCorrection: string;
    tips: string[];
  };
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: 'image' | 'video' | 'motion';
  sourceThumb: string;
  targetThumb: string;
  resultUrl: string;
  settings: SwapSettings;
}

export interface MotionSettings {
  expressionIntensity: number; // 0 - 200
  headPoseTransfer: boolean;
  headRotationScale: number; // 0 - 150
  eyeBlinkSync: boolean;
  lipSyncTransfer: boolean;
  gazeTracking: boolean;
  motionStabilization: number; // 0 - 100
  drivingPreset: 'talking' | 'head_turn' | 'laughing' | 'singing' | 'custom_video';
}

export interface DrivingMotion {
  id: string;
  title: string;
  videoUrl: string;
  previewUrl: string;
  description: string;
  motionType: 'speech' | 'expression' | 'turn' | 'rhythmic';
  duration: number;
}
