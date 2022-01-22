// 要素を取得する noneで非表示 blockで表示
const scrollAreaPokemonList = document.getElementById('scroll_area_pokemon_list')
const pokeContainer = document.getElementById('poke-container')
const pokeContainerBackground = document.getElementById('poke-container_background')
const mainLoading = document.getElementById('loading_main')
const reLoading = document.getElementById('loading_again')

const scrollAreaGameStart = document.getElementById('scroll_area_game_start_screen')
const gameField = document.getElementById('game_field')
const gameFinish = document.getElementById('game_finish')


const header = document.getElementById('header')

// noneで非表示 blockで表示
pokeContainer.style.display = "none"
reLoading.style.display = "none"
pokeContainerBackground.style.display = "none"
scrollAreaGameStart.style.display = "none"
gameField.style.display = "none"
gameFinish.style.display = "none"

// 定数を定義 表示するポケモン数
let pokemon_count = 250;
let pokemon_max_loading_count = 100;
let arrivedBottomPoint = false;
let isPokemonListScreen = true

//imageの全配列
let pokemonImages = []
const maxDisplayPokemonGameCount = 90
let displayPokemonIds = []
let pokemonImageIndex = 0
let clickedPokemonIds = []
const KEY_CLICKED_POKEMON = "key_clicked_pokemon"
let clickedPokemonOnStorage = []

// 秒数カウント用変数
let passSec = 0;
let counter_starter = -1;
const maxCountSecond = 12;
const countUpInterval = 0.25;
//TODO この値が６だとPCによっては落ちるので9くらいに上げると動くと思います
const hidePokemonSpan = 6;

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
    //imageをゲームで使うのでurl.pngを全て格納する
    pokemonImages.push(data.sprites['front_default'])
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
    //gameの準備はこのタイミングで行う
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

    //初期化
    displayPokemonIds = []

    for (let i = 0;i<maxDisplayPokemonGameCount ;i++){
        //TODO ポケモンは被っても良いとする 今はとりあえず100匹ぶんなので変更する
        const id = Math.floor(Math.random() * 100);
        displayPokemonIds.push(id)
    }

    startShowing()
}

function onClickPokemon(id){
    clickedPokemonIds.push(id)
    document.getElementById(id).style.display = "none"
}

// 繰り返し処理の開始
function startShowing() {
    passSec = 0; // カウンタのリセット
    counter_starter = setInterval('showCount()', countUpInterval * 1000); // タイマーをセット(1000ms間隔)
}

function showCount() {
    const restTime = maxCountSecond - passSec - 1
    if (restTime === 0) {
        /*Result画面へ*/
        //TODO これを次の画面に表示する　結果も表示 21匹捕まえました　画像も表示　詳細はBoxをチェックしてね！
        document.getElementById("count").innerHTML = "終了";
        //WebStorageにクリックしたポケモンのidリストを保存
        let json = JSON.stringify(clickedPokemonIds, undefined, 1);
        localStorage.setItem(KEY_CLICKED_POKEMON, json);
        counter_starter = -1
        gameField.style.display = "none"
        gameFinish.style.display = "block"
    } else {
        passSec += countUpInterval // カウントアップ
        showRandomImages025s()
        if(Number.isInteger(passSec - countUpInterval)) document.getElementById("count").innerHTML = "残り時間：" + restTime + "秒";
    }
}

//TODO 0.25秒に一回通るようにする
function showRandomImages025s(){
    //1.fetch時に、事前にpictureUrlのリストを作っておく
    //2.idをランダムで生成する　約180匹
    //ランダムで生成したidをpictureUrlのindexに指定して取り出す
    //ランダムな場所に表示させる
    //タイマーで良いタイミングで消す　それを繰り返す
    //5.onClickでidを渡して他の変数に格納する
    //6.結果が出たらWebStorageに保存する
    //TODO 7.BoxボタンクリックでWebStorageに入っているidを再Fetchする
    //TODo 8.fetch処理を書き換える　できれば全fetchで表示は200くらい
    //TODo なんで終わってもwebstorageに追加されるのか　まあ画面ごと消せば良いが


    // div要素を作成
    const divPokemonRandomImage = document.createElement('div')
    // pokemonクラスを追加 TODO add random_pokemon_box
    divPokemonRandomImage.classList.add('random_pokemon_box')

    //TODO 1秒に３匹くらい表示 iが２だと同じものが表示されるので今が何秒かどうかの計算が必要(passSecを変えれば良い)
    //TODO n=0... 2n 2n+1
    for(let i = 0; i < 2; i++){
        //TODo passSec = 0.5 countUpInterval = 0.25
        pokemonImageIndex = 2 * ((passSec * 4) -1) + i;
        const displayPokemonImage = pokemonImages[displayPokemonIds[pokemonImageIndex]];

        //縦横軸用の乱数生成
        const x = Math.floor(Math.random() * 94);
        const y = Math.floor(Math.random() * 94);

        //box要素にimgタグを追加（乱数を代入した変数をポジションに設定）1回しかクリックさせないためにdisabledを加えた
        divPokemonRandomImage.innerHTML = '<img id="' + pokemonImageIndex + '" src="' + displayPokemonImage + '" onclick="onClickPokemon(pokemonImageIndex)" alt="" style="top:'+y+'%; left:'+x+'%;">'
    }
    //hidePokemonSpan分のindexが離れたものはhide状態にします
    if(pokemonImageIndex >= hidePokemonSpan){
        document.getElementById((pokemonImageIndex - hidePokemonSpan).toString()).style.display = "none"
    }

    gameField.appendChild(divPokemonRandomImage)
}