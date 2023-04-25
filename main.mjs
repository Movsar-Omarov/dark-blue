import Controller from "./Controller/controller.mjs"
import {World} from "./Model/model.mjs"
import Display from "./View/view.mjs"
import levelPlans from "./levels.js"

const canvas = document.getElementById("display")
let levels = levelPlans

const display = new Display(canvas),
world = new World(levels),
controller = new Controller(world, display)

window.addEventListener("keydown", e => {
    controller.updateKey(e.key, true)
    e.preventDefault()
})

window.addEventListener("keyup", ({key}) => {
    controller.updateKey(key, false)
})

function gameOver() {
    return new Promise(resolve => {
       setInterval(() => {
            if (controller.state !== controller.isPlaying) resolve(controller.state)
       }, 1)
    })
}

async function runGame() {
    while (true) {
        try {
            controller.start()
            
            let result = await gameOver()

            if (result === "win") controller.nextLevel()
        }
        catch(e) {
            break
        }
        
    }
}

runGame()