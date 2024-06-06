console.log('haha (content)')
const HINT_KEYS = 'abcdefghijklmnopqrstuvwxyz'
let hintsAndTargets = []

const container = document.createElement('div')
container.id = browser.runtime.id
container.style.zIndex = 100
document.body.appendChild(container)

const input = document.createElement('input')
input.id = browser.runtime.id + '-input'
input.type = 'text'
input.style.display = 'none'
input.style.position = 'absolute'
input.style.top = 0
input.style.left = '25%'
input.style.width = '50%'

input.addEventListener('input', () => {
    const value = input.value
    const possibleHints = hintsAndTargets
        .filter(({ hint }) => hint.textContent.startsWith(value.toLowerCase()))
    console.log(possibleHints)

    if (possibleHints.length == 1) {
        const [ selectedHint ] = possibleHints
        selectedHint.target.click()
        displayHints() // reset hints.
    }
})
document.body.appendChild(input)

function mask(s, m) {
    return s.split('')
        .filter(key => m.includes(key))
        .join('')
}

const charDec = (c) => String.fromCodePoint(c.codePointAt(0) - 1)
const charInc = (c) => String.fromCodePoint(c.codePointAt(0) + 1)

function hintTextInc(hintText) {
    let index = hintText.split('').findIndex(c => c != HINT_KEYS[HINT_KEYS.length - 1])
    if (index == -1) {
        index = hintText.length
        hintText = hintText + charDec(HINT_KEYS[0])
    }
    
    return hintText.split('')
        .map((c, i) => i == index ? charInc(c) : c)
        .join('')
}

function createHintNode(target) {
    const contentBasedHintText = mask(target.textContent.toLowerCase(), HINT_KEYS)
    // TODO: Trim hintText to minimal text
    let hintText = `${contentBasedHintText}aaa`.slice(0, 3)
    while (hintsAndTargets.find(({ hint }) => hint.textContent == hintText)) {
        hintText = hintTextInc(hintText)
    }
    const { x, y } = target.getBoundingClientRect()
    const hint = document.createElement('div')
    hint.textContent = hintText
    
    hint.style.position = 'absolute'
    hint.style.left = x
    hint.style.top = y
    hint.style.backgroundColor = 'yellow'
    hint.style.color = 'black'

    // FIXME: This sucks
    hintsAndTargets.push({ hint, target })
}

function displayHints(message) {
    console.log({ message })

    if (container.childNodes.length > 0) {
        container.innerHTML = ''
        input.style.display = 'none'
        hintsAndTargets = []
        return
    }

    console.assert(
        container.childNodes.length == 0,
        'The container should not contain any (old) hints.'
    )

    Array.from(document.querySelectorAll('a')).forEach(createHintNode)
    hintsAndTargets.forEach(({ hint, target }) => {
        container.appendChild(hint)
    })

    input.value = ''
    input.style.display = 'block'
    input.focus()
}

browser.runtime.onMessage.addListener(message => {
    try {
        displayHints(message)
    } catch (error) {
        console.error(error)
        throw error
    }
})