import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Camarada } from './src/components/Camarada';
import { EquipmentSketch } from './src/components/EquipmentSketch';
import {
  Exercise,
  getWorkoutForDate,
  Workout,
  workouts
} from './src/workouts';
import {
  AppData,
  ExerciseLog,
  loadAppData,
  Measurement,
  saveAppData,
  SetLog,
  WorkoutLog
} from './src/storage';

const C = {
  red: '#B71C1C',
  redDark: '#7A1111',
  ink: '#111111',
  inkSoft: '#24201E',
  cream: '#F1E5C8',
  paper: '#E4D2AB',
  yellow: '#D9A441',
  white: '#FFF8E8',
  muted: '#8E8068',
  green: '#506B3C'
};

type Tab = 'missao' | 'calendario' | 'progresso' | 'quartel';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

const emptyData: AppData = { workoutLogs: [], measurements: [] };

function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function sameWeek(dateString: string, base = new Date()) {
  const date = parseDateKey(dateString);
  const start = new Date(base);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return date >= start && date < end;
}

function shortDate(key: string) {
  const date = parseDateKey(key);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatTimer(total: number) {
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function compactWorkout(workout: Workout): Workout {
  const strength = workout.exercises.filter((e) => e.type !== 'time').slice(0, 4).map((e) => ({
    ...e,
    sets: Math.min(e.sets, 2)
  }));
  const cardio = workout.exercises.find((e) => e.type === 'time');
  return {
    ...workout,
    focus: `${workout.focus} · modo mínimo`,
    slogan: 'FEITO É MELHOR QUE ADIADO.',
    exercises: cardio
      ? [...strength, { ...cardio, sets: 1, reps: '10 min' }]
      : strength
  };
}

function initialLogs(workout: Workout): Record<string, SetLog[]> {
  return Object.fromEntries(
    workout.exercises.map((exercise) => [
      exercise.id,
      Array.from({ length: exercise.sets }, () => ({
        reps: '',
        load: '',
        done: false
      }))
    ])
  );
}

function SectionStamp({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.stamp}>
      <Text style={styles.stampText}>{children}</Text>
    </View>
  );
}

function Button({
  label,
  onPress,
  variant = 'red',
  disabled = false
}: {
  label: string;
  onPress: () => void;
  variant?: 'red' | 'dark' | 'cream' | 'outline';
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'red' && styles.buttonRed,
        variant === 'dark' && styles.buttonDark,
        variant === 'cream' && styles.buttonCream,
        variant === 'outline' && styles.buttonOutline,
        pressed && !disabled && { opacity: 0.78, transform: [{ scale: 0.99 }] },
        disabled && { opacity: 0.35 }
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'cream' && { color: C.ink },
          variant === 'outline' && { color: C.cream }
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, value * 100))}%` }]} />
    </View>
  );
}

function HeaderPoster({
  eyebrow,
  title,
  subtitle,
  speech
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  speech?: string;
}) {
  return (
    <View style={styles.poster}>
      <View style={styles.posterSlash} />
      <View style={styles.posterDots}>
        {Array.from({ length: 20 }).map((_, i) => <View key={i} style={styles.dot} />)}
      </View>
      <View style={{ flex: 1, zIndex: 2 }}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.posterTitle}>{title}</Text>
        <View style={styles.posterBanner}>
          <Text style={styles.posterBannerText}>{subtitle}</Text>
        </View>
        {speech ? <Text style={styles.posterSpeech}>“{speech}”</Text> : null}
      </View>
      <View style={styles.mascotWrap}>
        <Camarada size={112} />
      </View>
    </View>
  );
}

function TabBar({ tab, setTab }: { tab: Tab; setTab: (tab: Tab) => void }) {
  const items: { key: Tab; icon: string; label: string }[] = [
    { key: 'missao', icon: '★', label: 'MISSÃO' },
    { key: 'calendario', icon: '▦', label: 'CALENDÁRIO' },
    { key: 'progresso', icon: '↗', label: 'PROGRESSO' },
    { key: 'quartel', icon: '⚙', label: 'QUARTEL' }
  ];
  return (
    <View style={styles.tabBar}>
      {items.map((item) => (
        <Pressable key={item.key} style={styles.tabItem} onPress={() => setTab(item.key)}>
          <Text style={[styles.tabIcon, tab === item.key && { color: C.yellow }]}>{item.icon}</Text>
          <Text style={[styles.tabLabel, tab === item.key && { color: C.white }]}>{item.label}</Text>
          {tab === item.key ? <View style={styles.tabActive} /> : null}
        </Pressable>
      ))}
    </View>
  );
}

function HomeScreen({
  data,
  selected,
  setSelected,
  startWorkout
}: {
  data: AppData;
  selected: Workout;
  setSelected: (workout: Workout) => void;
  startWorkout: (workout: Workout, mode: 'normal' | 'minimo') => void;
}) {
  const today = new Date();
  const todayWorkout = getWorkoutForDate(today);
  const weekCount = data.workoutLogs.filter((log) => sameWeek(log.date, today)).length;
  const monthCount = data.workoutLogs.filter((log) => {
    const d = parseDateKey(log.date);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).length;
  const latestMeasure = [...data.measurements].sort((a, b) => b.date.localeCompare(a.date))[0];
  const latestPhoto = [...data.workoutLogs]
    .filter((log) => !!log.photoUri)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <ScrollView contentContainerStyle={styles.screenScroll}>
      <HeaderPoster
        eyebrow="TREINO COMUNA+"
        title="ORDEM DO DIA"
        subtitle={todayWorkout ? `${todayWorkout.day} · ${todayWorkout.focus}` : 'HOJE É RECUPERAÇÃO'}
        speech={todayWorkout ? todayWorkout.slogan : 'Descansar também faz parte da campanha.'}
      />

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{weekCount}/5</Text>
          <Text style={styles.statLabel}>SEMANA</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{monthCount}</Text>
          <Text style={styles.statLabel}>NO MÊS</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {latestMeasure?.weight ? `${latestMeasure.weight.toFixed(1)}` : '—'}
          </Text>
          <Text style={styles.statLabel}>PESO KG</Text>
        </View>
      </View>

      <SectionStamp>ESCOLHA A FRENTE DE TREINO</SectionStamp>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRail}>
        {workouts.map((workout) => (
          <Pressable
            key={workout.key}
            style={[styles.dayChip, selected.key === workout.key && styles.dayChipActive]}
            onPress={() => setSelected(workout)}
          >
            <Text style={[styles.dayChipDay, selected.key === workout.key && { color: C.white }]}>
              {workout.day.slice(0, 3)}
            </Text>
            <Text style={[styles.dayChipPlace, selected.key === workout.key && { color: C.paper }]}>
              {workout.place}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.missionCard}>
        <View style={styles.missionTop}>
          <View style={styles.numberBadge}>
            <Text style={styles.numberBadgeText}>{selected.exercises.length}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.missionKicker}>{selected.day} · {selected.place}</Text>
            <Text style={styles.missionTitle}>{selected.focus}</Text>
          </View>
        </View>

        <Text style={styles.missionSlogan}>{selected.slogan}</Text>

        <View style={styles.exercisePreview}>
          {selected.exercises.slice(0, 5).map((exercise, index) => (
            <View key={exercise.id} style={styles.previewRow}>
              <Text style={styles.previewIndex}>{String(index + 1).padStart(2, '0')}</Text>
              <Text style={styles.previewName}>{exercise.short}</Text>
              <Text style={styles.previewPrescription}>
                {exercise.sets > 1 ? `${exercise.sets}×${exercise.reps}` : exercise.reps}
              </Text>
            </View>
          ))}
          {selected.exercises.length > 5 ? (
            <Text style={styles.moreText}>+ {selected.exercises.length - 5} exercícios na missão completa</Text>
          ) : null}
        </View>

        <Button label="▶ INICIAR MISSÃO" onPress={() => startWorkout(selected, 'normal')} />
        <View style={{ height: 8 }} />
        <Button label="HOJE ESTOU UM CACO · MODO MÍNIMO" variant="dark" onPress={() => startWorkout(selected, 'minimo')} />
      </View>

      <SectionStamp>ÚLTIMO REGISTRO</SectionStamp>
      <View style={styles.latestGrid}>
        <View style={styles.latestCard}>
          <Text style={styles.latestLabel}>PESO / MEDIDAS</Text>
          {latestMeasure ? (
            <>
              <Text style={styles.latestBig}>{latestMeasure.weight ? `${latestMeasure.weight.toFixed(1)} kg` : 'Sem peso'}</Text>
              <Text style={styles.latestSmall}>
                {latestMeasure.waist ? `Cintura ${latestMeasure.waist} cm` : 'Registre sua cintura'}
              </Text>
              <Text style={styles.latestDate}>{shortDate(latestMeasure.date)}</Text>
            </>
          ) : (
            <Text style={styles.latestSmall}>Nenhum registro ainda.</Text>
          )}
        </View>

        <View style={styles.latestCard}>
          <Text style={styles.latestLabel}>PÓS-TREINO</Text>
          {latestPhoto?.photoUri ? (
            <Image source={{ uri: latestPhoto.photoUri }} style={styles.latestPhoto} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>FOTO DA VITÓRIA</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function WorkoutScreen({
  workout,
  mode,
  onClose,
  onComplete
}: {
  workout: Workout;
  mode: 'normal' | 'minimo';
  onClose: () => void;
  onComplete: (log: Omit<WorkoutLog, 'photoUri'>) => void;
}) {
  const mission = mode === 'minimo' ? compactWorkout(workout) : workout;
  const [logs, setLogs] = useState<Record<string, SetLog[]>>(() => initialLogs(mission));
  const [rest, setRest] = useState(0);
  const [restName, setRestName] = useState('');
  const [startedAt] = useState(Date.now());

  useEffect(() => {
    if (rest <= 0) return;
    const timer = setInterval(() => setRest((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [rest]);

  const totalSets = mission.exercises.reduce((sum, e) => sum + e.sets, 0);
  const doneSets = Object.values(logs).flat().filter((set) => set.done).length;
  const progress = totalSets ? doneSets / totalSets : 0;

  function updateSet(exercise: Exercise, index: number, field: 'reps' | 'load', value: string) {
    setLogs((current) => ({
      ...current,
      [exercise.id]: current[exercise.id].map((set, i) => i === index ? { ...set, [field]: value } : set)
    }));
  }

  function toggleSet(exercise: Exercise, index: number) {
    const wasDone = logs[exercise.id][index].done;
    setLogs((current) => ({
      ...current,
      [exercise.id]: current[exercise.id].map((set, i) => i === index ? { ...set, done: !set.done } : set)
    }));
    if (!wasDone && exercise.rest > 0) {
      setRest(exercise.rest);
      setRestName(exercise.short);
    }
  }

  function finish() {
    const complete = () => {
      const exerciseLogs: ExerciseLog[] = mission.exercises.map((exercise) => ({
        exerciseId: exercise.id,
        sets: logs[exercise.id]
      }));
      onComplete({
        id: String(Date.now()),
        date: dateKey(),
        workoutKey: workout.key,
        mode,
        exerciseLogs,
        durationMinutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000))
      });
    };

    if (doneSets < totalSets) {
      Alert.alert(
        'Missão incompleta',
        `Você concluiu ${doneSets} de ${totalSets} séries. Registrar assim mesmo?`,
        [
          { text: 'Continuar treino', style: 'cancel' },
          { text: 'Registrar', style: 'destructive', onPress: complete }
        ]
      );
    } else {
      complete();
    }
  }

  return (
    <SafeAreaView style={styles.workoutScreen}>
      <StatusBar barStyle="light-content" />
      <View style={styles.workoutHeader}>
        <Pressable onPress={onClose} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.workoutEyebrow}>
            {mode === 'minimo' ? 'MODO MÍNIMO · ' : ''}{mission.day} · {mission.place}
          </Text>
          <Text style={styles.workoutTitle}>{mission.focus}</Text>
        </View>
        <Camarada size={62} />
      </View>

      <View style={styles.workoutProgress}>
        <View style={{ flex: 1 }}>
          <Text style={styles.workoutProgressText}>{doneSets}/{totalSets} SÉRIES CONCLUÍDAS</Text>
          <ProgressBar value={progress} />
        </View>
      </View>

      {rest > 0 ? (
        <View style={styles.restBanner}>
          <View>
            <Text style={styles.restLabel}>DESCANSO · {restName}</Text>
            <Text style={styles.restTime}>{formatTimer(rest)}</Text>
          </View>
          <Pressable onPress={() => setRest(0)} style={styles.skipRest}>
            <Text style={styles.skipRestText}>PULAR</Text>
          </Pressable>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.workoutList}>
        {mission.exercises.map((exercise, exerciseIndex) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseNumber}>
                <Text style={styles.exerciseNumberText}>{exerciseIndex + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {exercise.sets > 1 ? `${exercise.sets} séries · ${exercise.reps}` : exercise.reps}
                  {exercise.rest ? ` · descanso ${exercise.rest}s` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.equipmentSketchWrap}><Text style={styles.equipmentSketchLabel}>IDENTIFIQUE O APARELHO</Text><EquipmentSketch name={exercise.name} /></View>

            {exercise.note ? <Text style={styles.exerciseNote}>⚑ {exercise.note}</Text> : null}

            <View style={styles.setHead}>
              <Text style={[styles.setHeadText, { width: 34 }]}>SÉRIE</Text>
              {exercise.type !== 'time' ? <Text style={[styles.setHeadText, { flex: 1 }]}>CARGA</Text> : null}
              <Text style={[styles.setHeadText, { flex: 1 }]}>{exercise.type === 'time' ? 'MINUTOS' : 'REPS'}</Text>
              <Text style={[styles.setHeadText, { width: 48, textAlign: 'center' }]}>FEITO</Text>
            </View>

            {logs[exercise.id].map((set, index) => (
              <View key={index} style={[styles.setRow, set.done && styles.setRowDone]}>
                <Text style={styles.setIndex}>{index + 1}</Text>
                {exercise.type !== 'time' ? (
                  <TextInput
                    value={set.load}
                    onChangeText={(value) => updateSet(exercise, index, 'load', value)}
                    placeholder="kg"
                    placeholderTextColor={C.muted}
                    keyboardType="decimal-pad"
                    style={styles.setInput}
                  />
                ) : null}
                <TextInput
                  value={set.reps}
                  onChangeText={(value) => updateSet(exercise, index, 'reps', value)}
                  placeholder={exercise.type === 'time' ? exercise.reps.replace(' min', '') : exercise.reps}
                  placeholderTextColor={C.muted}
                  keyboardType="number-pad"
                  style={styles.setInput}
                />
                <Pressable
                  onPress={() => toggleSet(exercise, index)}
                  style={[styles.checkButton, set.done && styles.checkButtonDone]}
                >
                  <Text style={styles.checkText}>{set.done ? '✓' : ''}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.finishBlock}>
          <Text style={styles.finishTitle}>A MISSÃO TERMINA QUANDO É REGISTRADA.</Text>
          <Text style={styles.finishSub}>Ao concluir, você poderá tirar a foto pós-treino para o calendário.</Text>
          <Button label="✓ CONCLUIR TREINO" onPress={finish} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CalendarScreen({ data }: { data: AppData }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const logsByDate = useMemo(() => {
    const map = new Map<string, WorkoutLog[]>();
    data.workoutLogs.forEach((log) => {
      const list = map.get(log.date) ?? [];
      list.push(log);
      map.set(log.date, list);
    });
    return map;
  }, [data.workoutLogs]);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function changeMonth(delta: number) {
    setMonth(new Date(year, monthIndex + delta, 1));
  }

  const completedThisMonth = Array.from(logsByDate.keys()).filter((key) => {
    const d = parseDateKey(key);
    return d.getFullYear() === year && d.getMonth() === monthIndex;
  }).length;

  return (
    <ScrollView contentContainerStyle={styles.screenScroll}>
      <HeaderPoster
        eyebrow="ARQUIVO DA CAMPANHA"
        title="CALENDÁRIO"
        subtitle="TREINOS CONCLUÍDOS"
        speech="O que foi feito fica registrado."
      />

      <View style={styles.calendarCard}>
        <View style={styles.calendarNav}>
          <Pressable onPress={() => changeMonth(-1)} style={styles.monthArrow}><Text style={styles.monthArrowText}>‹</Text></Pressable>
          <View>
            <Text style={styles.calendarMonth}>{MONTHS[monthIndex]}</Text>
            <Text style={styles.calendarYear}>{year} · {completedThisMonth} treinos</Text>
          </View>
          <Pressable onPress={() => changeMonth(1)} style={styles.monthArrow}><Text style={styles.monthArrowText}>›</Text></Pressable>
        </View>

        <View style={styles.weekHeader}>
          {WEEKDAYS.map((day, index) => <Text key={index} style={styles.weekHeaderText}>{day}</Text>)}
        </View>

        <View style={styles.calendarGrid}>
          {cells.map((day, index) => {
            if (!day) return <View key={index} style={styles.calendarCell} />;
            const key = dateKey(new Date(year, monthIndex, day));
            const logs = logsByDate.get(key);
            const done = !!logs?.length;
            const hasPhoto = logs?.some((log) => !!log.photoUri);
            const isToday = key === dateKey();
            return (
              <View key={index} style={[styles.calendarCell, done && styles.calendarCellDone, isToday && styles.calendarCellToday]}>
                <Text style={[styles.calendarDay, done && { color: C.white }]}>{day}</Text>
                {done ? <Text style={styles.calendarMark}>★</Text> : null}
                {hasPhoto ? <View style={styles.photoDot} /> : null}
              </View>
            );
          })}
        </View>

        <View style={styles.legendRow}>
          <Text style={styles.legendText}>★ treino concluído</Text>
          <Text style={styles.legendText}>● foto pós-treino</Text>
        </View>
      </View>

      <SectionStamp>RELATÓRIO RECENTE</SectionStamp>
      {[...data.workoutLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map((log) => {
        const workout = workouts.find((w) => w.key === log.workoutKey);
        return (
          <View key={log.id} style={styles.historyRow}>
            <View style={styles.historyDate}>
              <Text style={styles.historyDateText}>{shortDate(log.date)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyTitle}>{workout?.day ?? 'TREINO'} · {workout?.focus ?? ''}</Text>
              <Text style={styles.historyMeta}>
                {log.mode === 'minimo' ? 'Modo mínimo' : 'Missão completa'}
                {log.durationMinutes ? ` · ${log.durationMinutes} min` : ''}
              </Text>
            </View>
            {log.photoUri ? <Image source={{ uri: log.photoUri }} style={styles.historyThumb} /> : null}
          </View>
        );
      })}
      {!data.workoutLogs.length ? <Text style={styles.emptyText}>Ainda não há missões concluídas.</Text> : null}
    </ScrollView>
  );
}

function MiniBars({ measurements }: { measurements: Measurement[] }) {
  const points = measurements
    .filter((m) => typeof m.weight === 'number')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-8);

  if (points.length < 2) {
    return <Text style={styles.emptyText}>Registre pelo menos dois pesos para formar a linha de avanço.</Text>;
  }

  const values = points.map((p) => p.weight as number);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  return (
    <View style={styles.barChart}>
      {points.map((point) => {
        const h = 34 + (((point.weight as number) - min) / range) * 70;
        return (
          <View key={point.id} style={styles.barColumn}>
            <Text style={styles.barValue}>{point.weight?.toFixed(1)}</Text>
            <View style={[styles.bar, { height: h }]} />
            <Text style={styles.barDate}>{shortDate(point.date)}</Text>
          </View>
        );
      })}
    </View>
  );
}

function ProgressScreen({
  data,
  onSaveMeasurement
}: {
  data: AppData;
  onSaveMeasurement: (measurement: Measurement) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    weight: '',
    waist: '',
    abdomen: '',
    lowerAbdomen: '',
    chest: '',
    arm: '',
    thigh: ''
  });

  const sorted = [...data.measurements].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const oldestWeight = [...data.measurements]
    .filter((m) => m.weight)
    .sort((a, b) => a.date.localeCompare(b.date))[0]?.weight;
  const delta = latest?.weight && oldestWeight ? latest.weight - oldestWeight : undefined;

  function numeric(value: string) {
    if (!value.trim()) return undefined;
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  function save() {
    const measurement: Measurement = {
      id: String(Date.now()),
      date: dateKey(),
      weight: numeric(form.weight),
      waist: numeric(form.waist),
      abdomen: numeric(form.abdomen),
      lowerAbdomen: numeric(form.lowerAbdomen),
      chest: numeric(form.chest),
      arm: numeric(form.arm),
      thigh: numeric(form.thigh)
    };

    const hasAny = Object.entries(measurement).some(([key, value]) => !['id', 'date'].includes(key) && typeof value === 'number');
    if (!hasAny) {
      Alert.alert('Nada para registrar', 'Preencha pelo menos um campo.');
      return;
    }

    onSaveMeasurement(measurement);
    setForm({ weight: '', waist: '', abdomen: '', lowerAbdomen: '', chest: '', arm: '', thigh: '' });
    setEditing(false);
  }

  const fields: { key: keyof typeof form; label: string; unit: string }[] = [
    { key: 'weight', label: 'Peso', unit: 'kg' },
    { key: 'waist', label: 'Cintura', unit: 'cm' },
    { key: 'abdomen', label: 'Abdômen', unit: 'cm' },
    { key: 'lowerAbdomen', label: 'Baixo ventre', unit: 'cm' },
    { key: 'chest', label: 'Peito', unit: 'cm' },
    { key: 'arm', label: 'Braço', unit: 'cm' },
    { key: 'thigh', label: 'Coxa', unit: 'cm' }
  ];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.screenScroll}>
        <HeaderPoster
          eyebrow="FRENTE DE PROGRESSO"
          title="MEDIR É AVANÇAR"
          subtitle="PESO · MEDIDAS · EVOLUÇÃO"
          speech="Sem registro, a memória inventa. Com registro, o progresso aparece."
        />

        <View style={styles.progressCards}>
          <View style={styles.progressMetric}>
            <Text style={styles.progressMetricLabel}>PESO ATUAL</Text>
            <Text style={styles.progressMetricValue}>{latest?.weight ? latest.weight.toFixed(1) : '—'}</Text>
            <Text style={styles.progressMetricUnit}>kg</Text>
          </View>
          <View style={styles.progressMetric}>
            <Text style={styles.progressMetricLabel}>VARIAÇÃO</Text>
            <Text style={styles.progressMetricValue}>
              {typeof delta === 'number' ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}` : '—'}
            </Text>
            <Text style={styles.progressMetricUnit}>kg desde o 1º registro</Text>
          </View>
        </View>

        <Button label={editing ? 'FECHAR REGISTRO' : '+ REGISTRAR PESO E MEDIDAS'} onPress={() => setEditing(!editing)} />

        {editing ? (
          <View style={styles.measureForm}>
            <Text style={styles.formTitle}>NOVO CENSO CORPORAL</Text>
            <Text style={styles.formHint}>Preencha só o que você mediu hoje.</Text>
            <View style={styles.formGrid}>
              {fields.map((field) => (
                <View key={field.key} style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <View style={styles.fieldBox}>
                    <TextInput
                      value={form[field.key]}
                      onChangeText={(value) => setForm((current) => ({ ...current, [field.key]: value }))}
                      keyboardType="decimal-pad"
                      placeholder="—"
                      placeholderTextColor={C.muted}
                      style={styles.fieldInput}
                    />
                    <Text style={styles.fieldUnit}>{field.unit}</Text>
                  </View>
                </View>
              ))}
            </View>
            <Button label="SALVAR REGISTRO" variant="dark" onPress={save} />
          </View>
        ) : null}

        <SectionStamp>LINHA DE AVANÇO · PESO</SectionStamp>
        <View style={styles.chartCard}>
          <MiniBars measurements={data.measurements} />
        </View>

        <SectionStamp>REGISTROS</SectionStamp>
        {sorted.slice(0, 10).map((m) => (
          <View key={m.id} style={styles.measureRow}>
            <View style={styles.measureDate}><Text style={styles.measureDateText}>{shortDate(m.date)}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.measureMain}>{m.weight ? `${m.weight.toFixed(1)} kg` : 'Medidas corporais'}</Text>
              <Text style={styles.measureSub}>
                {[
                  m.waist && `cintura ${m.waist}cm`,
                  m.abdomen && `abdômen ${m.abdomen}cm`,
                  m.lowerAbdomen && `baixo ventre ${m.lowerAbdomen}cm`
                ].filter(Boolean).join(' · ') || 'Outras medidas registradas'}
              </Text>
            </View>
          </View>
        ))}
        {!sorted.length ? <Text style={styles.emptyText}>Nenhuma medida registrada ainda.</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function BarracksScreen({ data }: { data: AppData }) {
  return (
    <ScrollView contentContainerStyle={styles.screenScroll}>
      <HeaderPoster
        eyebrow="QUARTEL-GENERAL"
        title="TREINO COMUNA+"
        subtitle="VERSÃO 0.1 · PRIMEIRA MARCHA"
        speech="O aplicativo organiza. Quem executa é você."
      />

      <SectionStamp>O CAMARADA</SectionStamp>
      <View style={styles.camaradaCard}>
        <Camarada size={150} />
        <View style={{ flex: 1 }}>
          <Text style={styles.camaradaTitle}>CAMARADA</Text>
          <Text style={styles.camaradaText}>
            Mascote oficial da campanha. Ele aparece para lembrar a missão, marcar progresso e cobrar apenas uma coisa: constância.
          </Text>
        </View>
      </View>

      <SectionStamp>ARQUIVO LOCAL</SectionStamp>
      <View style={styles.infoCard}>
        <Text style={styles.infoBig}>{data.workoutLogs.length}</Text>
        <Text style={styles.infoLine}>treinos registrados neste aparelho</Text>
        <Text style={styles.infoBig}>{data.measurements.length}</Text>
        <Text style={styles.infoLine}>registros corporais</Text>
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>PRIVACIDADE</Text>
        <Text style={styles.warningText}>
          Nesta versão, histórico, medidas e fotos ficam apenas no armazenamento local do aparelho. O repositório do app não recebe seus dados pessoais.
        </Text>
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>SEGURANÇA</Text>
        <Text style={styles.warningText}>
          O Treino Comuna+ organiza o treino e o registro de progresso. Ele não substitui avaliação médica nem orientação presencial de profissional de educação física.
        </Text>
      </View>
    </ScrollView>
  );
}

function FinishModal({
  visible,
  log,
  onSaved
}: {
  visible: boolean;
  log: Omit<WorkoutLog, 'photoUri'> | null;
  onSaved: (log: WorkoutLog) => void;
}) {
  const [saving, setSaving] = useState(false);

  async function persistPhoto(uri: string) {
    if (!FileSystem.documentDirectory) return uri;
    const dir = `${FileSystem.documentDirectory}post-workout/`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const extension = uri.split('.').pop()?.split('?')[0] || 'jpg';
    const destination = `${dir}${Date.now()}.${extension}`;
    await FileSystem.copyAsync({ from: uri, to: destination });
    return destination;
  }

  async function takePhoto() {
    if (!log) return;
    try {
      setSaving(true);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Câmera sem permissão', 'Autorize a câmera para registrar a foto pós-treino.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.75
      });
      if (!result.canceled && result.assets[0]?.uri) {
        const photoUri = await persistPhoto(result.assets[0].uri);
        onSaved({ ...log, photoUri });
      }
    } catch {
      Alert.alert('Não foi possível salvar a foto', 'Você pode concluir o treino sem foto e tentar novamente no próximo.');
    } finally {
      setSaving(false);
    }
  }

  if (!log) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.finishModal}>
          <View style={styles.finishStar}><Text style={styles.finishStarText}>★</Text></View>
          <Camarada size={112} />
          <Text style={styles.modalKicker}>MISSÃO CONCLUÍDA</Text>
          <Text style={styles.modalTitle}>A DISCIPLINA VENCEU HOJE.</Text>
          <Text style={styles.modalText}>
            Registre uma foto pós-treino. Ela ficará associada a este dia no calendário.
          </Text>
          <Button label={saving ? 'SALVANDO...' : '📷 TIRAR FOTO DA VITÓRIA'} onPress={takePhoto} disabled={saving} />
          <View style={{ height: 10 }} />
          <Button label="CONCLUIR SEM FOTO" variant="dark" onPress={() => onSaved(log)} disabled={saving} />
        </View>
      </View>
    </Modal>
  );
}

export default function App() {
  const todayWorkout = getWorkoutForDate() ?? workouts[0];
  const [data, setData] = useState<AppData>(emptyData);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>('missao');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout>(todayWorkout);
  const [active, setActive] = useState<{ workout: Workout; mode: 'normal' | 'minimo' } | null>(null);
  const [pendingLog, setPendingLog] = useState<Omit<WorkoutLog, 'photoUri'> | null>(null);

  useEffect(() => {
    loadAppData().then((value) => {
      setData(value);
      setLoaded(true);
    });
  }, []);

  async function persist(next: AppData) {
    setData(next);
    await saveAppData(next);
  }

  function startWorkout(workout: Workout, mode: 'normal' | 'minimo') {
    setActive({ workout, mode });
  }

  function requestFinish(log: Omit<WorkoutLog, 'photoUri'>) {
    setPendingLog(log);
  }

  async function saveFinishedWorkout(log: WorkoutLog) {
    const next = { ...data, workoutLogs: [...data.workoutLogs, log] };
    await persist(next);
    setPendingLog(null);
    setActive(null);
    setTab('calendario');
  }

  async function saveMeasurement(measurement: Measurement) {
    await persist({ ...data, measurements: [...data.measurements, measurement] });
  }

  if (!loaded) {
    return (
      <SafeAreaView style={[styles.app, styles.loading]}>
        <Camarada size={140} />
        <Text style={styles.loadingTitle}>TREINO COMUNA+</Text>
        <Text style={styles.loadingText}>ORGANIZANDO A MISSÃO...</Text>
      </SafeAreaView>
    );
  }

  if (active) {
    return (
      <>
        <WorkoutScreen
          workout={active.workout}
          mode={active.mode}
          onClose={() => setActive(null)}
          onComplete={requestFinish}
        />
        <FinishModal visible={!!pendingLog} log={pendingLog} onSaved={saveFinishedWorkout} />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar barStyle="light-content" backgroundColor={C.ink} />
      <View style={styles.content}>
        {tab === 'missao' ? (
          <HomeScreen
            data={data}
            selected={selectedWorkout}
            setSelected={setSelectedWorkout}
            startWorkout={startWorkout}
          />
        ) : null}
        {tab === 'calendario' ? <CalendarScreen data={data} /> : null}
        {tab === 'progresso' ? <ProgressScreen data={data} onSaveMeasurement={saveMeasurement} /> : null}
        {tab === 'quartel' ? <BarracksScreen data={data} /> : null}
      </View>
      <TabBar tab={tab} setTab={setTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: C.ink },
  content: { flex: 1, backgroundColor: C.inkSoft },
  loading: { alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingTitle: { color: C.cream, fontSize: 28, fontWeight: '900', letterSpacing: 1.5 },
  loadingText: { color: C.yellow, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  screenScroll: { paddingBottom: 34, backgroundColor: C.inkSoft },
  poster: {
    minHeight: 245,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    backgroundColor: C.cream,
    flexDirection: 'row',
    overflow: 'hidden',
    borderBottomWidth: 7,
    borderBottomColor: C.red
  },
  posterSlash: {
    position: 'absolute',
    width: 180,
    height: 360,
    backgroundColor: C.red,
    right: -75,
    top: -70,
    transform: [{ rotate: '17deg' }]
  },
  posterDots: {
    position: 'absolute',
    right: 24,
    top: 18,
    width: 70,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    opacity: 0.28
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.ink },
  eyebrow: { color: C.red, fontWeight: '900', letterSpacing: 2.2, fontSize: 12, marginBottom: 6 },
  posterTitle: { color: C.ink, fontSize: 34, lineHeight: 36, fontWeight: '900', letterSpacing: -1 },
  posterBanner: { alignSelf: 'flex-start', backgroundColor: C.ink, paddingHorizontal: 10, paddingVertical: 7, marginTop: 10, transform: [{ rotate: '-1deg' }] },
  posterBannerText: { color: C.cream, fontWeight: '900', fontSize: 12, letterSpacing: 0.8 },
  posterSpeech: { color: C.redDark, fontWeight: '900', fontSize: 15, lineHeight: 19, maxWidth: 230, marginTop: 18 },
  mascotWrap: { width: 105, justifyContent: 'flex-end', alignItems: 'center', zIndex: 2 },
  stamp: {
    alignSelf: 'flex-start',
    backgroundColor: C.red,
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 11,
    transform: [{ rotate: '-0.8deg' }]
  },
  stampText: { color: C.cream, fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 14 },
  statCard: { flex: 1, backgroundColor: C.ink, borderWidth: 1, borderColor: '#3B3530', padding: 12 },
  statValue: { color: C.yellow, fontWeight: '900', fontSize: 23 },
  statLabel: { color: C.paper, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginTop: 2 },
  dayRail: { paddingHorizontal: 16, gap: 8, paddingBottom: 2 },
  dayChip: { minWidth: 72, paddingVertical: 11, paddingHorizontal: 12, borderWidth: 1, borderColor: C.muted, backgroundColor: C.paper },
  dayChipActive: { backgroundColor: C.red, borderColor: C.red },
  dayChipDay: { color: C.ink, fontWeight: '900', fontSize: 15 },
  dayChipPlace: { color: C.redDark, fontWeight: '800', fontSize: 8, letterSpacing: 0.8, marginTop: 2 },
  missionCard: { margin: 16, marginTop: 12, backgroundColor: C.cream, padding: 16, borderLeftWidth: 7, borderLeftColor: C.red },
  missionTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  numberBadge: { width: 48, height: 48, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-3deg' }] },
  numberBadgeText: { color: C.white, fontSize: 24, fontWeight: '900' },
  missionKicker: { color: C.red, fontWeight: '900', fontSize: 10, letterSpacing: 1.2 },
  missionTitle: { color: C.ink, fontWeight: '900', fontSize: 22, lineHeight: 24, marginTop: 2 },
  missionSlogan: { color: C.redDark, fontWeight: '900', fontSize: 16, marginVertical: 16, borderTopWidth: 2, borderBottomWidth: 2, borderColor: C.ink, paddingVertical: 10 },
  exercisePreview: { marginBottom: 16 },
  previewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#A99878' },
  previewIndex: { width: 32, color: C.red, fontWeight: '900' },
  previewName: { flex: 1, color: C.ink, fontWeight: '800', fontSize: 13 },
  previewPrescription: { color: C.redDark, fontWeight: '900', fontSize: 12 },
  moreText: { color: C.muted, fontWeight: '800', fontSize: 11, marginTop: 8 },
  button: { minHeight: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, borderWidth: 2 },
  buttonRed: { backgroundColor: C.red, borderColor: C.redDark },
  buttonDark: { backgroundColor: C.ink, borderColor: C.ink },
  buttonCream: { backgroundColor: C.cream, borderColor: C.cream },
  buttonOutline: { backgroundColor: 'transparent', borderColor: C.cream },
  buttonText: { color: C.white, fontWeight: '900', fontSize: 13, letterSpacing: 1 },
  latestGrid: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  latestCard: { flex: 1, minHeight: 145, backgroundColor: C.ink, borderWidth: 1, borderColor: '#423B34', padding: 12 },
  latestLabel: { color: C.yellow, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  latestBig: { color: C.cream, fontSize: 22, fontWeight: '900', marginTop: 18 },
  latestSmall: { color: C.paper, fontSize: 11, marginTop: 4 },
  latestDate: { color: C.muted, fontSize: 10, marginTop: 10 },
  latestPhoto: { width: '100%', height: 105, marginTop: 8, resizeMode: 'cover' },
  photoPlaceholder: { flex: 1, marginTop: 8, borderWidth: 2, borderColor: C.red, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  photoPlaceholderText: { color: C.red, fontWeight: '900', fontSize: 11, textAlign: 'center' },
  tabBar: { height: 70, flexDirection: 'row', backgroundColor: '#090909', borderTopWidth: 2, borderTopColor: C.red },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  tabIcon: { color: C.muted, fontSize: 18, fontWeight: '900' },
  tabLabel: { color: C.muted, fontSize: 8, fontWeight: '900', letterSpacing: 0.7, marginTop: 2 },
  tabActive: { position: 'absolute', top: 0, width: 34, height: 3, backgroundColor: C.yellow },
  workoutScreen: { flex: 1, backgroundColor: C.inkSoft },
  workoutHeader: { minHeight: 94, backgroundColor: C.ink, flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 5, borderBottomColor: C.red },
  backButton: { width: 42, height: 42, borderWidth: 2, borderColor: C.cream, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  backText: { color: C.cream, fontSize: 34, lineHeight: 35 },
  workoutEyebrow: { color: C.yellow, fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  workoutTitle: { color: C.cream, fontSize: 21, fontWeight: '900', marginTop: 2 },
  workoutProgress: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.paper },
  workoutProgressText: { color: C.ink, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  progressTrack: { height: 8, backgroundColor: '#A99A7D', marginTop: 7, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.red },
  restBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.yellow, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 3, borderBottomColor: C.ink },
  restLabel: { color: C.ink, fontWeight: '900', fontSize: 9, letterSpacing: 1 },
  restTime: { color: C.ink, fontWeight: '900', fontSize: 26 },
  skipRest: { backgroundColor: C.ink, paddingHorizontal: 14, paddingVertical: 10 },
  skipRestText: { color: C.cream, fontWeight: '900', fontSize: 10 },
  workoutList: { padding: 14, paddingBottom: 40 },
  exerciseCard: { backgroundColor: C.cream, marginBottom: 12, borderWidth: 2, borderColor: C.ink, overflow: 'hidden' },
  exerciseHeader: { flexDirection: 'row', alignItems: 'stretch' },
  exerciseNumber: { width: 52, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' },
  exerciseNumberText: { color: C.white, fontSize: 25, fontWeight: '900' },
  exerciseName: { color: C.ink, fontWeight: '900', fontSize: 17, paddingTop: 10, paddingHorizontal: 10 },
  exerciseMeta: { color: C.redDark, fontWeight: '800', fontSize: 10, paddingHorizontal: 10, paddingBottom: 10 },
  equipmentSketchWrap: { backgroundColor: '#E8D9B9', borderTopWidth: 2, borderBottomWidth: 1, borderColor: '#A99878', paddingHorizontal: 8, paddingTop: 7 },
  equipmentSketchLabel: { color: C.redDark, fontSize: 8, fontWeight: '900', letterSpacing: 1.1, marginLeft: 4, marginBottom: -4 },
  exerciseNote: { color: C.ink, fontSize: 11, backgroundColor: C.yellow, padding: 8, fontWeight: '700' },
  setHead: { flexDirection: 'row', paddingHorizontal: 10, paddingTop: 10, paddingBottom: 3, gap: 6 },
  setHeadText: { color: C.muted, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#B7A888' },
  setRowDone: { backgroundColor: '#DDCFAE' },
  setIndex: { width: 34, color: C.red, fontWeight: '900', fontSize: 15 },
  setInput: { flex: 1, height: 40, borderWidth: 1, borderColor: '#8A7A5D', backgroundColor: C.white, paddingHorizontal: 9, color: C.ink, fontWeight: '800' },
  checkButton: { width: 48, height: 40, borderWidth: 2, borderColor: C.ink, alignItems: 'center', justifyContent: 'center', backgroundColor: C.white },
  checkButtonDone: { backgroundColor: C.red, borderColor: C.redDark },
  checkText: { color: C.white, fontSize: 22, fontWeight: '900' },
  finishBlock: { marginTop: 6, backgroundColor: C.ink, padding: 16, borderTopWidth: 5, borderTopColor: C.red },
  finishTitle: { color: C.yellow, fontWeight: '900', fontSize: 18, lineHeight: 21 },
  finishSub: { color: C.paper, fontSize: 11, lineHeight: 16, marginVertical: 10 },
  calendarCard: { margin: 16, backgroundColor: C.cream, padding: 12, borderWidth: 2, borderColor: C.ink },
  calendarNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  monthArrow: { width: 42, height: 42, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' },
  monthArrowText: { color: C.white, fontSize: 30, lineHeight: 32 },
  calendarMonth: { color: C.ink, fontSize: 21, fontWeight: '900', textAlign: 'center' },
  calendarYear: { color: C.redDark, fontSize: 10, fontWeight: '900', textAlign: 'center', marginTop: 2 },
  weekHeader: { flexDirection: 'row', marginBottom: 4 },
  weekHeaderText: { flex: 1, textAlign: 'center', color: C.redDark, fontWeight: '900', fontSize: 10 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: { width: '14.2857%', aspectRatio: 1, borderWidth: 1, borderColor: '#B9AA8B', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: C.white },
  calendarCellDone: { backgroundColor: C.red },
  calendarCellToday: { borderWidth: 3, borderColor: C.yellow },
  calendarDay: { color: C.ink, fontWeight: '900', fontSize: 12 },
  calendarMark: { color: C.yellow, fontSize: 12, marginTop: -1 },
  photoDot: { position: 'absolute', right: 3, top: 3, width: 6, height: 6, borderRadius: 3, backgroundColor: C.yellow },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  legendText: { color: C.muted, fontSize: 9, fontWeight: '800' },
  historyRow: { marginHorizontal: 16, marginBottom: 8, minHeight: 70, backgroundColor: C.cream, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 5, borderLeftColor: C.red },
  historyDate: { width: 58, alignSelf: 'stretch', backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  historyDateText: { color: C.yellow, fontWeight: '900', fontSize: 12 },
  historyTitle: { color: C.ink, fontWeight: '900', fontSize: 12, paddingHorizontal: 10 },
  historyMeta: { color: C.redDark, fontWeight: '700', fontSize: 10, paddingHorizontal: 10, marginTop: 3 },
  historyThumb: { width: 56, height: 56, marginRight: 7 },
  emptyText: { color: C.paper, fontSize: 12, lineHeight: 17, paddingHorizontal: 16, paddingVertical: 14 },
  progressCards: { flexDirection: 'row', gap: 8, margin: 16 },
  progressMetric: { flex: 1, backgroundColor: C.cream, padding: 14, borderTopWidth: 6, borderTopColor: C.red },
  progressMetricLabel: { color: C.redDark, fontWeight: '900', fontSize: 9, letterSpacing: 1 },
  progressMetricValue: { color: C.ink, fontWeight: '900', fontSize: 29, marginTop: 7 },
  progressMetricUnit: { color: C.muted, fontWeight: '800', fontSize: 9 },
  measureForm: { margin: 16, backgroundColor: C.paper, padding: 14, borderWidth: 2, borderColor: C.ink },
  formTitle: { color: C.ink, fontWeight: '900', fontSize: 18 },
  formHint: { color: C.redDark, fontSize: 11, fontWeight: '700', marginTop: 3, marginBottom: 12 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  fieldWrap: { width: '48%' },
  fieldLabel: { color: C.ink, fontWeight: '900', fontSize: 10, marginBottom: 4 },
  fieldBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderWidth: 1, borderColor: C.muted },
  fieldInput: { flex: 1, height: 42, paddingHorizontal: 9, color: C.ink, fontWeight: '900' },
  fieldUnit: { color: C.muted, fontSize: 9, fontWeight: '900', paddingRight: 8 },
  chartCard: { marginHorizontal: 16, backgroundColor: C.cream, minHeight: 170, padding: 12, justifyContent: 'center' },
  barChart: { height: 145, flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '72%', backgroundColor: C.red, minHeight: 30 },
  barValue: { color: C.ink, fontWeight: '900', fontSize: 8, marginBottom: 3 },
  barDate: { color: C.muted, fontSize: 7, fontWeight: '800', marginTop: 3 },
  measureRow: { marginHorizontal: 16, marginBottom: 7, backgroundColor: C.cream, minHeight: 64, flexDirection: 'row', alignItems: 'center' },
  measureDate: { width: 58, alignSelf: 'stretch', backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' },
  measureDateText: { color: C.white, fontSize: 11, fontWeight: '900' },
  measureMain: { color: C.ink, fontSize: 15, fontWeight: '900', paddingHorizontal: 10 },
  measureSub: { color: C.muted, fontSize: 9, fontWeight: '700', paddingHorizontal: 10, marginTop: 2 },
  camaradaCard: { marginHorizontal: 16, backgroundColor: C.cream, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderLeftWidth: 7, borderLeftColor: C.yellow },
  camaradaTitle: { color: C.red, fontSize: 24, fontWeight: '900' },
  camaradaText: { color: C.ink, fontSize: 11, lineHeight: 16, fontWeight: '700', marginTop: 4 },
  infoCard: { marginHorizontal: 16, backgroundColor: C.ink, padding: 16, borderWidth: 1, borderColor: '#453B31' },
  infoBig: { color: C.yellow, fontSize: 30, fontWeight: '900' },
  infoLine: { color: C.paper, fontSize: 11, marginBottom: 14 },
  warningCard: { margin: 16, marginBottom: 0, padding: 14, borderWidth: 2, borderColor: C.red, backgroundColor: C.cream },
  warningTitle: { color: C.red, fontWeight: '900', letterSpacing: 1.2, fontSize: 11 },
  warningText: { color: C.ink, fontSize: 11, lineHeight: 16, fontWeight: '700', marginTop: 6 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.82)', justifyContent: 'flex-end' },
  finishModal: { backgroundColor: C.cream, alignItems: 'center', padding: 22, paddingBottom: 34, borderTopWidth: 8, borderTopColor: C.red },
  finishStar: { position: 'absolute', right: 18, top: 18, width: 48, height: 48, borderRadius: 24, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' },
  finishStarText: { color: C.yellow, fontSize: 26 },
  modalKicker: { color: C.red, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 6 },
  modalTitle: { color: C.ink, fontSize: 24, lineHeight: 27, textAlign: 'center', fontWeight: '900', marginTop: 5 },
  modalText: { color: C.redDark, textAlign: 'center', fontSize: 11, lineHeight: 16, marginVertical: 12, maxWidth: 320 }
});
