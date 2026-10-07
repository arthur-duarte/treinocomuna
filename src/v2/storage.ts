import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDataV2 } from './models';
import { defaultDataV2 } from './defaults';

const KEY = '@treino_comuna_plus_v2';
const OLD_KEY = '@treino_comuna_plus_v1';

export async function loadV2(): Promise<AppDataV2> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultDataV2,
        ...parsed,
        profile:{...defaultDataV2.profile,...parsed.profile},
        preferences:{...defaultDataV2.preferences,...parsed.preferences},
        exercises:Array.isArray(parsed.exercises) && parsed.exercises.length ? parsed.exercises : defaultDataV2.exercises,
        workouts:Array.isArray(parsed.workouts) && parsed.workouts.length ? parsed.workouts : defaultDataV2.workouts,
        workoutLogs:Array.isArray(parsed.workoutLogs) ? parsed.workoutLogs : [],
        measurements:Array.isArray(parsed.measurements) ? parsed.measurements : [],
        wellness:Array.isArray(parsed.wellness) ? parsed.wellness : [],
        goals:Array.isArray(parsed.goals) && parsed.goals.length ? parsed.goals : defaultDataV2.goals,
        achievements:Array.isArray(parsed.achievements) ? parsed.achievements : defaultDataV2.achievements
      };
    }

    const old = await AsyncStorage.getItem(OLD_KEY);
    if (old) {
      const parsed = JSON.parse(old);
      return {
        ...defaultDataV2,
        workoutLogs:Array.isArray(parsed.workoutLogs) ? parsed.workoutLogs.map((l:any)=>({...l, workoutId:l.workoutKey ?? l.workoutId})) : [],
        measurements:Array.isArray(parsed.measurements) ? parsed.measurements : []
      };
    }
  } catch {}
  return defaultDataV2;
}

export async function saveV2(data: AppDataV2) {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}
