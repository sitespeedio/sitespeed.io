module.exports = async function(context) {
  await context.h.measure('https://www.sitespeed.io');
  await context.h.measure('https://www.sitespeed.io/examples/');
  return context.h.measure('https://www.sitespeed.io/documentation/');
};
