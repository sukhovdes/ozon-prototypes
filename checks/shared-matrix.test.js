import test from 'node:test';
import assert from 'node:assert/strict';
import {PRODUCTS,PRODUCT_MATRIX} from '../site/product-picker/assets/product-matrix-v2.js';
import * as grid from '../site/product-picker/matrix/data.js';
import * as scales from '../site/product-picker/three/data.js';
import * as square from '../site/product-picker/variants/v10-app/data.js';
import * as nbp from '../site/product-picker/nbp/data.js';
test('all active control variants share the same nine product selections',()=>{
 for(const variant of [grid,scales,square])assert.deepEqual(variant.MATRIX,PRODUCT_MATRIX);
 assert.deepEqual(nbp.PRODUCT_MATRIX,PRODUCT_MATRIX);
 for(const variant of [grid,scales,square,nbp])for(const [id,p] of Object.entries(PRODUCTS)){
  for(const key of ['id','name','terms','image','action'])assert.equal(variant.PRODUCTS[id][key],p[key]);
 }
});
test('the new top-row choices use their Figma icons without crops or invented TOPS rates',()=>{
 assert.deepEqual(PRODUCT_MATRIX[0],[['cfa12','cfa9'],['travel'],['tops']]);
 assert.ok(PRODUCTS.travel.image.endsWith('/travel-savings.png'));assert.equal(PRODUCTS.travel.crop,null);
 assert.ok(PRODUCTS.tops.image.endsWith('/tops-fund.svg'));assert.equal(PRODUCTS.tops.crop,null);
 assert.equal(PRODUCTS.tops.terms,'Здесь будет описание');assert.equal(PRODUCTS.tops.termsMuted,true);
});
