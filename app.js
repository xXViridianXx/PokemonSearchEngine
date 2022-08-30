const form = document.querySelector('#searchPokemon')

const container = document.querySelector('#container')

const spriteContainer = document.querySelector('#spriteContainer')

const inputText = document.querySelector('#input')

const movesLvl = document.querySelector('#movesLvl')
const learnable = document.querySelector('#learnable')

const stats = document.querySelector('#stats')

const type1 = document.querySelector('#type1')
const type2 = document.querySelector('#type2')

const lM = document.querySelector('#learnableMoves')
const tM = document.querySelector('#teachableMoves')

const lU = document.querySelector('#lvl-Up')
const tB = document.querySelector('#teach')



const colors = {
    Bug: '#A8B820', Dark: '#705848', Dragon: '#7038F8', Electric: '#F8D030', Fairy: '#EE99AC',
    Fighting: '#C03028', Fire: '#F08030', Flying: '#A890F0', Ghost: '#705898', Grass: '#78C850',
    Ground: '#E0C068', Ice: '#98D8D8', Normal: '#A8A878', Poison: '#A040A0', Psychic: '#F85888',
    Rock: '#B8A038', Steel: '#B8B8D0', Water: '#6890F0'
}


// read submit from form
// stores query in string var pokemon
// form.elements.query.value gets input
form.addEventListener('submit', (e) => {
    e.preventDefault();
    removeStuff()
    let pokemon = `${form.elements.query.value}`
    inputText.value = ''
    getPokemon(pokemon.toLowerCase())
})

// how to fetch a url


const getPokemon = async (pokemon) => {

    try {
        const pkmn = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)

        // data containers
        info = pkmn.data
        pokedexNumber = info.id
        console.log(info)
        pkmnAbilities = []
        pkmnHidden = []
        pkmnTypes = []
        pkmnLvlMoves = []
        pkmnOtherMoves = []
        pkmnStats = []

        // an Array for the abilities
        abilityArr = info.abilities
        typeArr = info.types
        movesArr = info.moves

        getSprites(pokedexNumber, info)
        getStats(info.stats, 'Stats')

        for (let ty of typeArr) {
            pkmnTypes.push(`${ty.type.name}`)
        }

        console.log(`${info.name}`)
        let firstType = capitalize(pkmnTypes[0])
        let secondType = ''
        if (pkmnTypes.length > 1) {
            secondType = capitalize(pkmnTypes[1])
            changeTypeColor(colors[firstType], colors[secondType])
            type2.innerText = `${secondType}`
            type2.style.padding = '20px'
        }
        else {
            changeTypeColor(colors[firstType], colors[firstType])
            
        }

        type1.innerText = `${firstType}`
        type1.style.padding = '20px'
              
        pkmnPowers(pkmnAbilities, pkmnHidden)

        pkmnAttacks(movesArr, pkmnLvlMoves, pkmnOtherMoves)
        tableHeadings([lU, tB], ['Level-Up','Teachable'])
        loadMoveTable(pkmnLvlMoves, lM)
        loadMoveTable(pkmnOtherMoves, tM)

    }
    catch (e) {
        removeStuff()
        const error = document.createElement('h1')
        error.innerText = "Sorry, we couldn't find that..."
        container.append(error)
    }
}

// filters pokemon abilities from regular to hidden
// prints out both if exists
function pkmnPowers(pkmnAbilities, pkmnHidden) {
    for (let ab of abilityArr) {
        if (ab.is_hidden == true) {
            pkmnHidden.push(`${ab.ability.name}`)
        }
        else {
            pkmnAbilities.push(`${ab.ability.name}`)

        }
    }

    console.log(`Ability: ${pkmnAbilities.join(", ")}`)

    if (pkmnHidden.length > 0) {
        console.log(`Hidden Ability: ${pkmnHidden.join(", ")}`)
    }
}

// loads move into respective table
// also fetches the move's type
// this is why it takes longer than before
async function loadMoveTable(moveData, table) {
    try {
        const tableBody = document.createElement('tbody')
        let moveHTML = ''
        // table row with move name data nd move lvl data
        for (let move of moveData) {
            const mvType = await axios.get(`https://pokeapi.co/api/v2/move/${move.name}/`)
            moveHTML += `<tr><td>${mvType.data.type.name}</td><td>${move.name}</td><td>${move.lvl}</td></tr>`
        }

        tableBody.innerHTML = moveHTML
        table.append(tableBody)
    }
    catch (e){
        console.log("didn't find move", e)
    }
}

// pushes pokemon attaks to array
function pkmnAttacks(movesArr, pkmnLvlMoves, pkmnOtherMoves) {

    for (let mv of movesArr) {
        object = { name: mv.move.name, lvl: mv.version_group_details[0].level_learned_at }
        if (object.lvl == 0) {
            pkmnOtherMoves.push(object)
        }
        else {
            pkmnLvlMoves.push(object)
        }
    }

    // sorts and prints lvl-up moves
    // prints learnable moves
    console.log('Level-Up Moves:')
    if (pkmnLvlMoves.length > 0) {
        pkmnLvlMoves.sort((a, b) => {
            return a.lvl - b.lvl
        })
        console.log(pkmnLvlMoves)
    }

    console.log('Learnable Moves:')
    if (pkmnOtherMoves.length > 0) {
        console.log(pkmnOtherMoves)
    }

}

// gets pictures of pokemon
function getSprites(pokedexNumber, pokemon) {
    const imageContainer = document.createElement('div')
    const mainImage = document.createElement('figure')
    const pkmnName = document.createElement('figcaption')
    const pixel1 = document.createElement('figure')
    const pixel2 = document.createElement('figure')


    const hdImage = `https://pokemon.snowflakedev.org/img/${pokedexNumber}.png`
    const pkmnImage = document.createElement('img')
    const defaultSprite = document.createElement('img')
    const shinySprite = document.createElement('img')


    pkmnImage.src = hdImage

    pkmnName.innerText = capitalize(pokemon.name)
    defaultSprite.src = pokemon.sprites.front_default
    shinySprite.src = pokemon.sprites.front_shiny

    pkmnImage.style.objectFit = 'cover'

    mainImage.append(pkmnImage, pkmnName)



    pixel1.append(defaultSprite)
    pixel2.append(shinySprite)

    pkmnImage.classList.add('art')

    pixel1.classList.add('spr1')
    pixel2.classList.add('spr2')



    imageContainer.append(pixel1, pixel2)



    mainImage.classList.add('qPokemon')
    imageContainer.classList.add('sPokemon')
    container.append(mainImage)
    spriteContainer.append(imageContainer)
}

// capitalizes pokemon name
function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.substring(1)
}

// gets pokemon's stats and changes innerText
function getStats(sts, statsTitle) {
    const title = document.createElement('h2')
    title.innerText = statsTitle
    stats.append(title)
    let bst = 0

    for (let i of sts) {
        const currentStat = document.createElement('li')
        bst += i.base_stat
        currentStat.innerText = `${i.stat.name}:          ${i.base_stat}`
        stats.append(currentStat)
    }

    const finalBST = document.createElement('h2')
    finalBST.innerText = `BST:  ${bst}`
    stats.append(finalBST)

}

// changes color of background to pokemon type
function changeTypeColor(color1, color2) {
    container.style.backgroundImage = `linear-gradient(37deg, ${color1} 50%, ${color2} 50%)`
}

// dynamically updates table for moves
function tableHeadings(head, what) {
    head[0].innerHTML = what[0]
    head[1].innerHTML = what[1]
    let type = '<th>Type</th>'
    let move = '<th>Move</th>'
    let level = '<th>Level</th>'
    let epic = type + move + level
    const tableTitles = document.querySelectorAll('.trHeading')
    i = 0
    tableTitles.forEach(x => {
        x.innerHTML = epic
        i+=1
    })

}

// removes everything for each new search
function removeStuff(){
    if (container) {
        $(container).empty()
        $(movesLvl).empty()
        $(learnable).empty()
        $(stats).empty()
        $(spriteContainer).empty()
        $('tbody').empty()
        $('tbody').remove()
        $('tr').empty()
        type1.innerText = ''
        type2.innerText = ''
        type1.style.padding = '0'
        type2.style.padding = '0'
        lU.innerText =''
        tB.innerText =''
    }
}
