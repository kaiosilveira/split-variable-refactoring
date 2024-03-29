export function discount(originalInputValue, quantity) {
  let result = originalInputValue;
  if (result > 50) result = result - 2;
  if (quantity > 100) result = result - 1;
  return result;
}
