import test from 'node:test';import assert from 'node:assert/strict';
import {AXES,TICKS,changeLevel,normalizeState,pointToLevel} from '../site/product-picker/three/model.js';
test('income and reliability are inverse at every stop, in both directions',()=>{
 for(let income=0;income<3;income++)for(let withdrawal=0;withdrawal<3;withdrawal++)for(const axis of ['income','reliability'])for(let target=0;target<3;target++){
  const before=normalizeState({levelsVersion:2,income,withdrawal});
  const {state}=changeLevel(before,axis,target);
  assert.equal(state[axis],target);assert.equal(state.income+state.reliability,2);assert.equal(state.withdrawal,withdrawal);
  assert.ok(AXES.every(key=>Number.isInteger(state[key])&&state[key]>=0&&state[key]<=2));
 }
});
test('withdrawal is independent for all combinations, including maxima',()=>{
 for(let income=0;income<3;income++)for(let withdrawal=0;withdrawal<3;withdrawal++)for(let target=0;target<3;target++){
  const before=normalizeState({levelsVersion:2,income,withdrawal});
  const {state,adjusted}=changeLevel(before,'withdrawal',target);
  assert.equal(state.income,before.income);assert.equal(state.reliability,before.reliability);assert.equal(state.withdrawal,target);assert.equal(adjusted,null);
 }
 assert.deepEqual(AXES.map(key=>changeLevel({income:2,withdrawal:0},'withdrawal',2).state[key]),[2,0,2]);
});
test('old four-stop sessions migrate and new sessions remain stable',()=>{
 for(let income=0;income<4;income++)for(let withdrawal=0;withdrawal<4;withdrawal++){
  const migrated=normalizeState({income,reliability:3-income,withdrawal,touched:[1,2,3]});
  assert.equal(migrated.income,Math.round(income*2/3));assert.equal(migrated.withdrawal,Math.round(withdrawal*2/3));assert.equal(migrated.reliability,2-migrated.income);
  assert.deepEqual(normalizeState(migrated),migrated);
 }
 assert.equal(normalizeState({income:0,reliability:0}).reliability,2);
 assert.deepEqual(normalizeState(),{levelsVersion:2,income:1,reliability:1,withdrawal:1,cardIndex:0,guideStep:0});
});
test('history snapshots preserve the selected point across variants',()=>{
 for(let income=0;income<3;income++)for(let withdrawal=0;withdrawal<3;withdrawal++){
  const before=normalizeState({levelsVersion:2,income,withdrawal});
  assert.deepEqual(normalizeState({...before,risk:income/2,access:1-withdrawal/2}),before);
 }
 const changed=normalizeState({levelsVersion:2,income:1,withdrawal:1,risk:1,access:0});
 assert.deepEqual(AXES.map(key=>changed[key]),[2,0,2]);
});
test('pointer positions snap to only three dots and clamp outside the rail',()=>{
 assert.deepEqual(TICKS.map(pointToLevel),[0,1,2]);
 assert.deepEqual([-100,25,98.24,98.26,171.5,244.74,244.76,318,500].map(pointToLevel),[0,0,0,1,1,1,2,2,2]);
});
