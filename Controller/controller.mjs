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
        this.view.render(this.model.level)
        requestAnimationFrame(time => this.loop(time))
    }

    updateKey(key, insert) {
        if (typeof insert !== "boolean") throw new Error("InputError: insert parameter must contain only boolean values!")
        // console.log(key in this.keys && this.state === "playing")
        if (key in this.keys && this.state === "playing") this.keys[key] = insert
    }

    loop(time = 0) {
        if (this.state !== "playing") return
        
        let timeLoop = time - this.lastTime
        
        while(timeLoop >= this.timeStep) {
            let result = this.model.update(this.keys, this.timeStep / 1000)

            this.lastTime += this.timeStep
            timeLoop -= this.timeStep
            
            if (result !== undefined) {
                if (result == false) this.state = "lose"
                else if (result) this.state = "win"

                break
            }
        }

        const model2 = Object.create(this.model)

        model2.update(this.keys, (time - this.lastTime) / 1000)
        this.view.render(model2.level)
        
        requestAnimationFrame(time => this.loop(time))
    }
    
    nextLevel() {
        this.model.currentLevel++
    }

    get isPlaying() {
        return "playing"
    }
}