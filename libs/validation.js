const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true});

module.exports = (reference, data) => {
  const validate = ajv.compile(reference);
  const valid = validate(data);

  if (valid) {
    return true;
  } else {
    throw ajv.errorsText(validate.errors);
  }
};
