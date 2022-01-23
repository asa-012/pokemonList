// 要素を取得する noneで非表示 blockで表示
const scrollAreaPokemonList = document.getElementById('scroll_area_pokemon_list')
const pokeContainer = document.getElementById('poke-container')
const pokeContainerBackground = document.getElementById('poke-container_background')
const mainLoading = document.getElementById('loading_main')
const reLoading = document.getElementById('loading_again')

const scrollAreaGameStart = document.getElementById('scroll_area_game_start_screen')
const gameField = document.getElementById('game_field')
const gameFinishField = document.getElementById('game_finish_field')
const gameCountAndFinishText = document.getElementById("count_text")
const gameFinishText = document.getElementById("text_finish")
const gameFinishCompileText = document.getElementById("text_finish_compile")
const gameFinishRegisterText = document.getElementById("text_finish_register")
const gameFinishNavigationText = document.getElementById("text_finish_navigation")
const imageFinishScoreContainer = document.getElementById("image_finish_score")
const gameFinishPokemonCountText = document.getElementById("text_image_finish_score")


const header = document.getElementById('header')

// noneで非表示 blockで表示
pokeContainer.style.display = "none"
reLoading.style.display = "none"
pokeContainerBackground.style.display = "none"
scrollAreaGameStart.style.display = "none"
gameField.style.display = "none"
gameFinishField.style.display = "none"
gameFinishCompileText.style.display = "none"
gameFinishRegisterText.style.display = "none"
gameFinishNavigationText.style.display = "none"
imageFinishScoreContainer.style.display = "none"

// 定数を定義 表示するポケモンidのMax数
let pokemon_count = 720;
let pokemon_max_loading_count = 20;
let arrivedBottomPoint = false;
let isPokemonListScreen = true

//imageの全配列
let pokemonImages = []
const maxDisplayPokemonGameCount = 80
let displayPokemonIds = []
let clickedPokemonIds = []
const KEY_CLICKED_POKEMON = "key_clicked_pokemon"
let clickedPokemonIdsOnStorage = []

// 秒数カウント用変数
let passSec = 0;
let COUNTER_GAME_MAIN = -1;
const maxCountSecond = 10;
const countUpInterval = 0.25;

//gameが終わった後のFlow
let COUNTER_GAME_FINISH = -1;
let finishGameFlowIntervalCount = 0;

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

/**
 * WebStorageを取得します
 * @returns {Promise<void>}
 */
async function getWebStorage() {
    clickedPokemonIdsOnStorage = JSON.parse(localStorage.getItem(KEY_CLICKED_POKEMON))
}

/**
 * ポケモン画像全てのimageUrlをローカルに保存します
 * @returns {Promise<void>}
 */
const fetchAllPokemonImage = async () => {
    for (let i = 1; i <= pokemon_count; i++) {
            await getPokemonAllImage(i)
    }
}

/***
 * 対象のポケモンの情報を取得します
 * @returns {Promise<void>}
 */
const fetchPokemons = async () => {
    if(clickedPokemonIdsOnStorage != null) {
        for (let i = 0; i <= clickedPokemonIdsOnStorage.length; i++) {
            if (i <= pokemon_max_loading_count + 1) {
                await getPokemon(clickedPokemonIdsOnStorage[i], true)
                if (i === pokemon_max_loading_count) {
                    scrollToBottom()
                }else if (i === clickedPokemonIdsOnStorage.length){
                    mainLoading.style.display = "none"
                    pokeContainer.style.display = "block"
                }
            } else {
                mainLoading.style.display = "none"
                pokeContainer.style.display = "block"
                reLoading.style.display = "block"
                await getPokemon(clickedPokemonIdsOnStorage[i], false)
            }
        }
    }else{
        mainLoading.style.display = "none"
        pokeContainer.style.display = "block"
    }
}

const getPokemonAllImage = async (id) => {
    if(id !== undefined) {
        const url = `https://pokeapi.co/api/v2/pokemon/${id}`
        const res = await fetch(url)
        const data = await res.json()
        pokemonImages.push(data.sprites['front_default'])
    }
}

const getPokemon = async (id, isShow) => {
    if(id !== undefined) {
        const url = `https://pokeapi.co/api/v2/pokemon/${id}`
        const res = await fetch(url)
        const data = await res.json()
        createPokemonCard(data, isShow)
    }
}

/**
 * ポケモンのカードを作成します
 * @param pokemon
 * @param isShow
 */
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

/**
 * 一番下までスクロールした時に追加ローディングをします
 * 最初の20個はfetch全てが完了していなくても表示させバックグラウンドで表示し
 * 一番下までスクロールした時に再度残りの内容を表示させます
 * 全てを一気に表示だとローディングが長くなるからこのようにしました
 */
function scrollToBottom() {
    // bodyとwindowの高さを取得し一番下のheightの値を計算します
    const bodyHeight = document.body.clientHeight
    const windowHeight = window.innerHeight
    let bottomPoint = bodyHeight - windowHeight

    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop;
        //一番下にスクロール&&1回でも一番下にスクロールしたか&今の画面がpokemonListかどうか
        if (scrollTop >= bottomPoint && !arrivedBottomPoint && isPokemonListScreen) {
            //一番下にスクロールした時に4秒ローディング
            setTimeout(function() {
                pokeContainerBackground.style.display = "block";
                reLoading.style.display = "none";
            }, 4000);
            arrivedBottomPoint = true
        }
    });
}

/**
 * 右上、もしくはゲーム終了時にページをリロードします
 */
function onClickPokemonList() {
    window.location.reload();
}

/**
 * メニューバーのgameボタンのクリック処理
 */
function onClickGame() {
    header.style.visibility = 'visible'
    isPokemonListScreen = false
    scrollAreaPokemonList.style.display = "none"
    scrollAreaGameStart.style.display = "block"
    gameField.style.display = 'none'
    gameFinishText.style.text = "block"
    gameFinishCompileText.style.display = "none"
    gameFinishRegisterText.style.display = "none"
    gameFinishNavigationText.style.display = "none"
}

/**
 * game画面のゲームスタートボタンのクリック処理
 */
function onClickGameStart() {
    header.style.visibility = 'hidden'
    scrollAreaGameStart.style.display = 'none'
    gameField.style.display = 'block'

    //初期化
    displayPokemonIds = []
    clickedPokemonIdsOnStorage = JSON.parse(localStorage.getItem(KEY_CLICKED_POKEMON))

    for (let i = 0;i<maxDisplayPokemonGameCount ;i++){
        //ポケモンは被っても良いとする
        const id = Math.floor(Math.random() * pokemon_count);
        displayPokemonIds.push(id)
    }
    startShowingCounter()
}

/**
 * ポケモンをクリックした時の関数
 * クリックしたポケモンのidを保存します
 * クリックしたポケモンをhide状態にします
 * @param id
 */
function onClickPokemon(id){
    if(id != null) {
        clickedPokemonIds.push(id)
        document.getElementById(id).style.display = "none"
    }
}

/**
 * タイマー繰り返し処理の開始
 */
function startShowingCounter() {
    passSec = 0; // カウンタのリセット
    COUNTER_GAME_MAIN = setInterval('showCount()', countUpInterval * 1000); // タイマーをセット
}

/**
 * game用Counterの関数　
 * countUpInterval秒ごとに実行
 * 残り時間０になった時に終了画面に遷移し、タイマーのInterval処理を削除します
 */
function showCount() {
        const restTime = maxCountSecond - passSec - 1
        if (restTime === 0) {
            clearInterval(COUNTER_GAME_MAIN)
            //Result画面へ
            gameCountAndFinishText.innerHTML = "終了";
            gameField.style.display = "none"
            gameFinishField.style.display = "block"
            let result = []
            if (clickedPokemonIdsOnStorage != null) {
                result = clickedPokemonIdsOnStorage.concat(clickedPokemonIds)
            } else {
                result = clickedPokemonIds
            }
            const clickedPokemonIdsJson = JSON.stringify(result);
            localStorage.setItem(KEY_CLICKED_POKEMON, clickedPokemonIdsJson);
            //タイマーをセット
            COUNTER_GAME_FINISH = setInterval('finishGameFlow()', 1500);
        } else {
            //カウントアップ
            passSec += countUpInterval
            showRandomImages025s()
            if (Number.isInteger(passSec - countUpInterval)) gameCountAndFinishText.innerHTML = "残り時間：" + restTime + "秒";
        }
}

/**
 * ゲーム終了時に1.5秒ごとにそれぞれ処理が実施されます
 * これにより擬似アニメーションを作成しています
 */
function finishGameFlow(){
    //HACK:SetInterval内ではinnerHTMLを書き換えることはできない仕様となっているからvisibleで文字列を変える　
    finishGameFlowIntervalCount++
    if(finishGameFlowIntervalCount === 1){
        gameFinishText.style.display = "none"
        gameFinishField.style.display = "none"
        mainLoading.style.display = 'block'
        finishGamePokemonImage()
    }else if(finishGameFlowIntervalCount === 2){
        mainLoading.style.display = "none"
        gameFinishField.style.display = "block"
        imageFinishScoreContainer.style.display = "block"
    }else if(finishGameFlowIntervalCount === 5){
        imageFinishScoreContainer.style.display = "none"
        gameFinishRegisterText.style.display = "block"
    }else if(finishGameFlowIntervalCount === 6){
        gameFinishRegisterText.style.display = "none"
        gameFinishField.style.display = "none"
        mainLoading.style.display = "block"
    }else if(finishGameFlowIntervalCount === 7){
        clearInterval(COUNTER_GAME_FINISH)
        onClickPokemonList()
    }
}

/**
 * 0.25秒に一回ポケモン画像を表示させる関数です
 */

function showRandomImages025s(){
    // div要素を作成
    const divPokemonRandomImage = document.createElement('div')
    const pokemonImageIndex = 2 * ((passSec * 4) -1);
    const displayPokemonId = displayPokemonIds[pokemonImageIndex]
    const displayPokemonImage = pokemonImages[displayPokemonId -1];

    //縦横軸用の乱数生成
    const x = Math.floor(Math.random() * 94);
    const y = Math.floor(Math.random() * 94);

    //追加したdiv要素にimgタグを追加（乱数を代入した変数をポジションに設定)
    divPokemonRandomImage.innerHTML = '<img id="' + displayPokemonId + '" src="' + displayPokemonImage + '" onclick="onClickPokemon(' + displayPokemonId + ')" alt="" style="top:'+y+'%; left:'+x+'%;">'
    gameField.appendChild(divPokemonRandomImage)
}

/**
 * finish画面での捕まえたポケモンの情報をセットする関数
 * １０匹ごとにポケモンを表示し１０匹超えたら次の行に表示する
 * ０匹の時はテキストを変える　それ以外は捕まえたポケモンの数を表示する
 */
function finishGamePokemonImage() {
    const result = clickedPokemonIds
    if (result !== undefined) {
        // div要素を作成
        const divPokemonImage = document.createElement('div')
        for (let i = 0; i < result.length; i++) {
            //floorで切り捨てする　横10ずつ増やし１０超えたら縦に１０増やす
            const multiple = Math.floor(i / 10) + 1
            let x = 0
            const y = multiple * 20
            if(multiple < 2) {
                x = 10 * (i % 10)
            }else{
                x = 10 * (i % 10) -10
            }
            divPokemonImage.innerHTML += '<img src="' + pokemonImages[result[i]-1] + '" alt="" style="top:' + y + '%; left:' + x + '%;">'
        }
        if(result.length !== 0){
            gameFinishPokemonCountText.innerHTML = 'あなたはポケモンを'+ result.length + '匹捕まえました.<br><br>画像は以下の通りです'
        }else{
            gameFinishPokemonCountText.innerHTML = 'あなたはポケモンを捕まえれませんでした.'
        }
        imageFinishScoreContainer.appendChild(divPokemonImage)
    }
}

getWebStorage().then(_ => {fetchPokemons().then(_ => {})})
fetchAllPokemonImage().then(_ => {})