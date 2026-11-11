import test from 'node:test';
import assert from 'node:assert/strict';
import {SnapCommit} from '../site/product-picker/matrix/components/snap-commit.js';
const deferred=()=>{let resolve,reject;const promise=new Promise((ok,fail)=>{resolve=ok;reject=fail;});return {promise,resolve,reject};};
test('the product stays unchanged until the circle arrives at its point',async()=>{
 const arrival=deferred(),committed=[];const selection=new SnapCommit(point=>committed.push(point));
 const pending=selection.select({row:0,col:2},arrival.promise);await Promise.resolve();assert.deepEqual(committed,[]);
 arrival.resolve();assert.equal(await pending,true);assert.deepEqual(committed,[{row:0,col:2}]);
});
test('a new drag cancels the previous pending product switch',async()=>{
 const arrival=deferred(),committed=[];const selection=new SnapCommit(point=>committed.push(point));
 const pending=selection.select({row:0,col:0},arrival.promise);selection.cancel();arrival.resolve();assert.equal(await pending,false);assert.deepEqual(committed,[]);
});
test('rapid keyboard choices commit only the last completed snap',async()=>{
 const first=deferred(),last=deferred(),committed=[];const selection=new SnapCommit(point=>committed.push(point));
 const a=selection.select({row:0,col:1},first.promise),b=selection.select({row:0,col:2},last.promise);
 first.resolve();await a;assert.deepEqual(committed,[]);last.resolve();await b;assert.deepEqual(committed,[{row:0,col:2}]);
});
test('an interrupted arrival never commits a product',async()=>{
 const arrival=deferred(),committed=[];const selection=new SnapCommit(point=>committed.push(point));
 const pending=selection.select({row:2,col:2},arrival.promise);arrival.reject(new Error('interrupted'));assert.equal(await pending,false);assert.deepEqual(committed,[]);
});
