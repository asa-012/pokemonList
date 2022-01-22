// 要素を取得する noneで非表示 blockで表示
const scrollAreaPokemonList = document.getElementById('scroll_area_pokemon_list')
const pokeContainer = document.getElementById('poke-container')
const pokeContainerBackground = document.getElementById('poke-container_background')
const mainLoading = document.getElementById('loading_main')
const reLoading = document.getElementById('loading_again')

const scrollAreaGameStart = document.getElementById('scroll_area_game_start_screen')
const gameField = document.getElementById('game_field')

const header = document.getElementById('header')

// noneで非表示 blockで表示
pokeContainer.style.display = "none"
reLoading.style.display = "none"
pokeContainerBackground.style.display = "none"
scrollAreaGameStart.style.display = "none"
gameField.style.display = "none"

// 定数を定義 表示するポケモン数
let pokemon_count = 250;
let pokemon_max_loading_count = 100;
let arrivedBottomPoint = false;
let isPokemonListScreen = true

// 秒数カウント用変数
let passSec = 0;
let passageId = -1;
const maxCountSecond = 30;

// カラー
const colors = {
    fire: '#FDDFDF',
    grass: '#DEFDE0',
    electric: '#FCF7DE',
    water: '#DEF3FD',
    ground: '#f4e7da',
    rock: '#d5d5d4',
    fairy: '#fceaff',
    poison: '#98d7a5',
    bug: '#f8d5a3',
    dragon: '#97b3e6',
    psychic: '#eaeda1',
    flying: '#F5F5F5',
    fighting: '#E6E0D4',
    normal: '#F5F5F5'
}

// colorsのkeyを配列に格納
const main_types = Object.keys(colors)

// ポケモン取得
const fetchPokemons = async () => {
    for (let i = 1; i <= pokemon_count; i++) {
        if (i <= pokemon_max_loading_count) {
            await getPokemon(i, true)
            if (i === pokemon_max_loading_count) {
                scrollToBottom()
            }
        } else {
            mainLoading.remove()
            pokeContainer.style.display = "block"
            reLoading.style.display = "block"
            await getPokemon(i, false)
        }
    }
    // //追加ローディング分岐処理
    // if (pokemon_count <= pokemon_max_loading_count) {
    //     pokemon_count = -1
    //     pokemon_max_loading_count = -1
    //     //Nothing　追加ローディングなし
    // } else if (pokemon_max_loading_count * 2 > pokemon_count) {
    //     //300の時に190だった場合に次の追加ローディングで190まで読み込みたいから
    //     pokemon_start_loading_count += pokemon_max_loading_count
    //     pokemon_max_loading_count = pokemon_count
    // } else {
    //     //400とかだった場合に２倍の３００まで読み込む
    //     pokemon_start_loading_count += pokemon_max_loading_count
    //     pokemon_max_loading_count *= 2
    // }
}

const getPokemon = async (id, isShow) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`
    const res = await fetch(url)
    const data = await res.json()
    createPokemonCard(data, isShow)
}

// ポケモンカードを作成
const createPokemonCard = (pokemon, isShow) => {
    // div要素を作成
    const pokemonEl = document.createElement('div')
    // pokemonクラスを追加
    pokemonEl.classList.add('pokemon')

    // ポケモン情報からデータを格納
    const name = pokemon.name[0].toUpperCase() + pokemon.name.slice(1)
    const id = pokemon.id.toString().padStart(3, '0')
    const poke_types = pokemon.types.map(type => type.type.name)
    const type = main_types.find(type => poke_types.indexOf(type) > -1)
    const image = pokemon.sprites['front_default']
    // ポケモンの背景色を設定
    pokemonEl.style.backgroundColor = colors[type]

    // ポケモンカードのテンプレ
    // ポケモンカードのテンプレートを追加
    pokemonEl.innerHTML = `
    <div class="img-container">
        <img src=${image} alt="">
    </div>
    <div class="info">
        <span class="number">#${id}</span>
        <h3 class="name">${name}</h3>
        <small class="type">Type: <span>${type}</span> </small>
    </div>
    `

    if (isShow) {
        // poke_containerの子要素として追加
        pokeContainer.appendChild(pokemonEl)
    } else {
        pokeContainerBackground.appendChild(pokemonEl)
    }

}

function scrollToBottom() {
    // 一番下までスクロールした時の数値を取得(window.innerHeight分(画面表示領域分)はスクロールをしないため引く)
    const bodyHeight = document.body.clientHeight // bodyの高さを取得
    const windowHeight = window.innerHeight // windowの高さを取得
    let bottomPoint = bodyHeight - windowHeight

    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop;
        console.log(scrollTop)
        //一番下にスクロール&&1回でも一番下にスクロールしたか&今の画面がpokemonListかどうか
        if (scrollTop >= bottomPoint && !arrivedBottomPoint && isPokemonListScreen) {
            console.log("bottom")
            //一番下にスクロールした時に5秒ローディング
            setTimeout(function() {
                pokeContainerBackground.style.display = "block";
                reLoading.style.display = "none";
            }, 5000);
            arrivedBottomPoint = true
        }
    });
}
fetchPokemons().then(_ => {})

function onClickPokemonList() {
    //TODO この条件は全てのクリック箇所で実装すること
    header.style.visibility = 'visible'
    isPokemonListScreen = true
    scrollAreaPokemonList.style.display = "block"
    scrollAreaGameStart.style.display = "none"
    gameField.style.display = 'none'
}

function onClickGame() {
    header.style.visibility = 'visible'
    isPokemonListScreen = false
    scrollAreaPokemonList.style.display = "none"
    scrollAreaGameStart.style.display = "block"
    gameField.style.display = 'none'
}

function onClickGameStart() {
    header.style.visibility = 'hidden'
    scrollAreaGameStart.style.display = 'none'
    gameField.style.display = 'block'
    startShowing()
}

function showPassage() {
    const restTime = maxCountSecond - passSec - 1
    if (restTime === 0) {
        /*Result画面へ*/
        document.getElementById("count").innerHTML = "終了";
    } else {
        passSec++; // カウントアップ
        document.getElementById("count").innerHTML = "残り時間：" + restTime + "秒";
    }
}

// 繰り返し処理の開始
function startShowing() {
    passSec = 0; // カウンタのリセット
    passageId = setInterval('showPassage()', 1000); // タイマーをセット(1000ms間隔)
}

// 繰り返し処理の中止
function stopShowing() {
    clearInterval(passageId); // タイマーのクリア
}