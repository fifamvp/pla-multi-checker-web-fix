const translations = {
    'en': {},
    'chs': {}
}
const pokemonNames = {}
const strLang = 'preferredLang'
let currentLang = localStorage.getItem(strLang) || 'en';
let callbacks = []
console.log('localization.mjs loaded')

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
});

function initPokemonNames() {
    $.getJSON('static/resources/localization/allpokemons.json', function (data) {
        $.each(data, function (key, value) {
            pokemonNames[value['en']] = {
                'en' : value['en'],
                'chs' : value['chs'],
            };
        });
    });
}

initPokemonNames();

function getLocTextInternal(originalString) {
    if (originalString in translations[currentLang]) {
        return translations[currentLang][originalString]
    }

    return originalString
}

function getLocTextWithExtraMarks(key, originalString){
    let strInTrans = getLocTextInternal(key);

    if (originalString.startsWith(key) && originalString.length > key.length){
        let additionStr = originalString.substring(key.length);
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
}

function switchToNewLang(lang = 'en') {
    console.log('switchToNewLang ' + lang)
    currentLang = lang

    updateContent(currentLang);

    // 保存用户选择
    localStorage.setItem(strLang, lang);

    callbacks.forEach(element => {
        element(lang);
    });
}

export function translateNode(inNode) {
    inNode.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = getLocTextWithExtraMarks(key, element.textContent);
    });
}

export function addLanguageSwitchCallback(callback) {
    callbacks.push(callback);
}

export function initLanguageSwitcher(callback) {
    let switcher = document.getElementById('languageSwitcher');
    if (switcher) {
        switcher.value = currentLang;
        switcher.addEventListener('change', (e) => {
            switchToNewLang(e.target.value);
        });
    }
    updateContent(currentLang);
    callbacks.push(callback);
}

export function getLocText(originalString) {
    return getLocTextInternal(originalString)
}

export function getPokemonName(originalString) {
    if (originalString in pokemonNames) {
        return pokemonNames[originalString][currentLang]
    }

    let strings = originalString.split(/-| /);
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

    result = result.trim()

    return result !== '' ?  result : originalString;
}

