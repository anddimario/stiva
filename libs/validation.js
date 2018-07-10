const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true});
const config = require('../config');

module.exports = (reference, data) => {
  const validate = ajv.compile(config.validators[reference]);
  const valid = validate(data);

  if (valid) {
    return true;
  } else {
    throw ajv.errorsText(validate.errors);
  }
};