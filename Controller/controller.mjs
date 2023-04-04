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
    loop(time = 0) {
        // console.log(this.keys)
        if (this.state != "playing") return
        
        let timeStep = Math.min(time - this.lastTime, 1000) / 1000,
        result = this.model.update(this.keys, timeStep)
        
        this.view.render(this.model.level)
        
        if (result == false) this.state = "lose"
        else if (result) this.state = "won"

        this.lastTime = time
        
        requestAnimationFrame(time => this.loop(time));
    }
    
    nextLevel() {
        this.model.currentLevel++
    }
}