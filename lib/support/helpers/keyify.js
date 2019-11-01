const keyify = (obj, prefix = '') =>
Object.keys(obj).reduce((res, el) => {
  if( Array.isArray(obj[el]) ) {
    return res;
  } else if( typeof obj[el] === 'object' && obj[el] !== null ) {
    return [...res, ...keyify(obj[el], prefix + el + '.')];
  } else {
    return [...res, prefix + el];
  }
}, []);

module.exports = keyify;