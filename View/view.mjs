import {Vector} from "../math.mjs"

class Viewport {
    constructor(player, width, height, unit, vecTool = Vector) {
        this.player = player
        this.unit = unit
        this.width = Math.min(width, window.innerWidth / this.unit)
        this.height = Math.min(height, window.innerHeight / this.unit)
        this.position
        this.map = []
        this.actors = []
        this.vecTool = vecTool
    }

    getViewport(player, width, height, unit = this.unit) {
        return new Viewport(player, width, height, unit)
    }

    changePosition() {
        const x = Math.max(this.player.position.x - this.width / 2 + this.player.size.x / 2, 0),
        y = Math.max(this.player.position.y - this.height / 2 + this.player.size.y / 2, 0)
        
        this.position = this.vecTool.createVec(x, y)
    }
    
    isInThere(object) {
        return object.position.x >= this.position.x &&
            object.position.x + object.size.x <= this.position.x + this.width &&
            object.position.y >= this.position.y &&
            object.position.y + object.size.y <= this.position.y + this.height
    }

    displayWorld(actors, map) {
        this.actors = []
        this.map = []
        this.changePosition()
        for (const block of map) {
            if (this.isInThere(block)) this.map.push(block)
        }

        for (const actor of actors) {
            if (this.isInThere(actor)) this.actors.push(actor)
        }
    }
}

export default class Display {
    constructor(canvas, viewport = Viewport) {
        this.canvas = canvas
        this.context = canvas.getContext("2d")
        this.unit = 30
        this.viewport = new viewport(undefined, undefined, undefined, this.unit)
    }

    draw(array) {
        for (const element of array) {
            this.context.fillStyle = element.color
            this.context.fillRect((element.position.x - this.viewport.position.x) * this.unit, 
                                    (element.position.y - this.viewport.position.y) * this.unit,
                                    element.size.x * this.unit, 
                                    element.size.y * this.unit)
        }
    }

    render({columns, player, rows, map, actors}) {
        
        this.viewport = this.viewport.getViewport(player, columns, rows)
        this.canvas.setAttribute("width", this.viewport.width * this.unit)
        this.canvas.setAttribute("height", this.viewport.height * this.unit)
        
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.viewport.displayWorld(actors, map)
        this.draw(this.viewport.map)
        this.draw(this.viewport.actors)
    }
}