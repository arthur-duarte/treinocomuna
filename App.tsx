import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, Image, Modal, Platform, Pressable, SafeAreaView, ScrollView, StatusBar,
  StyleSheet, Text, TextInput, View
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as NavigationBar from 'expo-navigation-bar';
import { CamaradaDog, DogMood } from './src/components/CamaradaDog';
import { defaultDataV2 } from './src/v2/defaults';
import { exerciseImage } from './src/v2/imageMap';
import { loadV2, saveV2 } from './src/v2/storage';
import {
  AppDataV2, ExerciseDef, Goal, Measurement, Preferences, WellnessLog,
  WorkoutExercise, WorkoutLog, WorkoutTemplate
} from './src/v2/models';
import {
  goalProgressRatio, levelFromXp, logsInCurrentWeek, refreshAchievements, xpForWorkout,
  computeGoalProgress, isGoalComplete
} from './src/v2/gamification';

const C = {
  bg:'#080B0D', card:'#111619', card2:'#171D20', line:'#283034',
  cream:'#F5E8C5', muted:'#9AA2A6', white:'#FFFFFF', red:'#E3172D', red2:'#A40E1C',
  gold:'#F1B52C', green:'#25C47A', blue:'#339AF0', orange:'#F08C28'
};

type Tab = 'hoje'|'treinos'|'progresso'|'historico'|'perfil';
type ProgressTab = 'peso'|'medidas'|'fotos'|'desempenho';

function keyDate(d=new Date()) {
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function brDate(k:string) {
  const [y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('pt-BR');
}
function num(v:string) {
  const n=Number(v.replace(',','.')); return Number.isFinite(n)?n:undefined;
}
function workoutForToday(data:AppDataV2) {
  const wd=new Date().getDay();
  return data.workouts.find(w=>w.weekdays.includes(wd)) || data.workouts[0];
}
function exById(data:AppDataV2,id:string) { return data.exercises.find(e=>e.id===id); }
function latestWeight(data:AppDataV2) {
  return [...data.measurements].sort((a,b)=>b.date.localeCompare(a.date)).find(m=>typeof m.weight==='number')?.weight;
}
function latestMeasurement(data:AppDataV2) {
  return [...data.measurements].sort((a,b)=>b.date.localeCompare(a.date))[0];
}
function totalDoneSets(log:WorkoutLog) { return log.exerciseLogs.flatMap(e=>e.sets).filter(s=>s.done).length; }

const Icon = ({name,active}:{name:string;active?:boolean}) =>
  <Text style={{fontSize:18,color:active?C.red:C.muted,fontWeight:'900'}}>{name}</Text>;

function BottomNav({tab,setTab}:{tab:Tab;setTab:(t:Tab)=>void}) {
  const items:[Tab,string,string][]=[
    ['hoje','⌂','Hoje'],['treinos','♧','Treinos'],['progresso','▥','Progresso'],['historico','▣','Histórico'],['perfil','◯','Perfil']
  ];
  return <View style={s.nav}>{items.map(([k,i,l])=>
    <Pressable key={k} onPress={()=>setTab(k)} style={s.navItem}>
      <Icon name={i} active={tab===k}/><Text style={[s.navLabel,tab===k&&{color:C.white}]}>{l}</Text>
    </Pressable>)}</View>;
}

function Header({title,sub}:{title:string;sub?:string}) {
  return <View style={s.header}><View><Text style={s.headerTitle}>{title}</Text>{sub?<Text style={s.headerSub}>{sub}</Text>:null}</View></View>;
}

function RedButton({text,onPress,small=false}:{text:string;onPress:()=>void;small?:boolean}) {
  return <Pressable onPress={onPress} style={[s.redButton,small&&{paddingVertical:10}]}><Text style={s.redButtonText}>{text}</Text></Pressable>;
}
function DarkButton({text,onPress}:{text:string;onPress:()=>void}) {
  return <Pressable onPress={onPress} style={s.darkButton}><Text style={s.darkButtonText}>{text}</Text></Pressable>;
}
function ProgressBar({value,color=C.gold}:{value:number;color?:string}) {
  return <View style={s.progressTrack}><View style={[s.progressFill,{width:`${Math.max(0,Math.min(1,value))*100}%`,backgroundColor:color}]}/></View>;
}

function MascotMessage({mood='inicio',text}:{mood?:DogMood;text:string}) {
  return <View style={s.mascotCard}>
    <CamaradaDog size={92} mood={mood}/>
    <View style={{flex:1}}><Text style={s.mascotName}>CAMARADA</Text><Text style={s.mascotText}>“{text}”</Text></View>
  </View>;
}

function ExerciseImage({exercise,height=150}:{exercise?:ExerciseDef;height?:number}) {
  const uri=exerciseImage(exercise?.imageKey);
  return <View style={[s.imageFrame,{height}]}>
    {uri?<Image source={{uri}} style={s.exerciseImage}/>:<View style={s.imageFallback}><Text style={s.imageFallbackText}>SEM IMAGEM</Text></View>}
    <View style={s.imageTag}><Text style={s.imageTagText}>{exercise?.equipment?.toUpperCase()||'EXERCÍCIO'}</Text></View>
  </View>;
}

function HomeScreen({data,startWorkout,setTab}:{data:AppDataV2;startWorkout:(w:WorkoutTemplate,mode:'normal'|'minimo')=>void;setTab:(t:Tab)=>void}) {
  const w=workoutForToday(data);
  const week=logsInCurrentWeek(data.workoutLogs).length;
  const level=levelFromXp(data.xp);
  const goal=data.goals.find(g=>g.type==='weight') || data.goals[0];
  const latest=latestWeight(data);
  const phrase=week===0?'Bora, camarada. Hoje é dia de avançar.':week>=data.profile.weeklyTarget?'Meta semanal cumprida. A constância venceu.':'Disciplina hoje constrói o corpo que você quer amanhã.';
  return <ScrollView contentContainerStyle={s.scroll}>
    <View style={s.brandRow}><View><Text style={s.brand}>Treino <Text style={{color:C.gold}}>Comuna+</Text></Text><Text style={s.brandSmall}>DISCIPLINA EM MOVIMENTO</Text></View><View style={s.levelMini}><Text style={s.levelMiniText}>NV {level.level}</Text></View></View>
    {data.preferences.showCamarada?<MascotMessage text={phrase}/>:null}

    <Text style={s.section}>SEU TREINO DE HOJE</Text>
    <View style={s.workoutHero}>
      <View style={{flex:1}}>
        <Text style={s.workoutPlace}>{w.place}</Text><Text style={s.workoutName}>{w.name.replace(/^[^-]+—\s*/,'')}</Text>
        <Text style={s.meta}>{w.exercises.length} exercícios · ~{Math.max(30,w.exercises.length*8)} min</Text>
      </View>
      <View style={s.roundBadge}><Text style={{color:C.gold,fontSize:23,fontWeight:'900'}}>★</Text></View>
    </View>
    <RedButton text="INICIAR TREINO" onPress={()=>startWorkout(w,'normal')}/>
    <DarkButton text="HOJE ESTOU UM CACO · MODO MÍNIMO" onPress={()=>startWorkout(w,'minimo')}/>

    <Text style={s.section}>PROGRESSO DA SEMANA <Text style={{color:C.white}}>{week}/{data.profile.weeklyTarget}</Text></Text>
    <View style={s.card}><ProgressBar value={week/data.profile.weeklyTarget}/>
      <View style={s.weekRow}>{['S','T','Q','Q','S','S','D'].map((x,i)=><View key={i} style={s.dayCol}><View style={[s.dayDot,i<week&&{backgroundColor:C.red,borderColor:C.red}]}><Text style={s.dayDotText}>{i<week?'✓':'+'}</Text></View><Text style={s.dayText}>{x}</Text></View>)}</View>
    </View>

    <View style={s.twoCols}>
      <Pressable style={s.metricCard} onPress={()=>setTab('progresso')}><Text style={s.metricLabel}>PESO ATUAL</Text><Text style={s.metricBig}>{latest?latest.toFixed(1):'—'} <Text style={s.metricUnit}>kg</Text></Text><Text style={s.metricFoot}>Ver evolução →</Text></Pressable>
      <Pressable style={s.metricCard} onPress={()=>setTab('progresso')}><Text style={s.metricLabel}>MINHA JORNADA</Text><Text style={[s.metricBig,{color:C.gold}]}>Nível {level.level}</Text><Text style={s.metricFoot}>{data.xp} XP acumulados</Text></Pressable>
    </View>

    <Text style={s.section}>META PRINCIPAL</Text>
    <View style={s.card}>
      <Text style={s.cardTitle}>{goal?.title||'Defina uma meta'}</Text>
      {goal?<><Text style={s.cardValue}>{computeGoalProgress(data,goal)} / {goal.target} {goal.unit}</Text><ProgressBar value={goalProgressRatio(data,goal)} color={isGoalComplete(data,goal)?C.green:C.gold}/><Text style={s.cardHint}>{isGoalComplete(data,goal)?'REVOLUÇÃO CONCLUÍDA ✦':'Cada treino aproxima você da meta.'}</Text></>:null}
    </View>
  </ScrollView>;
}

function WorkoutMode({data,workout,mode,onCancel,onFinish}:{data:AppDataV2;workout:WorkoutTemplate;mode:'normal'|'minimo';onCancel:()=>void;onFinish:(log:WorkoutLog)=>void}) {
  const list=mode==='minimo'?[...workout.exercises.slice(0,4).map(e=>({...e,sets:Math.min(2,e.sets)})),...(workout.exercises.find(e=>exById(data,e.exerciseId)?.category==='CARDIO')?[{...workout.exercises.find(e=>exById(data,e.exerciseId)?.category==='CARDIO')!,sets:1,reps:'10 min'}]:[])]:workout.exercises;
  const [idx,setIdx]=useState(0);
  const [logs,setLogs]=useState<Record<string,{load:string;reps:string;done:boolean}[]>>(()=>Object.fromEntries(list.map(e=>[e.id,Array.from({length:e.sets},()=>({load:'',reps:'',done:false}))])));
  const [rest,setRest]=useState(0);
  const [startedAt]=useState(Date.now());
  const item=list[idx], ex=exById(data,item.exerciseId)!;

  useEffect(()=>{ if(rest<=0)return; const t=setInterval(()=>setRest(r=>Math.max(0,r-1)),1000); return()=>clearInterval(t);},[rest]);
  useEffect(()=>{ if(Platform.OS==='android'&&data.preferences.fullscreen){ NavigationBar.setBehaviorAsync('overlay-swipe').catch(()=>{}); NavigationBar.setVisibilityAsync('hidden').catch(()=>{});} return()=>{if(Platform.OS==='android')NavigationBar.setVisibilityAsync('visible').catch(()=>{});};},[]);

  function update(si:number,key:'load'|'reps',v:string){setLogs(p=>({...p,[item.id]:p[item.id].map((x,i)=>i===si?{...x,[key]:v}:x)}));}
  function toggle(si:number){const was=logs[item.id][si].done;setLogs(p=>({...p,[item.id]:p[item.id].map((x,i)=>i===si?{...x,done:!x.done}:x)}));if(!was&&item.rest>0&&data.preferences.restAutoStart)setRest(item.rest);}
  function finish(){
    const exerciseLogs=list.map(i=>({exerciseId:i.exerciseId,sets:logs[i.id]}));
    onFinish({id:String(Date.now()),date:keyDate(),workoutId:workout.id,mode,exerciseLogs,durationMinutes:Math.max(1,Math.round((Date.now()-startedAt)/60000))});
  }
  const total=Object.values(logs).flat().length, done=Object.values(logs).flat().filter(x=>x.done).length;
  return <SafeAreaView style={s.full}><StatusBar hidden={data.preferences.fullscreen}/>
    <View style={s.workTop}><Pressable onPress={onCancel}><Text style={s.back}>‹</Text></Pressable><View style={{flex:1}}><Text style={s.workTopSmall}>{workout.name} · Exercício {idx+1} de {list.length}</Text><Text style={s.workTopTitle}>{ex.name}</Text><Text style={s.meta}>{ex.muscles?.join(' · ')}</Text></View><Text style={{color:C.gold,fontWeight:'900'}}>{done}/{total}</Text></View>
    <ScrollView contentContainerStyle={{padding:14,paddingBottom:110}}>
      <ExerciseImage exercise={ex} height={230}/>
      <View style={s.segmentRow}><Text style={s.segmentActive}>Execução</Text><Text style={s.segment}>Músculos</Text><Text style={s.segment}>Dicas</Text></View>
      <View style={s.card}>{ex.instructions.map((t,i)=><Text key={i} style={s.instruction}><Text style={{color:C.gold,fontWeight:'900'}}>{i+1} </Text>{t}</Text>)}</View>
      {ex.tips?.length?<View style={s.tip}><Text style={s.tipTitle}>DICA</Text><Text style={s.tipText}>{ex.tips.join(' ')}</Text></View>:null}
      <View style={s.setHead}><Text style={s.setHeadTxt}>SÉRIE</Text><Text style={s.setHeadTxt}>CARGA</Text><Text style={s.setHeadTxt}>REPS</Text><Text style={s.setHeadTxt}>✓</Text></View>
      {logs[item.id].map((st,si)=><View key={si} style={[s.setRow,st.done&&{borderColor:C.green}]}>
        <Text style={s.setNum}>{si+1}</Text>
        <TextInput style={s.setInput} value={st.load} onChangeText={v=>update(si,'load',v)} placeholder="kg" placeholderTextColor={C.muted} keyboardType="decimal-pad"/>
        <TextInput style={s.setInput} value={st.reps} onChangeText={v=>update(si,'reps',v)} placeholder={item.reps} placeholderTextColor={C.muted} keyboardType="number-pad"/>
        <Pressable style={[s.check,st.done&&{backgroundColor:C.green,borderColor:C.green}]} onPress={()=>toggle(si)}><Text style={{color:C.white,fontWeight:'900'}}>{st.done?'✓':'○'}</Text></Pressable>
      </View>)}
      {rest>0?<View style={s.timer}><Text style={s.timerLabel}>DESCANSO</Text><Text style={s.timerValue}>{Math.floor(rest/60)}:{String(rest%60).padStart(2,'0')}</Text><Pressable onPress={()=>setRest(0)}><Text style={s.timerSkip}>PULAR</Text></Pressable></View>:null}
    </ScrollView>
    <View style={s.workBottom}><DarkButton text="‹ ANTERIOR" onPress={()=>setIdx(Math.max(0,idx-1))}/>{idx<list.length-1?<RedButton text="PRÓXIMO ›" onPress={()=>setIdx(idx+1)}/>:<RedButton text="CONCLUIR" onPress={finish}/>}</View>
  </SafeAreaView>;
}

function Library({data,onAdd}:{data:AppDataV2;onAdd?:(ex:ExerciseDef)=>void}) {
  const [q,setQ]=useState(''); const [cat,setCat]=useState('TODOS'); const cats=['TODOS','PEITO','COSTAS','PERNAS','OMBROS','BRAÇOS','CORE','CARDIO'];
  const list=data.exercises.filter(e=>(cat==='TODOS'||e.category===cat)&&e.name.toLowerCase().includes(q.toLowerCase()));
  return <><TextInput style={s.search} value={q} onChangeText={setQ} placeholder="Buscar exercícios..." placeholderTextColor={C.muted}/>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:7,paddingBottom:10}}>{cats.map(c=><Pressable key={c} onPress={()=>setCat(c)} style={[s.filter,cat===c&&{backgroundColor:C.red,borderColor:C.red}]}><Text style={s.filterText}>{c}</Text></Pressable>)}</ScrollView>
    {list.map(ex=><Pressable key={ex.id} style={s.libraryRow} onPress={()=>onAdd?.(ex)}>
      <Image source={{uri:exerciseImage(ex.imageKey)}} style={s.libraryThumb}/><View style={{flex:1}}><Text style={s.libraryName}>{ex.name}</Text><Text style={s.libraryMeta}>{ex.category} · {ex.equipment}</Text></View><Text style={{color:C.gold,fontSize:18}}>{onAdd?'+':'☆'}</Text>
    </Pressable>)}</>;
}

function WorkoutsScreen({data,setData,startWorkout}:{data:AppDataV2;setData:(d:AppDataV2)=>void;startWorkout:(w:WorkoutTemplate,mode:'normal'|'minimo')=>void}) {
  const [showLibrary,setShowLibrary]=useState(false),[create,setCreate]=useState(false);
  const [name,setName]=useState(''),[place,setPlace]=useState<'ACADEMIA'|'CASA'|'CARDIO'|'OUTRO'>('ACADEMIA'),[picked,setPicked]=useState<WorkoutExercise[]>([]);
  function save(){
    if(!name.trim()||!picked.length){Alert.alert('Falta pouco','Dê um nome e adicione pelo menos um exercício.');return;}
    const w:WorkoutTemplate={id:'custom_'+Date.now(),name:name.trim(),place,weekdays:[],custom:true,exercises:picked};
    setData({...data,workouts:[...data.workouts,w]}); setCreate(false);setName('');setPicked([]);
  }
  return <ScrollView contentContainerStyle={s.scroll}><Header title="Treinos" sub="Personalize sua rotina"/>
    <View style={s.actionRow}><RedButton text="+ NOVO TREINO" onPress={()=>setCreate(true)}/><DarkButton text="BIBLIOTECA" onPress={()=>setShowLibrary(!showLibrary)}/></View>
    {showLibrary?<View style={s.card}><Library data={data}/></View>:null}
    <Text style={s.section}>MEUS TREINOS</Text>
    {data.workouts.map(w=><View key={w.id} style={s.templateCard}><View style={{flex:1}}><Text style={s.workoutPlace}>{w.place}</Text><Text style={s.templateName}>{w.name}</Text><Text style={s.meta}>{w.exercises.length} exercícios {w.custom?'· personalizado':''}</Text></View><Pressable onPress={()=>startWorkout(w,'normal')} style={s.playSmall}><Text style={{color:C.white,fontWeight:'900'}}>▶</Text></Pressable></View>)}
    <Text style={s.section}>MODELOS PRONTOS</Text>
    <View style={s.presetGrid}>{['3 dias academia','5 dias misto','Casa + elásticos','Treino curto 30 min'].map(x=><View key={x} style={s.preset}><Text style={s.presetTitle}>{x}</Text><Text style={s.presetText}>Modelo disponível para duplicar e editar.</Text></View>)}</View>

    <Modal visible={create} animationType="slide"><SafeAreaView style={s.modalPage}><Header title="Novo treino"/><ScrollView contentContainerStyle={s.scroll}>
      <Text style={s.fieldLabel}>Nome do treino</Text><TextInput style={s.textField} value={name} onChangeText={setName} placeholder="Ex.: PUSH A" placeholderTextColor={C.muted}/>
      <Text style={s.fieldLabel}>Tipo</Text><View style={s.chipRow}>{(['ACADEMIA','CASA','CARDIO','OUTRO'] as const).map(p=><Pressable key={p} onPress={()=>setPlace(p)} style={[s.filter,place===p&&{backgroundColor:C.red,borderColor:C.red}]}><Text style={s.filterText}>{p}</Text></Pressable>)}</View>
      <Text style={s.section}>ADICIONAR EXERCÍCIOS</Text>
      <Library data={data} onAdd={ex=>setPicked(p=>[...p,{id:'we_'+Date.now()+'_'+p.length,exerciseId:ex.id,sets:3,reps:'8–12',rest:90,rir:'2'}])}/>
      <Text style={s.section}>SELECIONADOS ({picked.length})</Text>{picked.map((p,i)=><View key={p.id} style={s.selectedRow}><Text style={s.selectedNum}>{i+1}</Text><Text style={{color:C.white,flex:1,fontWeight:'700'}}>{exById(data,p.exerciseId)?.name}</Text><Pressable onPress={()=>setPicked(a=>a.filter(x=>x.id!==p.id))}><Text style={{color:C.red,fontSize:20}}>×</Text></Pressable></View>)}
      <RedButton text="SALVAR TREINO" onPress={save}/><DarkButton text="CANCELAR" onPress={()=>setCreate(false)}/>
    </ScrollView></SafeAreaView></Modal>
  </ScrollView>;
}

function ProgressScreen({data,setData}:{data:AppDataV2;setData:(d:AppDataV2)=>void}) {
  const [tab,setTab]=useState<ProgressTab>('peso'),[show,setShow]=useState(false);
  const [form,setForm]=useState({weight:'',waist:'',abdomen:'',lowerAbdomen:'',chest:'',arm:'',thigh:'',calf:''});
  const sorted=[...data.measurements].sort((a,b)=>b.date.localeCompare(a.date)); const latest=sorted[0]; const first=[...data.measurements].reverse().find(m=>m.weight)?.weight; const lw=latest?.weight;
  async function addPhoto(){
    const perm=await ImagePicker.requestCameraPermissionsAsync(); if(!perm.granted)return;
    const r=await ImagePicker.launchCameraAsync({quality:.7}); if(!r.canceled){const m:Measurement={id:String(Date.now()),date:keyDate(),photoUri:r.assets[0].uri};setData({...data,measurements:[m,...data.measurements]});}
  }
  function save(){const m:Measurement={id:String(Date.now()),date:keyDate(),weight:num(form.weight),waist:num(form.waist),abdomen:num(form.abdomen),lowerAbdomen:num(form.lowerAbdomen),chest:num(form.chest),arm:num(form.arm),thigh:num(form.thigh),calf:num(form.calf)};setData({...data,measurements:[m,...data.measurements]});setShow(false);setForm({weight:'',waist:'',abdomen:'',lowerAbdomen:'',chest:'',arm:'',thigh:'',calf:''});}
  return <ScrollView contentContainerStyle={s.scroll}><Header title="Progresso" sub="Seu avanço em números"/>
    <View style={s.segmentTabs}>{(['peso','medidas','fotos','desempenho'] as ProgressTab[]).map(t=><Pressable key={t} onPress={()=>setTab(t)} style={[s.segTab,tab===t&&{backgroundColor:C.red}]}><Text style={s.segTabText}>{t.toUpperCase()}</Text></Pressable>)}</View>
    {tab==='peso'?<><View style={s.bigWeight}><Text style={s.bigWeightValue}>{lw?lw.toFixed(1):'—'} <Text style={{fontSize:18}}>kg</Text></Text><Text style={[s.delta,{color:first&&lw&&lw<first?C.green:C.muted}]}>{first&&lw?`${lw-first>0?'+':''}${(lw-first).toFixed(1)} kg desde o início`:'Registre seu primeiro peso'}</Text></View>
      <RedButton text="REGISTRAR PESO E MEDIDAS" onPress={()=>setShow(!show)}/></>:null}
    {show?<View style={s.card}>{Object.entries(form).map(([k,v])=><TextInput key={k} style={s.textField} value={v} onChangeText={x=>setForm(f=>({...f,[k]:x}))} placeholder={({weight:'Peso (kg)',waist:'Cintura (cm)',abdomen:'Abdômen (cm)',lowerAbdomen:'Baixo ventre / púbis (cm)',chest:'Peito (cm)',arm:'Braço (cm)',thigh:'Coxa (cm)',calf:'Panturrilha (cm)'} as any)[k]} placeholderTextColor={C.muted} keyboardType="decimal-pad"/>)}<RedButton text="SALVAR REGISTRO" onPress={save}/></View>:null}
    {tab==='medidas'?<View style={s.card}>{['waist','abdomen','lowerAbdomen','chest','arm','thigh','calf'].map(k=><View key={k} style={s.measureLine}><Text style={s.measureName}>{{waist:'Cintura',abdomen:'Abdômen',lowerAbdomen:'Baixo ventre',chest:'Peito',arm:'Braço',thigh:'Coxa',calf:'Panturrilha'}[k as keyof typeof latest]||k}</Text><Text style={s.measureValue}>{(latest as any)?.[k]??'—'} cm</Text></View>)}</View>:null}
    {tab==='fotos'?<><RedButton text="📷 NOVA FOTO DE PROGRESSO" onPress={addPhoto}/><View style={s.photoGrid}>{sorted.filter(m=>m.photoUri).map(m=><View key={m.id} style={s.photoCard}><Image source={{uri:m.photoUri}} style={s.progressPhoto}/><Text style={s.photoDate}>{brDate(m.date)}</Text></View>)}</View></>:null}
    {tab==='desempenho'?<><View style={s.twoCols}><View style={s.metricCard}><Text style={s.metricLabel}>TREINOS</Text><Text style={s.metricBig}>{data.workoutLogs.length}</Text></View><View style={s.metricCard}><Text style={s.metricLabel}>XP</Text><Text style={[s.metricBig,{color:C.gold}]}>{data.xp}</Text></View></View><Text style={s.section}>CARGAS RECENTES</Text>{data.workoutLogs.slice(0,8).map(l=><View key={l.id} style={s.historyLine}><Text style={s.historyDate}>{brDate(l.date)}</Text><Text style={s.historyName}>{data.workouts.find(w=>w.id===l.workoutId)?.name}</Text><Text style={s.historyMeta}>{totalDoneSets(l)} séries</Text></View>)}</>:null}
  </ScrollView>;
}

function HistoryScreen({data}:{data:AppDataV2}) {
  const now=new Date(), y=now.getFullYear(), m=now.getMonth(), first=new Date(y,m,1).getDay(), days=new Date(y,m+1,0).getDate();
  const cells:[number|null][]=[...Array(first).fill(null),...Array.from({length:days},(_,i)=>i+1)]; while(cells.length%7)cells.push(null);
  return <ScrollView contentContainerStyle={s.scroll}><Header title="Histórico / Calendário" sub={now.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}/>
    <View style={s.card}><View style={s.calWeek}>{['D','S','T','Q','Q','S','S'].map((x,i)=><Text key={i} style={s.calWeekText}>{x}</Text>)}</View><View style={s.calGrid}>{cells.map((d,i)=>{if(!d)return <View key={i} style={s.calCell}/>;const k=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;const has=data.workoutLogs.some(l=>l.date===k);return <View key={i} style={[s.calCell,has&&{backgroundColor:C.green}]}><Text style={s.calDay}>{d}</Text>{has?<Text style={s.calStar}>✓</Text>:null}</View>;})}</View></View>
    <Text style={s.section}>TREINOS CONCLUÍDOS</Text>{[...data.workoutLogs].sort((a,b)=>b.date.localeCompare(a.date)).map(l=><View key={l.id} style={s.historyLine}><Text style={s.historyDate}>{brDate(l.date)}</Text><View style={{flex:1}}><Text style={s.historyName}>{data.workouts.find(w=>w.id===l.workoutId)?.name||'Treino'}</Text><Text style={s.historyMeta}>{l.mode==='minimo'?'Modo mínimo':'Completo'} · {l.durationMinutes||'—'} min · {totalDoneSets(l)} séries</Text></View>{l.photoUri?<Image source={{uri:l.photoUri}} style={s.historyThumb}/>:null}</View>)}
  </ScrollView>;
}

function Journey({data}:{data:AppDataV2}) {
  const level=levelFromXp(data.xp); const ach=refreshAchievements(data);
  return <><View style={s.journeyTop}><CamaradaDog size={120} mood="conquista"/><Text style={s.journeyLevel}>Nível {level.level}</Text><Text style={s.journeyTitle}>Disciplina em Movimento</Text><ProgressBar value={level.progress}/><Text style={s.journeyXp}>{level.current} / {level.needed} XP</Text></View>
    <View style={s.threeCols}><View style={s.smallStat}><Text style={s.smallStatValue}>{logsInCurrentWeek(data.workoutLogs).length}</Text><Text style={s.smallStatLabel}>Treinos semana</Text></View><View style={s.smallStat}><Text style={s.smallStatValue}>{data.workoutLogs.length}</Text><Text style={s.smallStatLabel}>Treinos total</Text></View><View style={s.smallStat}><Text style={s.smallStatValue}>{data.achievements.filter(a=>a.unlockedAt).length}</Text><Text style={s.smallStatLabel}>Conquistas</Text></View></View>
    <Text style={s.section}>CONQUISTAS</Text>{ach.map(a=><View key={a.id} style={[s.achievement,!a.unlockedAt&&{opacity:.45}]}><View style={s.achIcon}><Text style={{color:C.gold,fontWeight:'900'}}>{a.icon}</Text></View><View style={{flex:1}}><Text style={s.achTitle}>{a.title}</Text><Text style={s.achDesc}>{a.description}</Text></View><Text style={{color:a.unlockedAt?C.green:C.muted}}>{a.unlockedAt?'✓':'○'}</Text></View>)}</>;
}

function ProfileScreen({data,setData}:{data:AppDataV2;setData:(d:AppDataV2)=>void}) {
  const [view,setView]=useState<'menu'|'journey'|'goals'|'wellness'|'settings'>('menu');
  const [goalType,setGoalType]=useState<'weight'|'weekly_workouts'|'active_months'|'workout_count'>('weight'),[goalTarget,setGoalTarget]=useState('');
  const [well,setWell]=useState({sleep:'',water:'',glucose:'',note:''});
  function pref<K extends keyof Preferences>(k:K,v:Preferences[K]){setData({...data,preferences:{...data.preferences,[k]:v}});}
  if(view==='journey')return <ScrollView contentContainerStyle={s.scroll}><Header title="Minha Jornada"/><Journey data={data}/><DarkButton text="VOLTAR" onPress={()=>setView('menu')}/></ScrollView>;
  if(view==='goals')return <ScrollView contentContainerStyle={s.scroll}><Header title="Metas e Conquistas"/>{data.goals.map(g=><View key={g.id} style={s.card}><Text style={s.cardTitle}>{g.title}</Text><Text style={s.cardValue}>{computeGoalProgress(data,g)} / {g.target} {g.unit}</Text><ProgressBar value={goalProgressRatio(data,g)} color={isGoalComplete(data,g)?C.green:C.gold}/>{isGoalComplete(data,g)?<Text style={s.revolution}>REVOLUÇÃO CONCLUÍDA ✦</Text>:null}</View>)}<Text style={s.section}>NOVA META</Text><View style={s.chipRow}>{(['weight','weekly_workouts','active_months','workout_count'] as const).map(t=><Pressable key={t} onPress={()=>setGoalType(t)} style={[s.filter,goalType===t&&{backgroundColor:C.red,borderColor:C.red}]}><Text style={s.filterText}>{t==='weight'?'PESO':t==='weekly_workouts'?'FREQUÊNCIA':t==='active_months'?'MESES':'TREINOS'}</Text></Pressable>)}</View><TextInput style={s.textField} value={goalTarget} onChangeText={setGoalTarget} placeholder="Valor da meta" placeholderTextColor={C.muted} keyboardType="decimal-pad"/><RedButton text="CRIAR META" onPress={()=>{const t=num(goalTarget);if(!t)return;const start=goalType==='weight'?latestWeight(data):undefined;const g:Goal={id:'goal_'+Date.now(),type:goalType,title:goalType==='weight'?`Chegar a ${t} kg`:goalType==='weekly_workouts'?`${t} treinos por semana`:goalType==='active_months'?`${t} meses ativos`:`${t} treinos concluídos`,target:t,startValue:start,unit:goalType==='weight'?'kg':goalType==='active_months'?'meses':'treinos'};setData({...data,goals:[...data.goals,g]});setGoalTarget('');}}/><DarkButton text="VOLTAR" onPress={()=>setView('menu')}/></ScrollView>;
  if(view==='wellness')return <ScrollView contentContainerStyle={s.scroll}><Header title="Bem-estar" sub="Registro opcional"/>{[['sleep','Sono (horas)'],['water','Água (L)'],['glucose','Glicemia opcional']].map(([k,p])=><TextInput key={k} style={s.textField} value={(well as any)[k]} onChangeText={v=>setWell(x=>({...x,[k]:v}))} placeholder={p} placeholderTextColor={C.muted} keyboardType="decimal-pad"/>)}<TextInput style={[s.textField,{height:100}]} multiline value={well.note} onChangeText={v=>setWell(x=>({...x,note:v}))} placeholder="Observação do dia" placeholderTextColor={C.muted}/><RedButton text="SALVAR BEM-ESTAR" onPress={()=>{const w:WellnessLog={id:String(Date.now()),date:keyDate(),sleepHours:num(well.sleep),waterLiters:num(well.water),glucose:num(well.glucose),note:well.note};setData({...data,wellness:[w,...data.wellness]});setWell({sleep:'',water:'',glucose:'',note:''});}}/>{data.wellness.slice(0,8).map(w=><View key={w.id} style={s.historyLine}><Text style={s.historyDate}>{brDate(w.date)}</Text><Text style={s.historyName}>{w.sleepHours?`Sono ${w.sleepHours}h · `:''}{w.waterLiters?`Água ${w.waterLiters}L`:''}</Text></View>)}<DarkButton text="VOLTAR" onPress={()=>setView('menu')}/></ScrollView>;
  if(view==='settings')return <ScrollView contentContainerStyle={s.scroll}><Header title="Personalização"/><Text style={s.section}>EXPERIÊNCIA</Text>
    {[['fullscreen','Tela cheia no treino'],['restAutoStart','Descanso automático'],['showCamarada','Mostrar o Camarada']].map(([k,l])=><Pressable key={k} style={s.settingRow} onPress={()=>pref(k as any,!(data.preferences as any)[k])}><Text style={s.settingText}>{l}</Text><Text style={{color:(data.preferences as any)[k]?C.green:C.muted,fontWeight:'900'}}>{(data.preferences as any)[k]?'LIGADO':'DESLIGADO'}</Text></Pressable>)}
    <Text style={s.section}>GAMIFICAÇÃO</Text><View style={s.chipRow}>{(['completa','leve','desligada'] as const).map(g=><Pressable key={g} onPress={()=>pref('gamification',g)} style={[s.filter,data.preferences.gamification===g&&{backgroundColor:C.red,borderColor:C.red}]}><Text style={s.filterText}>{g.toUpperCase()}</Text></Pressable>)}</View>
    <Text style={s.section}>TOM DO CAMARADA</Text><View style={s.chipRow}>{(['ordem','apoio','misto'] as const).map(g=><Pressable key={g} onPress={()=>pref('camaradaStyle',g)} style={[s.filter,data.preferences.camaradaStyle===g&&{backgroundColor:C.red,borderColor:C.red}]}><Text style={s.filterText}>{g.toUpperCase()}</Text></Pressable>)}</View><DarkButton text="VOLTAR" onPress={()=>setView('menu')}/></ScrollView>;
  return <ScrollView contentContainerStyle={s.scroll}><Header title="Perfil e Configurações"/><View style={s.profileHero}><CamaradaDog size={88}/><View><Text style={s.profileName}>{data.profile.name}</Text><Text style={s.meta}>Nível {levelFromXp(data.xp).level} · {data.xp} XP</Text></View></View>
    {[['journey','★','Minha Jornada'],['goals','◎','Meus objetivos'],['wellness','♥','Bem-estar'],['settings','⚙','Personalização do app']].map(([k,i,l])=><Pressable key={k} style={s.menuRow} onPress={()=>setView(k as any)}><Text style={s.menuIcon}>{i}</Text><Text style={s.menuText}>{l}</Text><Text style={s.menuArrow}>›</Text></Pressable>)}
    <Text style={s.section}>DADOS</Text><View style={s.settingRow}><Text style={s.settingText}>Objetivo</Text><Text style={{color:C.gold,fontWeight:'900'}}>{data.profile.objective}</Text></View><View style={s.settingRow}><Text style={s.settingText}>Meta semanal</Text><Text style={{color:C.white,fontWeight:'900'}}>{data.profile.weeklyTarget} treinos</Text></View>
  </ScrollView>;
}

function FinishModal({visible,data,log,onSave}:{visible:boolean;data:AppDataV2;log:WorkoutLog|null;onSave:(l:WorkoutLog)=>void}) {
  async function photo(){if(!log)return;const p=await ImagePicker.requestCameraPermissionsAsync();if(!p.granted)return;const r=await ImagePicker.launchCameraAsync({quality:.72});if(!r.canceled)onSave({...log,photoUri:r.assets[0].uri});}
  if(!log)return null;
  return <Modal visible={visible} transparent animationType="slide"><View style={s.modalShade}><View style={s.finish}><CamaradaDog size={116} mood="vitoria"/><Text style={s.finishTitle}>TREINO CONCLUÍDO!</Text><Text style={s.finishText}>Mais um passo na revolução. Excelente trabalho, camarada.</Text><RedButton text="📷 FOTO DA VITÓRIA" onPress={photo}/><DarkButton text="CONCLUIR SEM FOTO" onPress={()=>onSave(log)}/></View></View></Modal>;
}

export default function App(){
  const [data,setDataRaw]=useState<AppDataV2>(defaultDataV2),[loaded,setLoaded]=useState(false),[tab,setTab]=useState<Tab>('hoje');
  const [active,setActive]=useState<{w:WorkoutTemplate;mode:'normal'|'minimo'}|null>(null),[pending,setPending]=useState<WorkoutLog|null>(null);
  useEffect(()=>{loadV2().then(d=>{setDataRaw(d);setLoaded(true);});},[]);
  function setData(d:AppDataV2){const next={...d,achievements:refreshAchievements(d)};setDataRaw(next);saveV2(next);}
  function finish(log:WorkoutLog){setPending(log);}
  function saveFinish(log:WorkoutLog){const xp=data.preferences.gamification==='desligada'?0:xpForWorkout(log.mode,!!log.photoUri);const next={...data,workoutLogs:[log,...data.workoutLogs],xp:data.xp+xp};setData(next);setPending(null);setActive(null);setTab('historico');}
  if(!loaded)return <SafeAreaView style={[s.full,{alignItems:'center',justifyContent:'center'}]}><CamaradaDog size={130}/><Text style={s.brand}>Treino <Text style={{color:C.gold}}>Comuna+</Text></Text><Text style={s.meta}>ORGANIZANDO A MISSÃO...</Text></SafeAreaView>;
  if(active)return <><WorkoutMode data={data} workout={active.w} mode={active.mode} onCancel={()=>setActive(null)} onFinish={finish}/><FinishModal visible={!!pending} data={data} log={pending} onSave={saveFinish}/></>;
  return <SafeAreaView style={s.full}><StatusBar barStyle="light-content" backgroundColor={C.bg}/><View style={{flex:1}}>
    {tab==='hoje'?<HomeScreen data={data} startWorkout={(w,mode)=>setActive({w,mode})} setTab={setTab}/>:null}
    {tab==='treinos'?<WorkoutsScreen data={data} setData={setData} startWorkout={(w,mode)=>setActive({w,mode})}/>:null}
    {tab==='progresso'?<ProgressScreen data={data} setData={setData}/>:null}
    {tab==='historico'?<HistoryScreen data={data}/>:null}
    {tab==='perfil'?<ProfileScreen data={data} setData={setData}/>:null}
  </View><BottomNav tab={tab} setTab={setTab}/></SafeAreaView>;
}

const s=StyleSheet.create({
  full:{flex:1,backgroundColor:C.bg},scroll:{padding:16,paddingBottom:34,backgroundColor:C.bg},
  brandRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:14},brand:{color:C.white,fontSize:27,fontWeight:'900'},brandSmall:{color:C.muted,fontSize:8,fontWeight:'900',letterSpacing:2},levelMini:{width:48,height:48,borderRadius:24,borderWidth:3,borderColor:C.gold,alignItems:'center',justifyContent:'center'},levelMiniText:{color:C.gold,fontWeight:'900',fontSize:11},
  header:{paddingVertical:8,marginBottom:12},headerTitle:{color:C.white,fontSize:25,fontWeight:'900'},headerSub:{color:C.gold,fontSize:11,fontWeight:'700',marginTop:3},
  nav:{height:68,flexDirection:'row',backgroundColor:'#07090A',borderTopWidth:1,borderTopColor:C.line},navItem:{flex:1,alignItems:'center',justifyContent:'center',gap:3},navLabel:{color:C.muted,fontSize:9,fontWeight:'700'},
  mascotCard:{minHeight:122,backgroundColor:C.red2,borderRadius:16,padding:12,flexDirection:'row',gap:12,alignItems:'center',overflow:'hidden'},mascotName:{color:C.gold,fontSize:10,fontWeight:'900',letterSpacing:1.4},mascotText:{color:C.white,fontSize:16,lineHeight:21,fontWeight:'800',marginTop:4},
  section:{color:C.gold,fontSize:11,fontWeight:'900',letterSpacing:1.2,marginTop:20,marginBottom:8},
  workoutHero:{backgroundColor:C.card,borderRadius:14,borderWidth:1,borderColor:C.line,padding:14,flexDirection:'row',alignItems:'center',marginBottom:10},workoutPlace:{color:C.red,fontSize:9,fontWeight:'900',letterSpacing:1},workoutName:{color:C.white,fontSize:20,fontWeight:'900',marginTop:2},meta:{color:C.muted,fontSize:10,marginTop:3},roundBadge:{width:50,height:50,borderRadius:25,borderWidth:2,borderColor:C.gold,alignItems:'center',justifyContent:'center'},
  redButton:{backgroundColor:C.red,paddingVertical:14,paddingHorizontal:16,borderRadius:9,alignItems:'center',justifyContent:'center',marginTop:8,flex:1},redButtonText:{color:C.white,fontSize:12,fontWeight:'900',letterSpacing:.7},
  darkButton:{backgroundColor:C.card2,paddingVertical:14,paddingHorizontal:16,borderRadius:9,alignItems:'center',justifyContent:'center',marginTop:8,borderWidth:1,borderColor:C.line,flex:1},darkButtonText:{color:C.white,fontSize:11,fontWeight:'900'},
  card:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:14,padding:14,marginBottom:10},cardTitle:{color:C.white,fontSize:15,fontWeight:'900'},cardValue:{color:C.white,fontSize:23,fontWeight:'900',marginTop:7,marginBottom:9},cardHint:{color:C.muted,fontSize:10,marginTop:8},progressTrack:{height:8,backgroundColor:'#343A3D',borderRadius:8,overflow:'hidden'},progressFill:{height:'100%',borderRadius:8},
  weekRow:{flexDirection:'row',justifyContent:'space-between',marginTop:14},dayCol:{alignItems:'center',gap:5},dayDot:{width:30,height:30,borderRadius:15,borderWidth:1,borderColor:C.line,alignItems:'center',justifyContent:'center'},dayDotText:{color:C.white,fontWeight:'900'},dayText:{color:C.muted,fontSize:9},
  twoCols:{flexDirection:'row',gap:9},threeCols:{flexDirection:'row',gap:8,marginTop:12},metricCard:{flex:1,backgroundColor:C.card,borderRadius:13,borderWidth:1,borderColor:C.line,padding:13},metricLabel:{color:C.muted,fontSize:9,fontWeight:'900'},metricBig:{color:C.white,fontSize:23,fontWeight:'900',marginTop:8},metricUnit:{fontSize:11},metricFoot:{color:C.red,fontSize:9,fontWeight:'700',marginTop:8},
  workTop:{padding:12,flexDirection:'row',alignItems:'center',gap:10,borderBottomWidth:1,borderBottomColor:C.line},back:{color:C.white,fontSize:34},workTopSmall:{color:C.muted,fontSize:9},workTopTitle:{color:C.white,fontSize:22,fontWeight:'900'},imageFrame:{backgroundColor:C.card,borderRadius:14,overflow:'hidden',borderWidth:1,borderColor:C.line},exerciseImage:{width:'100%',height:'100%',resizeMode:'cover'},imageFallback:{flex:1,alignItems:'center',justifyContent:'center'},imageFallbackText:{color:C.muted,fontWeight:'900'},imageTag:{position:'absolute',bottom:8,left:8,backgroundColor:'rgba(0,0,0,.72)',paddingHorizontal:8,paddingVertical:5,borderRadius:6},imageTagText:{color:C.gold,fontSize:8,fontWeight:'900'},
  segmentRow:{flexDirection:'row',gap:8,marginTop:10},segment:{flex:1,textAlign:'center',backgroundColor:C.card,paddingVertical:9,borderRadius:8,color:C.muted,fontSize:9,fontWeight:'900'},segmentActive:{flex:1,textAlign:'center',backgroundColor:C.red,paddingVertical:9,borderRadius:8,color:C.white,fontSize:9,fontWeight:'900'},
  instruction:{color:C.cream,fontSize:12,lineHeight:20},tip:{backgroundColor:'#2A210B',borderWidth:1,borderColor:'#5E4A13',padding:11,borderRadius:9,marginBottom:10},tipTitle:{color:C.gold,fontWeight:'900',fontSize:9},tipText:{color:C.cream,fontSize:11,marginTop:3},
  setHead:{flexDirection:'row',paddingHorizontal:8,marginBottom:4},setHeadTxt:{flex:1,color:C.muted,fontSize:8,fontWeight:'900',textAlign:'center'},setRow:{flexDirection:'row,gap:7,alignItems:'center',backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:8,padding:7,marginBottom:6},setNum:{width:26,color:C.gold,fontWeight:'900',textAlign:'center'},setInput:{flex:1,height:40,backgroundColor:C.card2,borderRadius:6,paddingHorizontal:8,color:C.white,textAlign:'center',fontWeight:'800'},check:{width:42,height:40,borderRadius:6,borderWidth:1,borderColor:C.line,alignItems:'center',justifyContent:'center'},timer:{marginTop:12,backgroundColor:'#1A1609',borderWidth:1,borderColor:C.gold,borderRadius:12,padding:13,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},timerLabel:{color:C.gold,fontSize:9,fontWeight:'900'},timerValue:{color:C.gold,fontSize:26,fontWeight:'900'},timerSkip:{color:C.white,fontSize:10,fontWeight:'900'},workBottom:{position:'absolute',bottom:0,left:0,right:0,backgroundColor:C.bg,borderTopWidth:1,borderTopColor:C.line,padding:10,flexDirection:'row',gap:8},
  actionRow:{flexDirection:'row',gap:8},search:{height:44,borderRadius:10,borderWidth:1,borderColor:C.line,backgroundColor:C.card2,color:C.white,paddingHorizontal:12,marginBottom:9},filter:{borderWidth:1,borderColor:C.line,backgroundColor:C.card,paddingHorizontal:11,paddingVertical:8,borderRadius:16},filterText:{color:C.white,fontSize:9,fontWeight:'800'},libraryRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:8,borderBottomWidth:1,borderBottomColor:C.line},libraryThumb:{width:64,height:50,borderRadius:8,backgroundColor:C.card2},libraryName:{color:C.white,fontWeight:'900',fontSize:12},libraryMeta:{color:C.muted,fontSize:9,marginTop:2},
  templateCard:{backgroundColor:C.card,borderRadius:12,borderWidth:1,borderColor:C.line,padding:12,marginBottom:8,flexDirection:'row',alignItems:'center'},templateName:{color:C.white,fontSize:15,fontWeight:'900'},playSmall:{width:42,height:42,borderRadius:21,backgroundColor:C.red,alignItems:'center',justifyContent:'center'},presetGrid:{flexDirection:'row',flexWrap:'wrap',gap:8},preset:{width:'48%',backgroundColor:C.card,borderRadius:11,padding:12,borderWidth:1,borderColor:C.line},presetTitle:{color:C.white,fontWeight:'900',fontSize:12},presetText:{color:C.muted,fontSize:9,lineHeight:13,marginTop:4},modalPage:{flex:1,backgroundColor:C.bg},fieldLabel:{color:C.gold,fontSize:9,fontWeight:'900',marginTop:8,marginBottom:5},textField:{height:46,borderRadius:9,borderWidth:1,borderColor:C.line,backgroundColor:C.card2,color:C.white,paddingHorizontal:11,marginBottom:9},chipRow:{flexDirection:'row',gap:6,flexWrap:'wrap',marginBottom:8},selectedRow:{flexDirection:'row',alignItems:'center',gap:8,backgroundColor:C.card,padding:10,borderRadius:8,marginBottom:6},selectedNum:{color:C.gold,fontWeight:'900',width:22},
  segmentTabs:{flexDirection:'row',gap:5,marginBottom:12},segTab:{flex:1,backgroundColor:C.card,paddingVertical:9,borderRadius:9,alignItems:'center'},segTabText:{color:C.white,fontSize:8,fontWeight:'900'},bigWeight:{backgroundColor:C.card,borderRadius:14,padding:18,marginBottom:9},bigWeightValue:{color:C.white,fontSize:42,fontWeight:'900'},delta:{fontSize:10,fontWeight:'800',marginTop:3},measureLine:{flexDirection:'row',justifyContent:'space-between',paddingVertical:10,borderBottomWidth:1,borderBottomColor:C.line},measureName:{color:C.muted,fontSize:11},measureValue:{color:C.white,fontWeight:'900'},photoGrid:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:12},photoCard:{width:'48%',backgroundColor:C.card,padding:5,borderRadius:10},progressPhoto:{width:'100%',height:190,borderRadius:7},photoDate:{color:C.muted,fontSize:9,padding:5},
  historyLine:{backgroundColor:C.card,borderRadius:10,borderWidth:1,borderColor:C.line,padding:11,marginBottom:7,flexDirection:'row',alignItems:'center',gap:10},historyDate:{color:C.gold,fontWeight:'900',fontSize:10,width:68},historyName:{color:C.white,fontWeight:'900',fontSize:11,flex:1},historyMeta:{color:C.muted,fontSize:9},historyThumb:{width:48,height:48,borderRadius:7},
  calWeek:{flexDirection:'row'},calWeekText:{flex:1,textAlign:'center',color:C.muted,fontSize:9,fontWeight:'900'},calGrid:{flexDirection:'row',flexWrap:'wrap',marginTop:7},calCell:{width:'14.2857%',aspectRatio:1,alignItems:'center',justifyContent:'center',borderRadius:22},calDay:{color:C.white,fontWeight:'800'},calStar:{color:C.white,fontSize:8},
  journeyTop:{alignItems:'center',backgroundColor:C.card,borderRadius:18,padding:18,borderWidth:1,borderColor:C.line},journeyLevel:{color:C.gold,fontSize:26,fontWeight:'900',marginTop:4},journeyTitle:{color:C.white,fontSize:12,fontWeight:'800',marginBottom:10},journeyXp:{color:C.muted,fontSize:9,marginTop:5},smallStat:{flex:1,backgroundColor:C.card,borderRadius:12,padding:10,alignItems:'center'},smallStatValue:{color:C.gold,fontSize:20,fontWeight:'900'},smallStatLabel:{color:C.muted,fontSize:8,textAlign:'center',marginTop:3},achievement:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:C.card,borderRadius:11,padding:10,marginBottom:7},achIcon:{width:42,height:42,borderRadius:21,borderWidth:2,borderColor:C.gold,alignItems:'center',justifyContent:'center'},achTitle:{color:C.white,fontSize:11,fontWeight:'900'},achDesc:{color:C.muted,fontSize:9,marginTop:2},revolution:{color:C.green,fontWeight:'900',fontSize:12,marginTop:8},
  profileHero:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:C.card,borderRadius:14,padding:12,marginBottom:10},profileName:{color:C.white,fontWeight:'900',fontSize:18},menuRow:{height:54,backgroundColor:C.card,borderBottomWidth:1,borderBottomColor:C.line,flexDirection:'row',alignItems:'center',paddingHorizontal:12},menuIcon:{color:C.gold,width:32,fontSize:17},menuText:{color:C.white,flex:1,fontWeight:'700'},menuArrow:{color:C.muted,fontSize:24},settingRow:{minHeight:52,backgroundColor:C.card,borderBottomWidth:1,borderBottomColor:C.line,paddingHorizontal:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},settingText:{color:C.white,fontWeight:'700'},
  modalShade:{flex:1,backgroundColor:'rgba(0,0,0,.82)',justifyContent:'flex-end'},finish:{backgroundColor:C.card,padding:24,alignItems:'center',borderTopLeftRadius:24,borderTopRightRadius:24},finishTitle:{color:C.white,fontSize:25,fontWeight:'900',marginTop:9},finishText:{color:C.cream,textAlign:'center',lineHeight:19,marginVertical:8}
});
