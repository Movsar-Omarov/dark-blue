import Controller from "./Controller/controller.mjs"
import World from "./Model/model.mjs"
import Display from "./View/view.mjs"

const canvas = document.getElementById("display")
let levels = [
    `
    ......................
    ..#................#..
    ..#..............=.#..
    ..#.........o.o....#..
    ..#.@......#####...#..
    ..#####............#..
    ......#++++++++++++#..
    ......##############..
    ......................`
]

levels = levels.map(level => World.getLevel(level))

const display = new Display(canvas),
world = new World(levels),
controller = new Controller(world, display)

window.addEventListener("keydown", e => {
    if (e.key in controller.keys) controller.keys[e.key] = true
    e.preventDefault()
})

window.addEventListener("keyup", e => {
    if (e.key in controller.keys) controller.keys[e.key] = false
})

function runMatch() {
    return new Promise(resolve => {
        controller.start()

        resolve(controller.state)
    })
}

async function runGame() {
    while (true) {
        try {
            result = await runMatch()
        }
        catch(e) {
            break
        }

        if (result == "win") controller.nextLevel()
    }
}

runGame()