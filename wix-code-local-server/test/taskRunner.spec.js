const { taskRunnerCreator } = require('../src/taskRunner')
const eventually = require('@wix/wix-eventually')
let taskRunner
beforeAll(async done => {
    taskRunner = taskRunnerCreator()
    done()
})

describe('task runner', () => {
    it('should execute a task', () => {
        let globalCounter = 0
        const expectedValue = 1
        const task = doneCallback => {
            globalCounter++
            doneCallback()
        }
        taskRunner.push(task)
        expect(expectedValue).toEqual(globalCounter)
    })
    it('should wait until a task request arrived and then execute it', async done => {
        let globalCounter = 0
        const expectedValue = 1
        const task = doneCallback => {
            globalCounter++
            doneCallback()
        }
        const t = setTimeout(() => {
            taskRunner.push(task)
        }, 500)
        await eventually(() => {
            expect(expectedValue).toEqual(globalCounter)
        })
        clearTimeout(t)
        done()
    })
    it('should execute a chain of sync and async tasks by thier arrival order', async done => {
        const actionLog = []
        const expectedActionLog = ['1', '2', '3', '4']
        const timeouts = []
        const asyncTask1 = doneCallback => {
            timeouts.push(
                setTimeout(() => {
                    actionLog.push('1')
                    doneCallback()
                }, 1000)
            )
        }
        const asyncTask2 = doneCallback => {
            timeouts.push(
                setTimeout(() => {
                    actionLog.push('2')
                    doneCallback()
                }, 10)
            )
        }
        const task3 = doneCallback => {
            actionLog.push('3')
            doneCallback()
        }
        const task4 = doneCallback => {
            actionLog.push('4')
            doneCallback()
        }
        taskRunner.push(asyncTask1)
        taskRunner.push(asyncTask2)
        taskRunner.push(task3)
        taskRunner.push(task4)
        await eventually(() => {
            expect(actionLog).toEqual(expectedActionLog)
        })
        timeouts.forEach(t => clearTimeout(t))
        done()
    })
    it('should continue execute remaining tasks in queue when a task throw an error', async done => {
        let globalCounter = 0
        let error
        const expectedValue = 3
        const errorMessage = 'i am an error'
        
        const task = doneCallback => {
            globalCounter++
            doneCallback()
        }
        const errorTask = doneCallback => {
            try {
                throw new Error(errorMessage)
            }
            catch (e) {
                error = e.message
            }
            finally {
                doneCallback()
            }   
        }
        taskRunner.push(task)
        taskRunner.push(errorTask)
        taskRunner.push(task)
        taskRunner.push(task)
        await eventually(() => {
            expect(expectedValue).toEqual(globalCounter)
            expect(errorMessage).toEqual(error)
        })
        done()
    })
})
