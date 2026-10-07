import { Achievement, AppDataV2, Goal, WorkoutLog } from './models';

export const achievementCatalog: Achievement[] = [
  { id: 'first_workout', title: 'Primeiro Passo', description: 'Concluir o primeiro treino.', icon: '★' },
  { id: 'week_3', title: 'Semana Ativa', description: 'Concluir 3 treinos na mesma semana.', icon: '⚡' },
  { id: 'week_target', title: 'Constância de Ferro', description: 'Bater a meta semanal de treinos.', icon: '◆' },
  { id: 'ten_workouts', title: '10 Treinos', description: 'Concluir 10 treinos.', icon: '10' },
  { id: 'twentyfive_workouts', title: '25 Treinos', description: 'Concluir 25 treinos.', icon: '25' },
  { id: 'fifty_workouts', title: '50 Treinos', description: 'Concluir 50 treinos.', icon: '50' },
  { id: 'hundred_workouts', title: '100 Treinos', description: 'Concluir 100 treinos.', icon: '100' },
  { id: 'photo_5', title: 'Arquivo da Mudança', description: 'Registrar 5 fotos pós-treino.', icon: '◉' },
  { id: 'measure_4', title: 'Censo da Evolução', description: 'Registrar medidas em 4 datas diferentes.', icon: '↗' },
  { id: 'revolution', title: 'Em Revolução', description: 'Alcançar uma meta principal.', icon: '✦' }
];

export function levelFromXp(xp: number) {
  const level = Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 120)) + 1);
  const currentFloor = Math.pow(level - 1, 2) * 120;
  const nextFloor = Math.pow(level, 2) * 120;
  return {
    level,
    current: xp - currentFloor,
    needed: nextFloor - currentFloor,
    progress: Math.max(0, Math.min(1, (xp - currentFloor) / Math.max(1, nextFloor - currentFloor)))
  };
}

export function xpForWorkout(mode: 'normal' | 'minimo', hasPhoto: boolean) {
  return (mode === 'normal' ? 100 : 60) + (hasPhoto ? 20 : 0);
}

function weekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

export function logsInCurrentWeek(logs: WorkoutLog[]) {
  const start = weekStart();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return logs.filter(log => {
    const d = new Date(log.date + 'T12:00:00');
    return d >= start && d < end;
  });
}

export function computeGoalProgress(data: AppDataV2, goal: Goal): number {
  if (goal.type === 'weight') {
    const latest = [...data.measurements].sort((a,b) => b.date.localeCompare(a.date)).find(m => typeof m.weight === 'number');
    if (!latest?.weight) return goal.startValue ?? 0;
    return latest.weight;
  }
  if (goal.type === 'weekly_workouts') return logsInCurrentWeek(data.workoutLogs).length;
  if (goal.type === 'workout_count') return data.workoutLogs.length;
  if (goal.type === 'active_months') {
    const months = new Set(data.workoutLogs.map(l => l.date.slice(0,7)));
    return months.size;
  }
  return 0;
}

export function isGoalComplete(data: AppDataV2, goal: Goal) {
  const current = computeGoalProgress(data, goal);
  if (goal.type === 'weight') {
    const start = goal.startValue ?? current;
    return start >= goal.target ? current <= goal.target : current >= goal.target;
  }
  return current >= goal.target;
}

export function goalProgressRatio(data: AppDataV2, goal: Goal) {
  const current = computeGoalProgress(data, goal);
  if (goal.type === 'weight') {
    const start = goal.startValue ?? current;
    const total = Math.abs(start - goal.target);
    if (!total) return 1;
    const moved = Math.abs(start - current);
    return Math.max(0, Math.min(1, moved / total));
  }
  return Math.max(0, Math.min(1, current / Math.max(1, goal.target)));
}

export function refreshAchievements(data: AppDataV2): Achievement[] {
  const existing = new Map(data.achievements.map(a => [a.id, a]));
  const unlocked = new Set<string>();
  const now = new Date().toISOString();

  if (data.workoutLogs.length >= 1) unlocked.add('first_workout');
  if (logsInCurrentWeek(data.workoutLogs).length >= 3) unlocked.add('week_3');
  if (logsInCurrentWeek(data.workoutLogs).length >= data.profile.weeklyTarget) unlocked.add('week_target');
  if (data.workoutLogs.length >= 10) unlocked.add('ten_workouts');
  if (data.workoutLogs.length >= 25) unlocked.add('twentyfive_workouts');
  if (data.workoutLogs.length >= 50) unlocked.add('fifty_workouts');
  if (data.workoutLogs.length >= 100) unlocked.add('hundred_workouts');
  if (data.workoutLogs.filter(l => !!l.photoUri).length >= 5) unlocked.add('photo_5');
  if (data.measurements.length >= 4) unlocked.add('measure_4');
  if (data.goals.some(g => isGoalComplete(data, g))) unlocked.add('revolution');

  return achievementCatalog.map(item => {
    const prev = existing.get(item.id);
    return {
      ...item,
      unlockedAt: prev?.unlockedAt ?? (unlocked.has(item.id) ? now : undefined)
    };
  });
}
