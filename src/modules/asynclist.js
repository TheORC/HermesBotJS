class AsyncTask {
  constructor(task, onFinish){
    this.task = task;
    this.onFinish = onFinish;

    this.task();
    this.onFinish();
  }
}

// Method for performing the loop.
const nextLoop = (() => {

  // Check to see if we have access to the Node js event loop
  if (typeof setImmediate === 'function') {
    return setImmediate;
  }

  // We dont have an event loop, lets create a mini delay instead
  return args => setTimeout(this, 0);
})();


class AsyncList {

  constructor(max_size=500){
    this.tasks = [];
    this.queue = [];
    this.max_size = max_size;
  }

  getlength(){
    return this.queue.length;
  }

  clear(){
    this.queue = []; // Reset the stack.
  }

  clearTasks(){
    this.tasks = [];
  }

  async push(item) {
    this.queue.push(item);
    this._flush();
    return this.queue.length;
  }

  async push_next() {

  }

  // This method waits for a new item to be in the queue
  // It returns when an item is found.
  async wait_for_next() {

    console.log('Waiting for item');

    return new Promise((resolve, reject) => {
      // There is an item there now.  Woop!
      if (this.queue.length > 0) {

        console.log('Item in the queue');
        return resolve(this.queue.pop());

      } else {

        console.log('No item.  Add task to the queue.');

        // There is not an item.  Keep waiting.
        this.tasks.push((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(this.queue.pop());
        });
      }
    });
  }

  _flush() {

    console.log('Flushing.');

    // Check if work needs to be performed.
    if(this.queue.length > 0 && this.tasks.length  > 0){

      // Grab the next task we want to perform.
      const nextTask = this.tasks.shift();
      nextTask.call(this);
      nextLoop(this._flush.bind(this)); // Performt the loop
    }
  }
}

module.exports = AsyncList;
