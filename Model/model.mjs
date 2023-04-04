import randomDirection from "../tools.mjs"

class Vector {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

class RGB {
    constructor(r, g, b) {
        this.r = r
        this.g = g
        this.b = b
    }

    get value() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }
}

class Block {
    constructor(position, velocity, size, sign, color) {
        this.position = position
        this.velocity = velocity
        this.size = size 
        this.sign = sign
        this.color = color.value
    }
}

class Actor extends Block {
    constructor(position, velocity, size, sign, color) {
        super(position, velocity, size, sign, color)
    }

    fall(gravity, time, velocity) {
        this.position.y += velocity.y * time
        velocity.y += gravity * time
    }
}

class Coin extends Block {
    constructor(position) {
        super(Object.create(position), new Vector(0, 1), new Vector(0.5, 0.5), "o", new RGB(255, 215, 0))
        this.basePosition = Object.create(position)
        this.direction = randomDirection()
    }

    wobble(time) {
        this.position.y += this.velocity.y * this.direction * time
        
        if (this.position.y + this.size.y >= this.basePosition.y + 1 || 
            this.position.y <= this.basePosition.y - 1) this.direction *= -1 
    }
}

class Lava extends Actor {
    constructor(position, velocity, sign) {
        super(Object.create(position), velocity, new Vector(1, 1), sign, new RGB(255, 69, 0))
        this.basePosition = Object.create(position)
        this.direction = randomDirection()
    }

    moveSideward(time) {
        this.position.x += this.velocity.x * this.direction * time
        
        if (this.position.x + this.size.x >= this.basePosition.x + 1.5 ||
            this.position.x <= this.basePosition.x - 1.5) this.direction *= -1
    }
}

class Player extends Actor {
    constructor(position, velocity) {
        super(position, velocity, new Vector(1, 2), "@", new RGB(0, 0, 255))
        this.isJumping = false
        this.isFalling = false
        this.jumpVelocity = Object.create(this.velocity)
        this.health = 3
        this.direction = 0
    }

    move(direction, time) {
        if (direction == "left") this.direction = -1
        else if (direction == "right") this.direction = 1

        this.position.x += this.velocity.x * this.direction * time
    }

    jump(gravity, time) {
        this.position.y -= this.jumpVelocity.y * time
        this.jumpVelocity.y -= gravity * time
    }

    get dead() {
        return this.health <= 0
    }
}

// tools to generate map and actors

function createMap(level) {
    return level.reduce((map, row, y) => {
        const blocks = []

        for (let x = 0; x < row.length; x++) {
            const block = row[x]

            if (block == "#") {
                const position = new Vector(x, y),
                rgb = new RGB(255, 255, 255),
                size = new Vector(1, 1)

                blocks.push(new Block(position, 0, size, "#", rgb))
            }
        }

        return map.concat(blocks)
    }, [])
}

function createMobileChars(level) {
    return level.reduce((actors, row, y) => {
        const level = []
        
        for (let x = 0; x < row.length; x++) {
            const actor = row[x],
            position = new Vector(x, y)

            switch(actor) {
                case "+":
                    level.push(new Lava(position, 0, actor))
                    break
                case "|":
                    level.push(new Lava(position, new Vector(0, 2), actor))
                    break
                case "=":
                    level.push(new Lava(position, new Vector(2, 0), actor))
                    break
                case "o":
                    level.push(new Coin(new Vector(x, y - 0.5)))
                    break
                case "@":
                    level.push(new Player(new Vector(x, y - 1), new Vector(2, 2)))
            }
        }

        return actors.concat(level)
    }, [])
}

class Level {
    constructor(plan) {
        let level = plan.trim().split("\n")
        .map(row => [...row].filter(block => block != " "))
       
        this.rows = level.length
        this.columns = level[0].length
        this.map = createMap(level)
        this.actors = createMobileChars(level)
    }

    get player() {
        return this.actors.filter(actor => actor instanceof Player)[0]
    }

    get coins() {
        return this.actors.filter(actor => actor instanceof Coin)
    }

    get lava() {
        return this.actors.filter(actor => actor instanceof Lava)
    }
}

export default class World {
    constructor(levels) {
        this.levels = levels
        this.gravity = 0.981
        this.currentLevel = 0
    }

    get level() {
        return this.levels[this.currentLevel]
    }

    static getLevel(plan) {
        return new Level(plan)
    }

    isOutside(actor) {
        return actor.position.x < 0 || actor.position.x + actor.size.x > this.level.columns ||
            actor.position.y < 0 || actor.position.y + actor.size.y > this.level.rows
    }

    collisions(actor, object) {
        return actor.position.x < object.position.x + object.size.x && actor.position.x + actor.size.x > object.position.x &&
                actor.position.y < object.position.y + object.size.y && actor.position.y + actor.size.y > object.position.y
    }

    collisionsBlock(actor) {
        for (const block of this.level.map) {
            if (this.collisions(actor, block)) return true
        }

        return false
    }

    isClicked(keys) {
        for (const [key, value] of Object.entries(keys)) {
            if (key === "ArrowUp") continue

            if (value === true) return true
        }

        return false
    }

    updateJump(keys, time) {
        const player = this.level.player
        
        if ((keys["ArrowUp"] || player.isJumping) && !player.isFalling) {
            player.isJumping = true
            player.jump(this.gravity, time)

            if (this.collisionsBlock(player) || this.isOutside(player) || player.jumpVelocity.y <= 0) {
                player.isJumping = false
                player.isFalling = true
                player.jumpVelocity.y = 0
                
                if (this.isOutside(player)) player.position.y = 0
            }
        }
        else if (player.isFalling) {
            player.fall(this.gravity, time, player.jumpVelocity) 
            
            if (this.isOutside(player) || this.collisionsBlock(player)) {
                player.position.y = Math.floor(player.position.y)
                player.isFalling = false
                player.jumpVelocity = Object.create(player.velocity)
            }
        }
    }

    updateRun(keys, time) {
        const player = this.level.player

        // update left motion
       
        if (keys["ArrowLeft"]) {
            player.move("left", time)

            if (this.isOutside(player) || this.collisionsBlock(player)) player.move("right", time)
        }

        // update right motion

        if (keys["ArrowRight"]) {
            player.move("right", time)

            if (this.isOutside(player) || this.collisionsBlock(player)) player.move("left", time)
        }

        // check if player isn't on ground

        if (!this.collisionsBlock(player) && !player.isJumping && this.isClicked(keys)) {
            player.isFalling = true
            player.fall(this.gravity, time, player.jumpVelocity)
        }
    }

    updatePlayer(keys, time) {
        this.updateRun(keys, time)
        this.updateJump(keys, time)
    }

    updateLava(time) {
        // update lava bubbles
        
        const bubbles = this.level.lava.filter(lava => lava.sign === "=")
       
        for (const bubble of bubbles) {
            bubble.moveSideward(time)
        }

        // update fallen lavas

        const fallenLavas = this.level.lava.filter(lava => lava.sign === "|")
        
        for (const fallenLava of fallenLavas) {
            fallenLava.fall(this.gravity, time, fallenLava.velocity)

            if (this.isOutside(fallenLava) || this.collisionsBlock(fallenLava)) fallenLava.position = fallenLava.basePosition
        }
        
        // check if any lava hit player
        
        for (const lava of this.level.lava) {
            let player = this.level.player
            
            if (this.collisions(player, lava)) player.health--

            if (player.dead) return true
        }
       
        return false
    }

    updateCoins(time) {
        // check if player touches coin and then delete it
        
        for (const coin of this.level.coins) {
            coin.wobble(time)
            
            if (this.collisions(this.level.player, coin)) this.level.actors = this.level.actors.filter(actor => actor != coin)
        }

        if (this.level.coins.length <= 0) return true

        return false
    }

    update(keys, time) {
        this.updatePlayer(keys, time)
        
        const lose = this.updateLava(time),
        win  = this.updateCoins(time)
        
        if (lose) return false
        if (win) return true
    }
}