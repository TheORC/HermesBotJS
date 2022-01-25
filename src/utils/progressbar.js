
const { msToString } = require('./function.js');


module.exports = (duration, total, size) => {

  const currentString = msToString(duration);
  const totalString  = msToString(total);

  duration = duration / 10000;
  total = total / 10000;

  const percent = duration / total;
  const progress = Math.round(size * percent);
  const remaining = total - duration;

  const beforeProgress = '-'.repeat(progress);
  const emptyProgress = '-'.repeat(remaining);

  const bar = '```[' + beforeProgress + 'x' + emptyProgress + '] ' + currentString + '/' + totalString + '```';
  return bar;
};
