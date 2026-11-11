import test from 'node:test';
import assert from 'node:assert/strict';
import {IntroSequence} from '../site/product-picker/assets/intro-sequence-v1.js';
const deferred=()=>{let resolve;const promise=new Promise(done=>resolve=done);return {promise,resolve};};
const flush=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};
const setup=options=>{const element={hidden:true};return {element,intro:new IntroSequence({element,shouldShow:()=>true,paint:()=>Promise.resolve(),delay:()=>Promise.resolve(),...options})};};

test('the hint waits for the product, interface, paint and clear-interface interval',async()=>{
 const card=deferred(),ui=deferred(),paint=deferred(),interval=deferred();
 const {element,intro}=setup({interfaceReady:ui.promise,paint:()=>paint.promise,delay:()=>interval.promise});
 const pending=intro.request(card.promise);card.resolve(true);await flush();assert.equal(element.hidden,true);
 ui.resolve();await flush();assert.equal(element.hidden,true);
 paint.resolve();await flush();assert.equal(element.hidden,true);
 interval.resolve();await pending;assert.equal(element.hidden,false);
});
test('interaction cancels a hint whose product is still loading',async()=>{
 const card=deferred();const {element,intro}=setup();const pending=intro.request(card.promise);
 intro.cancel();card.resolve(true);await pending;assert.equal(element.hidden,true);
});
test('a stale product cannot reveal the hint for a newer selection',async()=>{
 const first=deferred(),second=deferred();const {element,intro}=setup();
 const firstPending=intro.request(first.promise),secondPending=intro.request(second.promise);
 first.resolve(true);await firstPending;assert.equal(element.hidden,true);
 second.resolve(true);await secondPending;assert.equal(element.hidden,false);
});
test('a failed image leaves the interface uncovered',async()=>{
 const {element,intro}=setup();await intro.request(Promise.resolve(false));assert.equal(element.hidden,true);
});
test('the circle nudges only with the ready hint and stops immediately on dismissal',async()=>{
 const card=deferred(),calls=[];let cancelled=0;
 const motionTarget={animate:(frames,options)=>{calls.push({frames,options});return {cancel:()=>cancelled++};}};
 const {element,intro}=setup({motionTarget});const pending=intro.request(card.promise);
 assert.equal(calls.length,0);card.resolve(true);await pending;
 assert.equal(element.hidden,false);assert.equal(calls.length,1);
 assert.equal(calls[0].options.duration,3000);assert.equal(calls[0].options.iterations,Infinity);
 assert.deepEqual(calls[0].frames.slice(-2).map(frame=>frame.transform),['translateX(0)','translateX(0)']);
 await intro.request(card.promise);assert.equal(calls.length,1);
 intro.cancel();assert.equal(cancelled,1);assert.equal(element.hidden,true);
});
test('a cancelled pending hint never starts a circle animation',async()=>{
 const card=deferred();let started=0;
 const {intro}=setup({motionTarget:{animate:()=>{started++;}}});
 const pending=intro.request(card.promise);intro.cancel();card.resolve(true);await pending;
 assert.equal(started,0);
});
