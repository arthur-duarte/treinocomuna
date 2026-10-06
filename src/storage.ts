import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@treino_comuna_plus_v1';

export type SetLog = {
  reps: string;
  load: string;
  done: boolean;
};

export type ExerciseLog = {
  exerciseId: string;
  sets: SetLog[];
};

export type WorkoutLog = {
  id: string;
  date: string;
  workoutKey: string;
  mode: 'normal' | 'minimo';
  exerciseLogs: ExerciseLog[];
  photoUri?: string;
  durationMinutes?: number;
};

export type Measurement = {
  id: string;
  date: string;
  weight?: number;
  waist?: number;
  abdomen?: number;
  chest?: number;
  arm?: number;
  thigh?: number;
  lowerAbdomen?: number;
};

export type AppData = {
  workoutLogs: WorkoutLog[];
  measurements: Measurement[];
};

const emptyData: AppData = {
  workoutLogs: [],
  measurements: []
};

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData;
    const parsed = JSON.parse(raw) as AppData;
    return {
      workoutLogs: Array.isArray(parsed.workoutLogs) ? parsed.workoutLogs : [],
      measurements: Array.isArray(parsed.measurements) ? parsed.measurements : []
    };
  } catch {
    return emptyData;
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
