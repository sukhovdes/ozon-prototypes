import test from 'node:test';
import assert from 'node:assert/strict';
import {PRODUCTS,PRODUCT_MATRIX,productsAt} from '../site/product-picker/nbp/data.js';
test('all nine points match the updated product matrix',()=>{
 assert.deepEqual(PRODUCT_MATRIX,[
  [['cfa12','cfa9'],['travel'],['tops']],
  [['cfa6','cfa4'],['savingsPromo'],['daily2']],
  [['deposit'],['savingsBase'],['daily']]
 ]);
 assert.deepEqual(PRODUCT_MATRIX.flat().map(ids=>ids.length),[2,1,1,2,1,1,1,1,1]);
 assert.equal(PRODUCT_MATRIX.flat(2).length,11);
});
test('every selected product exists, without neighbouring fallbacks',()=>{
 for(let row=0;row<3;row++)for(let col=0;col<3;col++)for(const id of productsAt(row,col))assert.ok(PRODUCTS[id],id);
 assert.deepEqual(productsAt(0,2),['tops']);
 assert.equal(Object.keys(PRODUCTS).length,11);
});
test('NSMO expands to savings with the two source rates and future statuses are preserved',()=>{
 assert.equal(PRODUCTS.savingsPromo.name,'Накопительный счёт');assert.equal(PRODUCTS.savingsBase.name,'Накопительный счёт');
 assert.equal(PRODUCTS.savingsPromo.terms,'15,1% годовых на 2 месяца');assert.equal(PRODUCTS.savingsBase.terms,'12,7% годовых');
 assert.equal(PRODUCTS.travel.terms,'7% годовых при оплате на Ozon Travel');assert.equal(PRODUCTS.tops.name,'Фонд российских акций TOPS');assert.equal(PRODUCTS.tops.terms,'Здесь будет описание');assert.equal(PRODUCTS.daily2.status,'2027');
 for(const product of Object.values(PRODUCTS))assert.equal(product.action,product.kind==='cfa'?'К покупке':product.id==='tops'?'Открыть инвестиционный счет':'Открыть');
});
test('CFA rates and order preserve both independent cards in each source pair',()=>{
 assert.deepEqual(productsAt(0,0).map(id=>PRODUCTS[id].terms),['18,5% годовых','18% годовых']);
 assert.deepEqual(productsAt(1,0).map(id=>PRODUCTS[id].terms),['17% годовых','16% годовых']);
 assert.equal(PRODUCTS.deposit.terms,'13–13,7% годовых');assert.equal(PRODUCTS.daily.terms,'12% годовых');
});
