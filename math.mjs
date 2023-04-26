export class Vector {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    static createVec(x, y) {
        return new Vector(x, y)
    }
}

export class RGB {
    constructor(r, g, b) {
        this.r = r
        this.g = g
        this.b = b
    }

    get value() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }
}