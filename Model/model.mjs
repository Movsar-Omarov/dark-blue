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
    constructor(position, velocity, size, sign, color, direction) {
        super(position, velocity, size, sign, color)
        this.direction = direction
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

        // check if coin goes over borders

        const lowerBorder = this.basePosition.y + 1,
        upperBorder = this.basePosition.y - 1
        
        if (this.position.y + this.size.y < lowerBorder && 
            this.position.y > upperBorder) return 
        
        if (this.position.y < upperBorder) this.position.y = upperBorder
        else this.position.y = lowerBorder - this.size.y
        
        this.direction *= -1 
    }
}

class Lava extends Actor {
    constructor(position, velocity, sign) {
        super(Object.create(position), Object.create(velocity), new Vector(1, 1), sign, new RGB(255, 69, 0), randomDirection())
        this.basePosition = Object.create(position)
        this.baseVelocity = Object.create(velocity)
    }

    moveSideward(time) {
        this.position.x += this.velocity.x * this.direction * time

        // check if lava goes over borders

        const rightBorder = this.basePosition.x + 2,
        leftBorder = this.basePosition.x - 2
        
        if (this.position.x + this.size.x < rightBorder &&
            this.position.x > leftBorder) return
        
        if (this.position.x < leftBorder) this.position.x = leftBorder
        else this.position.x = rightBorder - this.size.x
        
        this.direction *= -1
    }
}

class Player extends Actor {
    constructor(position, velocity) {
        super(position, velocity, new Vector(1, 2), "@", new RGB(0, 0, 255), 0)
        this.isJumping = false
        this.isFalling = false
        this.jumpVelocity = Object.create(this.velocity)
        this.health = 3
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
                    level.push(new Lava(position, null, actor))
                    break
                case "v":
                    level.push(new Lava(position, new Vector(0, 2), actor))
                    break
                case "=":
                    level.push(new Lava(position, new Vector(2, 0), actor))
                    break
                case "o":
                    level.push(new Coin(new Vector(x, y - 0.5)))
                    break
                case "@":
                    level.push(new Player(new Vector(x, y - 1), new Vector(4, 3)))
            }
        }

        return actors.concat(level)
    }, [])
}

class Level {
    constructor(plan) {
        this.plan = plan
        
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

    static getLevel(plan) {
        return new this(plan)
    }
}

export default class World {
    constructor(levels, levelObject = Level) {
        this.levels = levels.map(level => levelObject.getLevel(level))
        this.gravity = 0.981
        this.currentLevel = 0
        this.levelObject = levelObject
    }

    get level() {
        return this.levels[this.currentLevel]
    }

    get lava() {
        return this.level.lava
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

    collisionsLava(actor) {
        for (const lava of this.level.lava) {
            if (this.collisions(actor, lava)) return true
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
            
                if (this.isOutside(player) ) player.position.y = 0
                
                if (this.collisionsBlock(player)) player.position.y = Math.ceil(player.position.y)
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

        if (keys["ArrowLeft"]) {
            player.move("left", time)

            if (this.isOutside(player) || this.collisionsBlock(player)) player.move("right", time)
        }

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

    updateLavaBubbles(time) {
        const bubbles = this.lava.filter(lava => lava.sign === "=")
       
        for (const bubble of bubbles) {
            bubble.moveSideward(time)

            if (this.collisionsBlock(bubble)) {
                bubble.position.x = Math.round(bubble.position.x)
                bubble.direction *= -1
            }
        }
    }

    updateFallenLavas(time) {
        const fallenLavas = this.lava.filter(lava => lava.sign === "v")
        
        for (const fallenLava of fallenLavas) {
            fallenLava.fall(this.gravity, time, fallenLava.velocity)
            
            if (this.isOutside(fallenLava) || this.collisionsBlock(fallenLava)) {
                fallenLava.position.y = fallenLava.basePosition.y
                fallenLava.velocity.y = fallenLava.baseVelocity.y
            }
        }
    }

    anyLavaHitsPlayer() {
        for (const lava of this.lava) {
            let player = this.level.player
            
            if (this.collisions(player, lava)) player.health--

            if (player.dead) return true
        }
       
        return false
    }

    updateLava(time) {
        this.updateLavaBubbles(time)
        this.updateFallenLavas(time)

        return this.anyLavaHitsPlayer()
    }

    updateCoins(time) {
        // check if player or lava touches coin and then delete it
        
        for (const coin of this.level.coins) {
            coin.wobble(time)
            
            if (this.collisionsBlock(coin)) {
                coin.position.y = Math.round(coin.position.y)
                coin.direction *= -1
            }

            if (this.collisions(this.level.player, coin) || 
                this.collisionsLava(coin)) this.level.actors = this.level.actors.filter(actor => actor != coin)
        }

        if (this.level.coins.length <= 0) return true

        return false
    }

    update(keys, time) {
        this.updatePlayer(keys, time)
        // console.log(this.level.player.position)
        const lose = this.updateLava(time),
        win  = this.updateCoins(time)
        
        if (lose || win) this.levels[this.currentLevel] = this.levelObject.getLevel(this.level.plan)
        
        if (lose) return false
        if (win) return true
    }
}