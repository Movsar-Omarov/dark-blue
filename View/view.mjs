export default class Display {
    constructor(canvas) {
        this.canvas = canvas
        this.context = canvas.getContext("2d")
        this.unit = 30
    }

    draw(array) {
        for (const element of array) {
            this.context.fillStyle = element.color
            this.context.fillRect(element.position.x * this.unit, element.position.y * this.unit,
                element.size.x * this.unit, element.size.y * this.unit)
        }
    }

    render(level) {
        this.canvas.setAttribute("width", level.columns * this.unit)
        this.canvas.setAttribute("height", level.rows * this.unit)
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        
        this.draw(level.map)
        this.draw(level.actors)
    }
}