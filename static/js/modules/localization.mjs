const translations = {
    'en': {},
    'chs': {}
}
const pokemonNames = {}
const strLang = 'preferredLang'
let currentLang = localStorage.getItem(strLang) || 'en';
let callbacks = []
let bLocalizationLoaded = false
let bPokemonNamesLoaded = false
console.log('localization.mjs loaded')

function sleep(time){
 return new Promise((resolve) => setTimeout(resolve, time));
}

function initLocalizationFile() {
    $.getJSON('static/resources/localization/localization.json', function (data) {
        console.log('load localization file');

        $.each(data, function (key, value) {
            let en_text = key;
            if ('en' in value){
                en_text = value['en']
            }
            translations['en'][key] = en_text;
            translations['chs'][key] = value['chs'];

            // console.log(key + ' : ' + value)
        });
        bLocalizationLoaded = true;
    });
}

function initPokemonNames() {
    $.getJSON('static/resources/localization/allpokemons.json', function (data) {
        $.each(data, function (key, value) {
            pokemonNames[value['en']] = {
                'en' : value['en'],
                'chs' : value['chs'],
            };
        });
        bPokemonNamesLoaded = true;
    });
}

function initLocalizationModule() {
    initLocalizationFile();
    initPokemonNames();
}

function isInitialized() {
    return bLocalizationLoaded && bPokemonNamesLoaded;
}

initLocalizationModule();

function getLocTextInternal(originalString) {
    if (originalString in translations[currentLang]) {
        return translations[currentLang][originalString]
    }
    //console.log(originalString + ' is not in localizaion.')
    return originalString
}

function getLocTextWithExtraMarks(key, originalString){
    let searchKey = key;
    //console.log('key ' + key + ', ' + originalString)
    if (key.length == 0){
        searchKey = originalString;
    }

    let strInTrans = getLocTextInternal(searchKey);

    if (originalString.startsWith(searchKey) && originalString.length > searchKey.length){
        let additionStr = originalString.substring(searchKey.length);
        return strInTrans + additionStr
    }

    return strInTrans
}

function updateContent(lang = 'en') {    
    // 获取语言包
    const langData = translations[lang];

    // 遍历所有需要翻译的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = getLocTextWithExtraMarks(key, element.textContent);
    });

    document.querySelectorAll('label').forEach(element => {
        const key = element.getAttribute('for');

        if (element.textContent in langData) {
            element.textContent = langData[element.textContent];
        }
        else if (key != null && key in langData) {
            element.textContent = langData[key];
        }
    });

    document.querySelectorAll('button').forEach(element => {
        if (element.textContent in langData) {
            element.textContent = langData[element.textContent];
        }
    });

    document.querySelectorAll('select').forEach(element => {
        if (element.textContent in langData) {
            element.textContent = langData[element.textContent];
        }
        let id = element.getAttribute('id')
        if (id == "selectfilter") {
            element.querySelectorAll('option').forEach(child => {
                if (child.textContent in langData) {
                    child.textContent = langData[child.textContent];
                }
                else {
                    let results = []
                    let splited = child.textContent.split(' ')
                    splited.forEach(sp => {
                        if (sp in langData) {
                            results.push(langData[sp])
                        }
                        else {
                            results.push(sp)
                        }
                    })
                    child.textContent = results.join(' ')
                }
            })
        }
    });

    document.querySelectorAll('[placeholder]').forEach(element => {
        const key = element.getAttribute('placeholder');
        const res = getLocText(key);
        if (res != key){
            element.setAttribute('placeholder', res);
        }
    });
}

function switchToNewLang(lang = 'en') {
    console.log('switchToNewLang ' + lang)
    currentLang = lang

    //updateContent(currentLang);

    // 保存用户选择
    localStorage.setItem(strLang, lang);

    // 刷新页面
    window.location.reload(true);

    // callbacks.forEach(element => {
    //     element(lang);
    // });
}

export function translateNode(inNode) {
    inNode.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        // Cannot use textContent here for some nested span
        element.innerHTML = getLocTextWithExtraMarks(key, element.innerHTML);
    });
}

export function addLanguageSwitchCallback(callback) {
    callbacks.push(callback);
}

async function waitForUpdateContent() {
    // wait until the localizaion file has been loaded
    let waitTime = 0;
    while (!isInitialized() && waitTime < 5000){
        console.log('localization file is not ready.')
        waitTime+=100;
        await sleep(100);
    }
    if (waitTime >= 5000){
        console.warn('waitForUpdateContent timeout.')
    }
    updateContent(currentLang);
}

export function initLanguageSwitcher(callback) {
    let switcher = document.getElementById('languageSwitcher');
    if (switcher) {
        switcher.value = currentLang;
        switcher.addEventListener('change', (e) => {
            switchToNewLang(e.target.value);
        });
    }

    waitForUpdateContent();
    
    callbacks.push(callback);
}

export function getLocText(originalString) {
    return getLocTextInternal(originalString)
}

function handleSpecialPokemonName(originalString) {
    // possibilities:
    // AlphaPikachu
    // Alpha Pikachu
    // Alpha XXX-1
    // Alpha Mime Jr.

    let pendingStr = originalString;
    let addedStr = '';
    if (originalString.indexOf('-') > -1){
        let pendings = originalString.split('-');
        pendingStr = pendings[0];
        addedStr = pendings[1];
    }

    let strings = [];
    const delimiter = ' ';
    const index = pendingStr.indexOf(delimiter);
    if (index == -1){
        strings.push(pendingStr);
    }
    else{
        strings.push(pendingStr.substring(0, index));
        strings.push(pendingStr.substring(index + delimiter.length));
    }

    let result = '';
    strings.forEach(str => {
        let loc = getLocText(str);
        if (loc == str) {
            if (str in pokemonNames) {
                loc = pokemonNames[str][currentLang];
            }
        }
        result += (!isNaN(loc) ? '-':' ') + loc;
    });

    if (addedStr.length > 0){
        result += '-' + addedStr;
    }

    result = result.trim();
    return result;
}

export function getPokemonName(originalString) {
    if (originalString in pokemonNames) {
        return pokemonNames[originalString][currentLang];
    }

    let result = '';
    if (originalString.startsWith('Alpha') && originalString[5] !== ' '){
        let poName = originalString.substring(5);
        let normalName = ''
        if (poName in pokemonNames) {
            normalName = pokemonNames[poName][currentLang];
        }
        else{
            normalName = handleSpecialPokemonName(poName);
        }
        result = getLocText('Alpha') + normalName;
    }
    else{
        result = handleSpecialPokemonName(originalString);
    }

    return result !== '' ?  result : originalString;
}

