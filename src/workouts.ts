export type Exercise = {
  id: string;
  name: string;
  short: string;
  sets: number;
  reps: string;
  rest: number;
  type?: 'reps' | 'time';
  note?: string;
};

export type Workout = {
  key: string;
  weekday: number;
  day: string;
  place: 'CASA' | 'ACADEMIA';
  focus: string;
  slogan: string;
  exercises: Exercise[];
};

export const workouts: Workout[] = [
  {
    key: 'segunda',
    weekday: 1,
    day: 'SEGUNDA',
    place: 'CASA',
    focus: 'Corpo inteiro + elásticos',
    slogan: 'SEM DESCULPAS. HOJE COMEÇA A MUDANÇA.',
    exercises: [
      { id: 'seg-remada', name: 'Remada com elástico preso à frente', short: 'Remada com elástico', sets: 3, reps: '12–20', rest: 60 },
      { id: 'seg-supino', name: 'Supino com elástico preso atrás', short: 'Supino com elástico', sets: 3, reps: '12–20', rest: 60 },
      { id: 'seg-cadeira', name: 'Sentar e levantar da cadeira', short: 'Cadeira', sets: 3, reps: '10–15', rest: 75 },
      { id: 'seg-puxada', name: 'Puxada de cima com elástico', short: 'Puxada', sets: 2, reps: '12–20', rest: 60 },
      { id: 'seg-biceps', name: 'Rosca bíceps com elástico', short: 'Bíceps', sets: 2, reps: '12–20', rest: 60 },
      { id: 'seg-triceps', name: 'Tríceps com elástico', short: 'Tríceps', sets: 2, reps: '12–20', rest: 60 },
      { id: 'seg-pallof', name: 'Pallof press', short: 'Pallof press', sets: 2, reps: '10–15/lado', rest: 45 },
      { id: 'seg-caminhada', name: 'Caminhada opcional', short: 'Caminhada', sets: 1, reps: '10–15 min', rest: 0, type: 'time' }
    ]
  },
  {
    key: 'terca',
    weekday: 2,
    day: 'TERÇA',
    place: 'ACADEMIA',
    focus: 'Pernas + peito',
    slogan: 'DISCIPLINA VENCE A DESCULPA.',
    exercises: [
      { id: 'ter-legpress', name: 'Leg press', short: 'Leg press', sets: 3, reps: '10–15', rest: 120, note: 'Controle a descida e não trave os joelhos.' },
      { id: 'ter-flexora', name: 'Flexora sentada ou deitada', short: 'Flexora', sets: 3, reps: '10–15', rest: 90 },
      { id: 'ter-extensora', name: 'Cadeira extensora', short: 'Extensora', sets: 2, reps: '12–15', rest: 90 },
      { id: 'ter-supino', name: 'Supino máquina', short: 'Supino máquina', sets: 3, reps: '8–12', rest: 120 },
      { id: 'ter-voador', name: 'Voador / Peck deck', short: 'Voador', sets: 2, reps: '12–15', rest: 75 },
      { id: 'ter-panturrilha', name: 'Panturrilha na máquina', short: 'Panturrilha', sets: 2, reps: '12–20', rest: 75 },
      { id: 'ter-esteira', name: 'Esteira — caminhada', short: 'Esteira', sets: 1, reps: '15 min', rest: 0, type: 'time', note: 'Caminhada rápida; sem corrida por enquanto.' }
    ]
  },
  {
    key: 'quarta',
    weekday: 3,
    day: 'QUARTA',
    place: 'ACADEMIA',
    focus: 'Costas + ombros + braços',
    slogan: 'COSTAS LARGAS. CABEÇA FIRME. SEM RECUAR.',
    exercises: [
      { id: 'qua-puxada', name: 'Puxada alta', short: 'Puxada alta', sets: 3, reps: '8–12', rest: 120 },
      { id: 'qua-remada', name: 'Remada baixa', short: 'Remada baixa', sets: 3, reps: '8–12', rest: 120 },
      { id: 'qua-ombros', name: 'Desenvolvimento de ombros na máquina', short: 'Desenvolvimento', sets: 2, reps: '8–12', rest: 90 },
      { id: 'qua-invertido', name: 'Voador invertido / posterior de ombro', short: 'Voador invertido', sets: 2, reps: '12–15', rest: 75 },
      { id: 'qua-biceps', name: 'Rosca bíceps máquina ou cabo', short: 'Bíceps', sets: 2, reps: '10–15', rest: 75 },
      { id: 'qua-triceps', name: 'Tríceps máquina ou cabo', short: 'Tríceps', sets: 2, reps: '10–15', rest: 75 },
      { id: 'qua-esteira', name: 'Esteira — caminhada', short: 'Esteira', sets: 1, reps: '15–20 min', rest: 0, type: 'time' }
    ]
  },
  {
    key: 'quinta',
    weekday: 4,
    day: 'QUINTA',
    place: 'ACADEMIA',
    focus: 'Corpo inteiro + cardio',
    slogan: 'CONSTÂNCIA É REVOLUÇÃO.',
    exercises: [
      { id: 'qui-legpress', name: 'Leg press', short: 'Leg press', sets: 2, reps: '12–15', rest: 90 },
      { id: 'qui-supino', name: 'Supino máquina', short: 'Supino máquina', sets: 2, reps: '10–15', rest: 90 },
      { id: 'qui-remada', name: 'Remada baixa', short: 'Remada baixa', sets: 2, reps: '10–15', rest: 90 },
      { id: 'qui-flexora', name: 'Flexora', short: 'Flexora', sets: 2, reps: '12–15', rest: 75 },
      { id: 'qui-lateral', name: 'Elevação lateral máquina ou cabo', short: 'Elevação lateral', sets: 2, reps: '12–20', rest: 60 },
      { id: 'qui-abdominal', name: 'Abdominal na máquina', short: 'Abdominal', sets: 2, reps: '10–15', rest: 60 },
      { id: 'qui-esteira', name: 'Esteira — caminhada', short: 'Esteira', sets: 1, reps: '20–25 min', rest: 0, type: 'time' }
    ]
  },
  {
    key: 'sexta',
    weekday: 5,
    day: 'SEXTA',
    place: 'CASA',
    focus: 'Complementar + core',
    slogan: 'TERMINAR A SEMANA TAMBÉM É VENCER.',
    exercises: [
      { id: 'sex-remada', name: 'Remada com elástico', short: 'Remada', sets: 3, reps: '15–20', rest: 60 },
      { id: 'sex-peitoral', name: 'Peitoral com elástico', short: 'Peitoral', sets: 3, reps: '15–20', rest: 60 },
      { id: 'sex-cadeira', name: 'Sentar e levantar da cadeira', short: 'Cadeira', sets: 2, reps: '12–15', rest: 75 },
      { id: 'sex-lateral', name: 'Elevação lateral com elástico', short: 'Elevação lateral', sets: 2, reps: '15–20', rest: 60 },
      { id: 'sex-biceps', name: 'Bíceps com elástico', short: 'Bíceps', sets: 2, reps: '15–20', rest: 60 },
      { id: 'sex-triceps', name: 'Tríceps com elástico', short: 'Tríceps', sets: 2, reps: '15–20', rest: 60 },
      { id: 'sex-pallof', name: 'Pallof press', short: 'Pallof press', sets: 2, reps: '12/lado', rest: 45 },
      { id: 'sex-caminhada', name: 'Caminhada opcional', short: 'Caminhada', sets: 1, reps: '15–20 min', rest: 0, type: 'time' }
    ]
  }
];

export function getWorkoutForDate(date = new Date()): Workout | undefined {
  return workouts.find((workout) => workout.weekday === date.getDay());
}

export function getWorkoutByKey(key: string): Workout | undefined {
  return workouts.find((workout) => workout.key === key);
}
