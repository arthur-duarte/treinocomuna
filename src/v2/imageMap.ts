const RAW = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

export const exerciseImages: Record<string,string> = {
  band_row: RAW + '/Band_Pull_Apart/0.jpg',
  band_chest: RAW + '/Bench_Press_-_With_Bands/0.jpg',
  sit_to_stand: RAW + '/Bodyweight_Walking_Lunge/0.jpg',
  band_lat: RAW + '/Band_Assisted_Pull-Up/0.jpg',
  band_biceps: RAW + '/Close-Grip_EZ-Bar_Curl_with_Band/0.jpg',
  band_triceps: RAW + '/Band_Skull_Crusher/0.jpg',
  pallof: RAW + '/Pallof_Press/0.jpg',
  walk: RAW + '/Trail_Running_Walking/0.jpg',
  leg_press: RAW + '/Leg_Press/0.jpg',
  leg_curl: RAW + '/Lying_Leg_Curls/0.jpg',
  leg_extension: RAW + '/Leg_Extensions/0.jpg',
  chest_press: RAW + '/Leverage_Chest_Press/0.jpg',
  pec_deck: RAW + '/Butterfly/0.jpg',
  calf_machine: RAW + '/Calf_Press_On_The_Leg_Press_Machine/0.jpg',
  treadmill: RAW + '/Walking_Treadmill/0.jpg',
  lat_pulldown: RAW + '/Wide-Grip_Lat_Pulldown/0.jpg',
  seated_row: RAW + '/Seated_Cable_Rows/0.jpg',
  shoulder_press: RAW + '/Machine_Shoulder_Military_Press/0.jpg',
  reverse_pec_deck: RAW + '/Reverse_Flyes/0.jpg',
  cable_biceps: RAW + '/Cable_Hammer_Curls_-_Rope_Attachment/0.jpg',
  cable_triceps: RAW + '/Triceps_Pushdown_-_Rope_Attachment/0.jpg',
  lateral_raise: RAW + '/Side_Lateral_Raise/0.jpg',
  ab_machine: RAW + '/Ab_Crunch_Machine/0.jpg'
};

export function exerciseImage(key?: string) {
  if (!key) return undefined;
  return exerciseImages[key];
}
