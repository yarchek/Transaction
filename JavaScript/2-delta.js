'use strict';

function Transaction() {}

Transaction.start = (data) => {
  console.log('start transaction');
  let delta = {};

  const methods = {
    commit: () => {
      console.log('commit transaction');
      Object.assign(data, delta);
      delta = {};
      methods.delta = delta;
    },
    rollback: () => {
      console.log('rollback transaction');
      delta = {};
      methods.delta = delta;
    },
    delta
  };

  return new Proxy(data, {
    get(target, key) {
      console.log('get', key);
      if (key === Symbol.iterator) {
        const changes = Object.keys(delta);
        const keys = Object.keys(target).concat(changes);
        const props = keys.filter((x, i, a) => a.indexOf(x) === i);
        return props[Symbol.iterator]();
      }
      return methods[key] || delta[key] || target[key];
    },
    set(target, key, val) {
      console.log('set', key, val);
      if (target[key] === val) {
        delete delta[key];
      } else {
        delta[key] = val;
      }
      return true;
    }
  });
};


// Usage

const data = { name: 'Marcus Aurelius', city: 'Rome', born: 121 };

const transaction = Transaction.start(data);

transaction.name = 'Mao Zedong';
transaction.born = 1893;

console.dir(transaction.delta);

transaction.commit();

console.dir(transaction.delta);

transaction.city = 'Shaoshan';

console.dir(transaction.delta);

transaction.rollback();

console.dir(transaction.delta);
