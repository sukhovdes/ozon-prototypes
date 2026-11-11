import {PRODUCTS as SHARED_PRODUCTS,PRODUCT_MATRIX} from '../assets/product-matrix-v2.js?v=products-20261111';
export {ASSETS} from '../assets/product-matrix-v2.js?v=products-20261111';
export const PRODUCTS=Object.fromEntries(Object.entries(SHARED_PRODUCTS).map(([id,product])=>[id,{...product,crop:product.crop?[product.crop.left,product.crop.top,product.crop.size]:null}]));
export const MATRIX=PRODUCT_MATRIX;
export const PRIORITIES=['Максимум дохода','Баланс','Максимум надежности'];
export const ACCESS=['Вывести в конце срока','По условиям продукта','Вывести в любой момент'];
