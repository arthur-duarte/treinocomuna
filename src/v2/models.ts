export type Place = 'ACADEMIA' | 'CASA' | 'CARDIO' | 'OUTRO';

export type ExerciseDef = {
  id: string;
  name: string;
  category: 'PEITO' | 'COSTAS' | 'PERNAS' | 'OMBROS' | 'BRAÇOS' | 'CORE' | 'CARDIO' | 'CORPO TODO';
  equipment: string;
  imageKey?: string;
  imageUri?: string;
  instructions: string[];
  tips?: string[];
  muscles?: string[];
  custom?: boolean;
};

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  sets: number;
  reps: string;
  rest: number;
  rir?: string;
  note?: string;
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  place: Place;
  weekdays: number[];
  color?: string;
  slogan?: string;
  exercises: WorkoutExercise[];
  custom?: boolean;
};

export type SetLog = {
  load: string;
  reps: string;
  done: boolean;
};

export type ExerciseLog = {
  exerciseId: string;
  sets: SetLog[];
};

export type WorkoutLog = {
  id: string;
  date: string;
  workoutId: string;
  mode: 'normal' | 'minimo';
  exerciseLogs: ExerciseLog[];
  photoUri?: string;
  durationMinutes?: number;
  effort?: 1 | 2 | 3 | 4 | 5;
  note?: string;
};

export type Measurement = {
  id: string;
  date: string;
  weight?: number;
  waist?: number;
  abdomen?: number;
  lowerAbdomen?: number;
  chest?: number;
  arm?: number;
  thigh?: number;
  calf?: number;
  photoUri?: string;
};

export type WellnessLog = {
  id: string;
  date: string;
  sleepHours?: number;
  energy?: 1 | 2 | 3 | 4 | 5;
  mood?: 1 | 2 | 3 | 4 | 5;
  waterLiters?: number;
  glucose?: number;
  note?: string;
};

export type GoalType = 'weight' | 'weekly_workouts' | 'active_months' | 'workout_count';

export type Goal = {
  id: string;
  type: GoalType;
  title: string;
  target: number;
  startValue?: number;
  current?: number;
  unit: string;
  deadline?: string;
  completedAt?: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
};

export type Profile = {
  name: string;
  heightCm?: number;
  targetWeight?: number;
  weeklyTarget: number;
  objective: 'EMAGRECER' | 'GANHAR FORÇA' | 'CONDICIONAMENTO' | 'PERSONALIZADO';
};

export type Preferences = {
  theme: 'revolucao' | 'noturno' | 'claro';
  camaradaStyle: 'ordem' | 'apoio' | 'misto';
  gamification: 'completa' | 'leve' | 'desligada';
  showCamarada: boolean;
  fullscreen: boolean;
  restAutoStart: boolean;
};

export type AppDataV2 = {
  version: 2;
  profile: Profile;
  preferences: Preferences;
  exercises: ExerciseDef[];
  workouts: WorkoutTemplate[];
  workoutLogs: WorkoutLog[];
  measurements: Measurement[];
  wellness: WellnessLog[];
  goals: Goal[];
  achievements: Achievement[];
  xp: number;
};
