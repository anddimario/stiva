
module.exports = (filters, allowed) => {
  const comparators = ['=', '<>', '<=', '>', '>=', '<'];
  const singles = filters.split(',');

  const expression = {
    FilterExpression: '',
    ExpressionAttributeValues: {}
  };
  for (const single of singles) {
    const splitted = single.split(' ');
    const field = splitted[0];
    const operator = splitted[1];
    let value, multipleValue;
    if (operator.toLowerCase() === 'between') {
      multipleValue = [splitted[2], splitted[3]];
    } else {
      value = splitted[2];
    }
    // Check if it's allowed
    if (!allowed.includes(operator)) {
      throw `Filter not allowed: ${single}`;
    }
    // Compartor pass without changes
    if (comparators.includes(operator)) {
      expression.FilterExpression += `${field} ${operator} :${field},`;
    } else {
      switch (operator) {
        case 'exists':
          expression.FilterExpression += `, attribute_exists(${field}),`;
          break;

        case '!exists':
          expression.FilterExpression += `, attribute_not_exists(${field}),`;
          break;

        case 'contains':
          expression.FilterExpression += `, contains(${field}, :${field}),`;
          break;

        case '!contains':
          expression.FilterExpression += `, NOT contains(${field}, :${field}),`;
          break;

        case 'starts':
          expression.FilterExpression += `, begins_with(${field}, :${field}),`;
          break;

        case 'in':
          expression.FilterExpression += `, :${field} IN ${field},`;
          break;

        case 'between':
          expression.ExpressionAttributeValues[':min'] = multipleValue[0];
          expression.ExpressionAttributeValues[':max'] = multipleValue[1];
          expression.FilterExpression += `, ${field} BETWEEN :min AND :max,`;
          break;

        default:
          throw `Filter not supported: ${single}`;
      }
    }
    // Some functions don't need value
    if (value) {
      expression.ExpressionAttributeValues[`:${field}`] = value;
    }
  }
  // Remove last comma
  expression.FilterExpression = expression.FilterExpression.substring(0, expression.FilterExpression.length - 1);
  return expression;
};
