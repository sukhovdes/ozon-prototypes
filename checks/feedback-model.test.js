import test from 'node:test';
import assert from 'node:assert/strict';
import {labelStrengths,rateRange,rateChange} from '../site/product-picker/feedback/model.js';

test('center is neutral and a corner emphasizes exactly its two nearest parameters',()=>{
 assert.deepEqual(labelStrengths(1,1),{top:0,bottom:0,left:0,right:0});
 assert.deepEqual(labelStrengths(0,2),{top:1,bottom:0,left:0,right:1});
 assert.deepEqual(labelStrengths(2,0),{top:0,bottom:1,left:1,right:0});
});
test('proximity follows the unsnapped pointer and clamps outside the field',()=>{
 assert.deepEqual(labelStrengths(.25,1.5),{top:.75,bottom:0,left:0,right:.5});
 assert.deepEqual(labelStrengths(-4,9),{top:1,bottom:0,left:0,right:1});
});
test('only the actual percentage is parsed, preserving comma decimals and ranges',()=>{
 const terms='13–13,7% годовых на 12 месяцев';
 const rate=rateRange(terms);assert.deepEqual([rate.low,rate.high,rate.text],[13,13.7,'13–13,7%']);
 assert.equal(terms.slice(rate.start,rate.end),'13–13,7%');
 assert.equal(rateRange('15,1% годовых на 2 месяца').low,15.1);
 assert.equal(rateRange('14% годовых · 2027').low,14);
 assert.equal(rateRange('Здесь будет описание'),null);
});
test('a rate increase is green, a decrease is red, equal and overlapping ranges are neutral',()=>{
 const r=rateRange;
 assert.equal(rateChange(r('12,7%'),r('15,1%')),'up');
 assert.equal(rateChange(r('15,1%'),r('13–13,7%')),'down');
 assert.equal(rateChange(r('12,7%'),r('13–13,7%')),'up');
 assert.equal(rateChange(r('17%'),r('17%')),null);
 assert.equal(rateChange(r('13–13,7%'),r('13,5%')),null);
});
test('first presentation and transitions through a product without a rate never imply a gain or loss',()=>{
 assert.equal(rateChange(null,rateRange('18,5%')),null);
 assert.equal(rateChange(rateRange('18,5%'),null),null);
});
