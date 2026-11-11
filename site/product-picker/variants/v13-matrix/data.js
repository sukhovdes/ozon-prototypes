export const ASSETS='/product-picker/assets/';
export const PRODUCTS={
 savings:{id:'savings',name:'Накопительный счёт',terms:'XX% годовых, выплаты раз в месяц',action:'Открыть',image:ASSETS+'v09-07-nakop2.png',crop:[-8.56,-7.63,113.33]},
 deposit:{id:'deposit',name:'Вклад: 24 мес',terms:'16% годовых, без пополнений',action:'Открыть',image:ASSETS+'v09-00-safecc1.png',crop:[-8.33,-8.33,116.67]},
 daily:{id:'daily',name:'Ежедневный доход',terms:'XX% годовых, выплаты ежедневно',action:'К покупке',image:ASSETS+'v09-06-image22.png',crop:[-6.5,-4.26,112.77]},
 cfa:{id:'cfa',name:'Цифровые активы',terms:'до XX% годовых',action:'Открыть инвест счет',image:ASSETS+'v09-09-cfa4.png',crop:null}
};
// Temporary demo matrix. Rows run top to bottom, columns left to right.
export const MATRIX=[
 [['cfa'],['cfa','daily'],['daily','cfa']],
 [['deposit','cfa'],['deposit','savings'],['daily','savings']],
 [['deposit'],['savings','deposit'],['deposit','savings']]
];
export const PRIORITIES=['Максимум дохода','Баланс','Максимум надежности'];
export const ACCESS=['Вывести в конце срока','По условиям продукта','Вывести в любой момент'];
