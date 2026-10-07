import { AppDataV2, ExerciseDef, Goal, WorkoutTemplate } from './models';
import { achievementCatalog } from './gamification';

export const exerciseLibrary: ExerciseDef[] = [
  { id:'band_row', name:'Remada com elástico', category:'COSTAS', equipment:'Elástico', imageKey:'band_row', muscles:['Costas','Bíceps'], instructions:['Prenda o elástico à frente.','Puxe as mãos em direção ao tronco.','Retorne devagar sem perder tensão.'], tips:['Peito aberto e ombros longe das orelhas.'] },
  { id:'band_chest', name:'Supino com elástico', category:'PEITO', equipment:'Elástico', imageKey:'band_chest', muscles:['Peito','Tríceps'], instructions:['Prenda o elástico atrás.','Empurre à frente até quase estender os cotovelos.','Volte controlando.'] },
  { id:'sit_to_stand', name:'Sentar e levantar da cadeira', category:'PERNAS', equipment:'Cadeira', imageKey:'sit_to_stand', muscles:['Quadríceps','Glúteos'], instructions:['Use uma cadeira firme.','Sente controlando.','Levante empurrando o chão.'] },
  { id:'band_lat', name:'Puxada de cima com elástico', category:'COSTAS', equipment:'Elástico', imageKey:'band_lat', muscles:['Dorsais','Bíceps'], instructions:['Prenda o elástico alto.','Puxe em direção ao peito.','Suba os braços controlando.'] },
  { id:'band_biceps', name:'Rosca bíceps com elástico', category:'BRAÇOS', equipment:'Elástico', imageKey:'band_biceps', muscles:['Bíceps'], instructions:['Pise no elástico.','Flexione os cotovelos.','Desça devagar.'] },
  { id:'band_triceps', name:'Tríceps com elástico', category:'BRAÇOS', equipment:'Elástico', imageKey:'band_triceps', muscles:['Tríceps'], instructions:['Prenda o elástico alto.','Estenda os cotovelos para baixo.','Retorne sem abrir os cotovelos.'] },
  { id:'pallof', name:'Pallof press', category:'CORE', equipment:'Elástico', imageKey:'pallof', muscles:['Core'], instructions:['Fique de lado para o ponto de fixação.','Leve as mãos à frente.','Resista à rotação do tronco.'] },
  { id:'walk', name:'Caminhada', category:'CARDIO', equipment:'Livre', imageKey:'walk', muscles:['Cardiorrespiratório'], instructions:['Caminhe em ritmo sustentável.','Mantenha postura confortável.'] },
  { id:'leg_press', name:'Leg press', category:'PERNAS', equipment:'Máquina', imageKey:'leg_press', muscles:['Quadríceps','Glúteos'], instructions:['Apoie toda a coluna.','Desça até onde mantém conforto e controle.','Empurre sem travar os joelhos.'], tips:['Não prenda a respiração.'] },
  { id:'leg_curl', name:'Flexora', category:'PERNAS', equipment:'Máquina', imageKey:'leg_curl', muscles:['Posteriores de coxa'], instructions:['Ajuste o rolo próximo aos tornozelos.','Flexione os joelhos.','Retorne controlando.'] },
  { id:'leg_extension', name:'Cadeira extensora', category:'PERNAS', equipment:'Máquina', imageKey:'leg_extension', muscles:['Quadríceps'], instructions:['Alinhe o joelho ao eixo da máquina.','Estenda os joelhos.','Desça devagar.'] },
  { id:'chest_press', name:'Supino máquina', category:'PEITO', equipment:'Máquina', imageKey:'chest_press', muscles:['Peito','Tríceps','Ombros'], instructions:['Ajuste o banco para as mãos ficarem na altura do peito.','Empurre à frente.','Retorne sem perder controle.'] },
  { id:'pec_deck', name:'Voador / Peck deck', category:'PEITO', equipment:'Máquina', imageKey:'pec_deck', muscles:['Peito'], instructions:['Apoie as costas.','Aproxime os braços à frente.','Abra devagar.'] },
  { id:'calf_machine', name:'Panturrilha na máquina', category:'PERNAS', equipment:'Máquina', imageKey:'calf_machine', muscles:['Panturrilhas'], instructions:['Apoie a ponta dos pés.','Suba os calcanhares.','Desça controlando.'] },
  { id:'treadmill', name:'Esteira — caminhada', category:'CARDIO', equipment:'Esteira', imageKey:'treadmill', muscles:['Cardiorrespiratório'], instructions:['Comece confortável.','Aumente velocidade ou inclinação aos poucos.','Sem corrida por enquanto.'] },
  { id:'lat_pulldown', name:'Puxada alta', category:'COSTAS', equipment:'Máquina/cabo', imageKey:'lat_pulldown', muscles:['Dorsais','Bíceps'], instructions:['Segure a barra acima.','Puxe em direção à parte alta do peito.','Retorne controlando.'] },
  { id:'seated_row', name:'Remada baixa', category:'COSTAS', equipment:'Máquina/cabo', imageKey:'seated_row', muscles:['Costas','Bíceps'], instructions:['Mantenha o peito aberto.','Puxe a alça em direção ao tronco.','Evite embalar.'] },
  { id:'shoulder_press', name:'Desenvolvimento de ombros', category:'OMBROS', equipment:'Máquina', imageKey:'shoulder_press', muscles:['Ombros','Tríceps'], instructions:['Ajuste o banco.','Empurre para cima.','Desça até uma posição confortável.'] },
  { id:'reverse_pec_deck', name:'Voador invertido', category:'OMBROS', equipment:'Máquina', imageKey:'reverse_pec_deck', muscles:['Posterior de ombro','Costas'], instructions:['Apoie o peito se a máquina permitir.','Abra os braços para trás.','Retorne devagar.'] },
  { id:'cable_biceps', name:'Rosca bíceps máquina/cabo', category:'BRAÇOS', equipment:'Máquina/cabo', imageKey:'band_biceps', muscles:['Bíceps'], instructions:['Mantenha os cotovelos perto do corpo.','Flexione.','Desça controlando.'] },
  { id:'cable_triceps', name:'Tríceps máquina/cabo', category:'BRAÇOS', equipment:'Máquina/cabo', imageKey:'band_triceps', muscles:['Tríceps'], instructions:['Cotovelos junto ao corpo.','Estenda para baixo.','Retorne sem balançar.'] },
  { id:'lateral_raise', name:'Elevação lateral', category:'OMBROS', equipment:'Máquina/cabo/elástico', imageKey:'lateral_raise', muscles:['Ombros'], instructions:['Eleve os braços para os lados.','Pare perto da linha dos ombros.','Desça controlando.'] },
  { id:'ab_machine', name:'Abdominal na máquina', category:'CORE', equipment:'Máquina', imageKey:'ab_machine', muscles:['Abdômen'], instructions:['Ajuste o banco e a carga.','Flexione o tronco sem puxar com o pescoço.','Retorne devagar.'] }
];

const w = (id:string, exerciseId:string, sets:number, reps:string, rest:number, rir='2') => ({id,exerciseId,sets,reps,rest,rir});

export const defaultWorkouts: WorkoutTemplate[] = [
  {
    id:'segunda', name:'Segunda — Corpo inteiro', place:'CASA', weekdays:[1], slogan:'SEM DESCULPAS. HOJE COMEÇA A MUDANÇA.', exercises:[
      w('seg1','band_row',3,'12–20',60,'2–3'), w('seg2','band_chest',3,'12–20',60,'2–3'), w('seg3','sit_to_stand',3,'10–15',75,'3'),
      w('seg4','band_lat',2,'12–20',60,'2–3'), w('seg5','band_biceps',2,'12–20',60,'2'), w('seg6','band_triceps',2,'12–20',60,'2'),
      w('seg7','pallof',2,'10–15/lado',45,'controlado'), w('seg8','walk',1,'10–15 min',0,'leve/moderado')
    ]
  },
  {
    id:'terca', name:'Terça — Pernas + peito', place:'ACADEMIA', weekdays:[2], slogan:'DISCIPLINA VENCE A DESCULPA.', exercises:[
      w('ter1','leg_press',3,'10–15',120,'2'), w('ter2','leg_curl',3,'10–15',90,'2'), w('ter3','leg_extension',2,'12–15',90,'2'),
      w('ter4','chest_press',3,'8–12',120,'2'), w('ter5','pec_deck',2,'12–15',75,'1–2'), w('ter6','calf_machine',2,'12–20',75,'2'),
      w('ter7','treadmill',1,'15 min',0,'moderado')
    ]
  },
  {
    id:'quarta', name:'Quarta — Costas + ombros + braços', place:'ACADEMIA', weekdays:[3], slogan:'COSTAS LARGAS. CABEÇA FIRME. SEM RECUAR.', exercises:[
      w('qua1','lat_pulldown',3,'8–12',120,'2'), w('qua2','seated_row',3,'8–12',120,'2'), w('qua3','shoulder_press',2,'8–12',90,'2'),
      w('qua4','reverse_pec_deck',2,'12–15',75,'2'), w('qua5','cable_biceps',2,'10–15',75,'1–2'), w('qua6','cable_triceps',2,'10–15',75,'1–2'),
      w('qua7','treadmill',1,'15–20 min',0,'moderado')
    ]
  },
  {
    id:'quinta', name:'Quinta — Corpo inteiro + cardio', place:'ACADEMIA', weekdays:[4], slogan:'CONSTÂNCIA É REVOLUÇÃO.', exercises:[
      w('qui1','leg_press',2,'12–15',90,'2–3'), w('qui2','chest_press',2,'10–15',90,'2'), w('qui3','seated_row',2,'10–15',90,'2'),
      w('qui4','leg_curl',2,'12–15',75,'2'), w('qui5','lateral_raise',2,'12–20',60,'2'), w('qui6','ab_machine',2,'10–15',60,'2–3'),
      w('qui7','treadmill',1,'20–25 min',0,'moderado')
    ]
  },
  {
    id:'sexta', name:'Sexta — Complementar + core', place:'CASA', weekdays:[5], slogan:'TERMINAR A SEMANA TAMBÉM É VENCER.', exercises:[
      w('sex1','band_row',3,'15–20',60,'3'), w('sex2','band_chest',3,'15–20',60,'3'), w('sex3','sit_to_stand',2,'12–15',75,'3'),
      w('sex4','lateral_raise',2,'15–20',60,'2–3'), w('sex5','band_biceps',2,'15–20',60,'2'), w('sex6','band_triceps',2,'15–20',60,'2'),
      w('sex7','pallof',2,'12/lado',45,'controlado'), w('sex8','walk',1,'15–20 min',0,'leve/moderado')
    ]
  }
];

export const defaultGoals: Goal[] = [
  { id:'weekly', type:'weekly_workouts', title:'Meta semanal', target:5, unit:'treinos' },
  { id:'consistency', type:'workout_count', title:'Primeiros 25 treinos', target:25, unit:'treinos' }
];

export const defaultDataV2: AppDataV2 = {
  version:2,
  profile:{name:'Camarada', weeklyTarget:5, objective:'EMAGRECER'},
  preferences:{theme:'revolucao', camaradaStyle:'misto', gamification:'completa', showCamarada:true, fullscreen:true, restAutoStart:true},
  exercises:exerciseLibrary,
  workouts:defaultWorkouts,
  workoutLogs:[],
  measurements:[],
  wellness:[],
  goals:defaultGoals,
  achievements:achievementCatalog,
  xp:0
};
