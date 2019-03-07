
module.exports.taskRunnerCreator = (concurrency = 1) => {
    let running = 0
    const queue = []
  

    const next = _ => {
        running--
        if (queue.length > 0) {
            run(queue.shift())
        }
    }

    const run = async task => {
        running++
        await task(next) 
    }
  
    const enqueue = task => queue.push(task)
  
    return {
        push: task =>
            running < concurrency ? run(task) : enqueue(task)
    }
}