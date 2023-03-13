var crypto = require('crypto');

let initOptions = {};

module.exports = class Configure {
  constructor(options) {
    initOptions = options || {};
  }

  validate(key) {
    return initOptions && initOptions[key] ? true : false;
  }

  throwError(requirement) {
    throw new Error(`${requirement} is required to perform this action`);
  }

  encrypt(plainText) {
    if (this.validate('working_key') && plainText) {
      const { working_key } = initOptions;
      var md5 = crypto.createHash('md5').update(working_key).digest();
      var keyBase64 = Buffer.from(md5).toString('base64');
      var ivBase64 = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]).toString('base64');
      const key = Buffer.from(keyBase64, 'base64');
      const iv = Buffer.from(ivBase64, 'base64');
      const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
      let encoded = cipher.update(Object.entries(plainText).map(([key, value]) => `&${key}=${value}`).join(''), 'utf8', 'hex');
      encoded += cipher.final('hex');
      return encoded;
    } else if (!plainText) {
      this.throwError('Plain text');
      return false;
    } else {
      this.throwError('Working Key');
      return false;
    }
  }

  decrypt(encText) {
    if (this.validate('working_key') && encText) {
      const { working_key } = initOptions;
      var md5 = crypto.createHash('md5').update(working_key).digest();
      var keyBase64 = Buffer.from(md5).toString('base64');
      var ivBase64 = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]).toString('base64');
      const key = Buffer.from(keyBase64, 'base64');
      const iv = Buffer.from(ivBase64, 'base64');
      const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
      let decoded = decipher.update(encText, 'hex', 'utf8');
      decoded += decipher.final('utf8');
      return decoded;
    } else if (!encText) {
      this.throwError('Encrypted text');
      return false;
    } else {
      this.throwError('Working Key');
      return false;
    }
  }

  redirectResponseToJson(response) {
    if (response) {
      let ccavResponse = this.decrypt(response);
      const responseArray = ccavResponse.split('&');
      const stringify = JSON.stringify(responseArray);
      const removeQ = stringify.replace(/['"]+/g, '');
      const removeS = removeQ.replace(/[[\]]/g, '');
      return removeS.split(',').reduce((o, pair) => {
        pair = pair.split('=');
        return o[pair[0]] = pair[1], o;
      }, {});
    } else {
      this.throwError('CCAvenue encrypted response');
    }
  }

  getEncryptedOrder(orderParams) {
    if (this.validate('merchant_id') && orderParams) {
      let data = `merchant_id=${initOptions.merchant_id}`;
      data += Object.entries(orderParams).map(([key, value]) => `&${key}=${value}`).join('');

      return this.encrypt(data);

    } else if (!orderParams) {
      this.throwError('Order Params');
    } else {
      this.throwError('Merchant ID');
    }
  }

}