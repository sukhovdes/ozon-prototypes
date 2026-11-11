export const ASSETS='/product-picker/assets/';
const cfa=(months,rate)=>({id:'cfa'+months,kind:'cfa',name:'ЦФА на '+months+' '+(months===4?'месяца':'месяцев'),terms:rate+' годовых',action:'К покупке',image:ASSETS+'v09-09-cfa4.png',crop:null,description:'Срок '+months+' '+(months===4?'месяца':'месяцев')+'. Ставка и срок взяты из предоставленной матрицы.'});
const savings=(id,rate,description)=>({id,name:'Накопительный счёт',terms:rate+' годовых',action:'Открыть',image:ASSETS+'v09-07-nakop2.png',crop:{left:-8.56,top:-7.63,size:113.33},description});
export const PRODUCTS={
 cfa12:cfa(12,'18,5%'),cfa9:cfa(9,'18%'),cfa6:cfa(6,'17%'),cfa4:cfa(4,'16%'),
 savingsPromo:{...savings('savingsPromo','15,1%','НСМО из матрицы. Маркетинговая ставка доступна на 2 месяца.'),terms:'15,1% годовых на 2 месяца'},
 savingsBase:savings('savingsBase','12,7%','НСМО из матрицы. Маркетинговая ставка на 2 месяца уже недоступна.'),
 deposit:{id:'deposit',name:'Вклад на 1–12 месяцев',terms:'13–13,7% годовых',action:'Открыть',image:ASSETS+'v09-00-safecc1.png',crop:{left:-8.33,top:-8.33,size:116.67},description:'Вклады от 1 до 12 месяцев. Диапазон ставки взят из предоставленной матрицы.'},
 daily:{id:'daily',name:'Ежедневный доход',terms:'12% годовых',action:'Открыть',image:ASSETS+'v09-06-image22.png',crop:{left:-6.5,top:-4.26,size:112.77},description:'ЕЖДВ из предоставленной матрицы.'},
 travel:{id:'travel',name:'Копилка на Путешествие',terms:'7% годовых при оплате на Ozon Travel',action:'Открыть',image:ASSETS+'travel-savings.png',crop:null,description:'Копилка на Путешествие. 7% годовых при оплате на Ozon Travel — условия из макета.'},
 tops:{id:'tops',kind:'fund',name:'Фонд российских акций TOPS',terms:'Здесь будет описание',termsMuted:true,action:'Открыть',image:ASSETS+'tops-fund.svg',crop:null,description:'Фонд российских акций TOPS. Описание в макете пока не заполнено.'},
 daily2:{id:'daily2',name:'Ежедневный доход 2.0',terms:'14% годовых · 2027',action:'Открыть',image:ASSETS+'v09-06-image22.png',crop:{left:-6.5,top:-4.26,size:112.77},description:'ЕЖДВ 2.0. Пока недоступен; в матрице указан 2027 год.',status:'2027'}
};
// Rows: Y3 → Y1 (more income → less risk). Columns: X1 → X3.
// NBP matrix with the two top-row replacements from Figma 283:1715.
// Shared by all current variants; carousel only where a cell has two products.
export const PRODUCT_MATRIX=[
 [['cfa12','cfa9'],['travel'],['tops']],
 [['cfa6','cfa4'],['savingsPromo'],['daily2']],
 [['deposit'],['savingsBase'],['daily']]
];
export const EMPTY_TITLE='Пока нет подходящих продуктов';
export function productsAt(row,col){return PRODUCT_MATRIX[row]?.[col]||[];}
