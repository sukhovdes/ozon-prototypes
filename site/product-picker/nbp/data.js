const ASSETS='/product-picker/assets/';
const cfa=(months,rate)=>({id:'cfa'+months,kind:'cfa',name:'ЦФА на '+months+' '+(months===4?'месяца':'месяцев'),terms:rate+' годовых',action:'Открыть инвест счет',image:ASSETS+'v09-09-cfa4.png',crop:null,description:'Срок '+months+' '+(months===4?'месяца':'месяцев')+'. Ставка и срок взяты из предоставленной матрицы.'});
const savings=(id,rate,description)=>({id,name:'Накопительный счёт',terms:rate+' годовых',action:'Открыть',image:ASSETS+'v09-07-nakop2.png',crop:{left:-8.56,top:-7.63,size:113.33},description});
export const PRODUCTS={
 cfa12:cfa(12,'18,5%'),cfa9:cfa(9,'18%'),cfa6:cfa(6,'17%'),cfa4:cfa(4,'16%'),
 savingsPromo:{...savings('savingsPromo','15,1%','НСМО из матрицы. Маркетинговая ставка доступна на 2 месяца.'),terms:'15,1% годовых на 2 месяца'},
 savingsBase:savings('savingsBase','12,7%','НСМО из матрицы. Маркетинговая ставка на 2 месяца уже недоступна.'),
 deposit:{id:'deposit',name:'Вклад на 1–12 месяцев',terms:'13–13,7% годовых',action:'Открыть',image:ASSETS+'v09-00-safecc1.png',crop:{left:-8.33,top:-8.33,size:116.67},description:'Вклады от 1 до 12 месяцев. Диапазон ставки взят из предоставленной матрицы.'},
 daily:{id:'daily',name:'Ежедневный доход',terms:'12% годовых',action:'К покупке',image:ASSETS+'v09-06-image22.png',crop:{left:-6.5,top:-4.26,size:112.77},description:'ЕЖДВ из предоставленной матрицы.'},
 snbl:{id:'snbl',name:'Копилка · в разработке',terms:'17% годовых при оплате у партнёра',action:'Подробнее',image:ASSETS+'v09-06-image22.png',crop:{left:-6.5,top:-4.26,size:112.77},description:'SNBL «Копилка» на ЕЖДВ. В разработке. Ставка при оплате у партнёра. В матрице указан показ при признаке будущей покупки.',status:'в разработке'},
 daily2:{id:'daily2',name:'Ежедневный доход 2.0',terms:'14% годовых · 2027',action:'Подробнее',image:ASSETS+'v09-06-image22.png',crop:{left:-6.5,top:-4.26,size:112.77},description:'ЕЖДВ 2.0. Пока недоступен; в матрице указан 2027 год.',status:'2027'}
};
// Rows: Y3 → Y1 (more income → less risk). Columns: X1 → X3.
// All green accumulation products, including dashed future products as requested.
// No blue investment products and no fallback from a neighbouring cell.
export const PRODUCT_MATRIX=[
 [['cfa12','cfa9'],['snbl'],[]],
 [['cfa6','cfa4'],['savingsPromo'],['daily2']],
 [['deposit'],['savingsBase'],['daily']]
];
export const EMPTY_TITLE='Пока нет подходящих продуктов';
export function productsAt(row,col){return PRODUCT_MATRIX[row]?.[col]||[];}
