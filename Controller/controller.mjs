export default class Controller {
    constructor(model, view) {
        this.model = model
        this.view = view
        this.keys = {
            "ArrowUp": false, 
            "ArrowRight": false,
            "ArrowLeft": false
        }
        this.state = undefined
        this.lastTime = 0
    }

    start() {
        this.state = "playing"
        
        this.loop()
    }

    updateKey(key, insert) {
        if (typeof insert !== "boolean") throw new Error("InputError: insert parameter must contain only boolean values!")
        // console.log(key in this.keys && this.state === "playing")
        if (key in this.keys && this.state === "playing") this.keys[key] = insert
    }

    timeStep(time) {
        if (time - this.lastTime > 500) return 0
        return  (time - this.lastTime) / 1000
    }

    loop(time = 0) {
        if (this.state !== "playing") {
            for (const key of Object.keys(this.keys)) {
                this.keys[key] = false
            }
            return
        }
        
        let timeStep = this.timeStep(time)
        // console.log(timeStep > 1000)
        let result = this.model.update(this.keys, timeStep)
        
        this.view.render(this.model.level)
        
        if (result == false) this.state = "lose"
        else if (result) this.state = "win"

        this.lastTime = time
        
        requestAnimationFrame(time => this.loop(time))
    }
    
    nextLevel() {
        this.model.currentLevel++
    }

    get isPlaying() {
        return "playing"
    }
}