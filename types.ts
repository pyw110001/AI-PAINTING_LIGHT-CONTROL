export interface LightParams {
  azimuth: number;   // 0-360 degrees
  elevation: number; // -60 to +60 degrees
  intensity: number; // 0.1 to 2.0
}

export interface GeneratedResult {
  imageUrl: string;
  promptUsed: string;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
