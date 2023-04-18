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
        this.lastTime = 0 // in milliseconds
        this.timeStep = 0.5 // in milliseconds
    }

    start() {
        console.log(this.model.currentLevel)
        this.state = "playing"
        this.lastTime = 0
        this.view.render(this.model.level)
        requestAnimationFrame(time => this.loop(time))
    }

    updateKey(key, insert) {
        if (typeof insert !== "boolean") throw new Error("InputError: insert parameter must contain only boolean values!")
        // console.log(key in this.keys && this.state === "playing")
        if (key in this.keys && this.state === "playing") this.keys[key] = insert
    }

    timeLoop(time) {
        if (time - this.lastTime > 500) return 0
        return  (time - this.lastTime) / 1000
    } // in seconds

    loop(time = 0) {
        if (this.state !== "playing") return
        
        let timeLoop = this.timeLoop(time) // in seconds
        
        // console.log(timeLoop > 1000)
        while(timeLoop >= this.timeStep / 1000) {
            var result = this.model.update(this.keys, this.timeStep / 1000)

            this.lastTime += this.timeStep
            timeLoop -= this.timeStep / 1000
        }

        const model2 = Object.create(this.model)

        model2.update(this.keys, this.timeLoop(time))
        this.view.render(model2.level)
        
        if (result == false) this.state = "lose"
        else if (result) this.state = "win"
        
        requestAnimationFrame(time => this.loop(time))
    }
    
    nextLevel() {
        this.model.currentLevel++
    }

    get isPlaying() {
        return "playing"
    }
}