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
