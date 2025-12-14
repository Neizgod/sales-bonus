/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  // @TODO: Расчет выручки от операции
  const { discount, sale_price, quantity } = purchase;
  return sale_price * quantity * (1 - discount / 100);
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  // @TODO: Расчет бонуса от позиции в рейтинге
  let bonus;
  switch (index) {
    case 0:
      bonus = 0.15;
      break;
    case 1:
      bonus = 0.1;
      break;
    case 2:
      bonus = 0.1;
      break;
    case total - 1:
      bonus = 0;
      break;
    default:
      bonus = 0.05;
  }
  return bonus * seller.profit;
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // @TODO: Проверка входных данных

  // @TODO: Проверка наличия опций

  // @TODO: Подготовка промежуточных данных для сбора статистики

  // @TODO: Индексация продавцов и товаров для быстрого доступа

  // @TODO: Расчет выручки и прибыли для каждого продавца

  // @TODO: Сортировка продавцов по прибыли

  // @TODO: Назначение премий на основе ранжирования

  // @TODO: Подготовка итоговой коллекции с нужными полями

  if (!data || data.sellers.length === 0 || !Array.isArray(data.sellers)) {
    throw new Error("Некорректные входные данные ");
  }

  const sellerStats = [];

  const { calculateRevenue, calculateBonus } = options;

  const sellerIndex = Object.fromEntries(
    data.sellers.map((item) => [item.id, item])
  );
  const productIndex = Object.fromEntries(
    data.products.map((item) => [item.sku, item])
  );

  data.purchase_records.forEach((record) => {
    const seller = sellerIndex[record.seller_id];

    if (!seller.sales_count) seller.sales_count = 0;
    seller.sales_count += 1;

    if (!seller.revenue) seller.revenue = 0;
    seller.revenue += record.total_amount;

    if (!seller.profit) seller.profit = 0;

    record.items.forEach((item) => {
      const product = productIndex[item.sku];
      const cost = product.purchase_price * item.quantity;
      const obj = {
        discount: item.discount,
        sale_price: item.sale_price,
        quantity: item.quantity,
      };

      const revenue = calculateRevenue(obj);
      const profit = revenue - cost;
      seller.profit += profit;

      if (!seller.products_sold) seller.products_sold = {};
      if (!seller.products_sold[item.sku]) {
        seller.products_sold[item.sku] = 0;
      }
      seller.products_sold[item.sku] += 1;
      if (!sellerStats.includes(seller)) sellerStats.push(seller);
    });
  });
  sellerStats.sort((a, b) => b.profit - a.profit);

  sellerStats.forEach((seller, index) => {
    seller.bonus = calculateBonus(index, sellerStats.length, seller);

    seller.top_products = Object.entries(seller.products_sold)
      .map(([sku, quantity]) => ({ sku, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  });

  return sellerStats.map((seller) => ({
    seller_id: seller.id, // Строка, идентификатор продавца
    name: `${seller.first_name} ${seller.last_name}`, // Строка, имя продавца
    revenue: +seller.revenue.toFixed(2), // Число с двумя знаками после точки, выручка продавца
    profit: +seller.profit.toFixed(2), // Число с двумя знаками после точки, прибыль продавца
    sales_count: seller.sales_count, // Целое число, количество продаж продавца
    top_products: seller.top_products, // Массив объектов вида: { "sku": "SKU_008","quantity": 10}, топ-10 товаров продавца
    bonus: +seller.bonus.toFixed(2), // Число с двумя знаками после точки, бонус продавца
  }));
}
