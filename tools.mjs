export default function randomDirection() {
    let probability = Math.random() * 10

    if (probability <= 5) return 1
    return -1
}