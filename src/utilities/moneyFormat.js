const money = Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export default function moneyFormat(price) {
  return money.format(price);
}
