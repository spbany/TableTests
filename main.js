var anime = window["anime"];
/*
window.addEventListener("click", function (event) {
    var target = event.target;

})*/
(function () {
    function visit(children) {
        var _loop_1 = function (i) {
            var it = children[i];
            visit(it.children);
            if (it.dataset.pressed === undefined)
                return "continue";
            it.style.cursor = "pointer";
            // console.log("custom: ",it)
            it.addEventListener("click", function () {
                it.dataset.pressed = "" + (1 - parseInt(it.dataset.pressed));
            });
        };
        for (var i = 0; i < children.length; i++) {
            _loop_1(i);
        }
    }
    // Tabs.postProcess.register(()=>visit(document.children))
}());
var PropertiesParser = /** @class */ (function () {
    function PropertiesParser() {
    }
    PropertiesParser.parse = function (str) {
        var lines = str.split("\n");
        var obj = {};
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trimStart();
            if (line.trim().length === 0 || line.startsWith("#"))
                continue;
            var index = line.indexOf("=");
            if (index === -1)
                throw new Error("Error while parsing properties at line " + (i + 1) + " line text '" + line + "'");
            var key = line.substring(0, index).trim();
            var value = line.substring(index + 1).trimStart();
            obj[key] = value;
        }
        return obj;
    };
    return PropertiesParser;
}());
var CssParser = /** @class */ (function () {
    function CssParser() {
    }
    CssParser.parse = function (str) {
        var lines = str.split(";");
        var obj = {};
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trimStart();
            var index = line.indexOf("=");
            if (index === -1)
                throw new Error("Error while parsing css at line " + (i + 1) + " line text '" + line + "'");
            var key = line.substring(0, index).trim();
            var value = line.substring(index + 1).trimStart();
            obj[key] = value;
        }
        return obj;
    };
    CssParser.stringify = function (obj) {
        var names = Object.getOwnPropertyNames(obj);
        var values = [];
        for (var i = 0; i < names.length; i++) {
            var name_1 = names[i];
            var value = obj[name_1];
            if (typeof value === "string" && value) {
                value = value.trim();
                if (value.length === 0)
                    continue;
            }
            values.push([name_1, value].join(": "));
        }
        return values.join(";");
    };
    return CssParser;
}());
function shuffle(array) {
    var _a;
    var currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        _a = [
            array[randomIndex], array[currentIndex]
        ], array[currentIndex] = _a[0], array[randomIndex] = _a[1];
    }
    return array;
}
function loadFile(url) {
    var xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    }
    else if (window.ActiveXObject) {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    else {
        return false;
    }
    xhr.open('GET', url, false);
    if (xhr.overrideMimeType) {
        xhr.overrideMimeType('text/plain');
    }
    xhr.send(null);
    if (xhr.status == 200) {
        return xhr.responseText;
    }
    return false;
}
var Time = function () {
    var startMillis = new Date().getTime();
    var Time = {
        delta: 0,
        time: 0,
        fromMillis: function (millis) {
            return millis * 60 / 1000;
        }
    };
    function update() {
        var currentMillis = new Date().getTime();
        var deltaMillis = (currentMillis - startMillis) * 60 / 1000;
        startMillis = currentMillis;
        Time.time += deltaMillis;
        Time.delta = deltaMillis;
        setTimeout(update, 0);
    }
    update();
    return Time;
}();
var MAIN_WINDOW = window;
var MAIN_ELEMENT = document.children[0];
var Mathf = {
    clamp: function (value) {
        return Math.max(0, Math.min(1, value));
    },
    randInt: function (min, max) {
        return Math.min(max - min, Math.floor(Math.random() * (max - min))) + min;
    },
    randomElement: function (array) {
        return array[this.randInt(0, array.length)];
    },
};
function sleep(ms) {
    // @ts-ignore
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
var BUNDLE = (function () {
    var script = document.getElementsByTagName('bundle');
    var loadedBundles = {};
    var bundleElements = [];
    for (var i = 0; i < script.length; i++) {
        var scriptElement = script[i];
        bundleElements.push(scriptElement);
        //https://www.techonthenet.com/js/language_tags.php
        var lang = scriptElement.getAttribute("lang");
        if (!lang)
            lang = "en";
        lang = lang.toLowerCase();
        var rawText = void 0;
        if (scriptElement.hasAttribute("href")) {
            rawText = loadFile(scriptElement.getAttribute("href"));
        }
        else {
            rawText = scriptElement.innerHTML;
        }
        var items = PropertiesParser.parse(rawText);
        var currentBundle_1 = loadedBundles[lang];
        if (!currentBundle_1) {
            loadedBundles[lang] = items;
        }
        else {
            loadedBundles[lang] = Object.assign(currentBundle_1, items);
        }
    }
    bundleElements.forEach(function (it) { return it.remove(); });
    console.log(loadedBundles);
    function currentLangs() {
        var language = window.navigator.language;
        var number = language.indexOf("-");
        if (number !== -1)
            return [language, language.substring(0, number)];
        return [language];
    }
    function currentBundle() {
        var langs = currentLangs();
        for (var i = 0; i < langs.length; i++) {
            var foundBundle = loadedBundles[langs[i]];
            if (foundBundle)
                return foundBundle;
        }
        return loadedBundles["en"];
    }
    function format_(text, args) {
        var placeholder = 1;
        var begin = 0;
        function reportError(i, message, len) {
            if (len === void 0) { len = 1; }
            throw new Error("\n" + text + "\n" + " ".repeat(i - len) + "^".repeat(len) + " " + message);
        }
        var last = 0;
        var parts = [];
        for (var i = 0; i < text.length; i++) {
            var char = text[i];
            if (char == '{') {
                parts.push(text.substring(last, i));
                begin = i;
                placeholder = 0;
            }
            else if (char == '}' && begin != -1) {
                if ((begin + 1) == i)
                    reportError(i, "Missing argument index after a left curly brace", 2);
                parts.push(args[placeholder]);
                placeholder = -1;
                begin = -1;
                last = i + 1;
            }
            else if (begin != -1) {
                if (!char.match('')) {
                    reportError(i, "Illegal number character");
                }
                placeholder = placeholder * 10 + (char - '0');
            }
        }
        parts.push(text.substring(last, text.length));
        return parts.join("");
    }
    return new Proxy({
        format: function (key) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return format_(this[key], args);
        }
    }, {
        get: function (target, prop, receiver) {
            if (target[prop])
                return target[prop];
            // console.log(Object.getOwnPropertyNames(target))
            var newVar = currentBundle()[prop];
            if (newVar === undefined)
                throw new Error("Undefined bundle'" + prop.toString() + "'");
            return newVar;
        }
    });
})();
var SETTINGS = (function () {
    var settings = {
        fontSize: settingKey(25, function (newvalue) {
            var style = document.documentElement.style;
            if (newvalue == null) {
                style["--font-size"] = "";
            }
            else {
                style["--font-size"] = newvalue + "px";
            }
            style.cssText = CssParser.stringify(style);
        }),
        backgroundColor: settingKey("#32472c", function (newcolor) {
            setTimeout(function () {
                var style = document.body.style;
                style.backgroundColor = newcolor;
            });
        })
    };
    function getSetting(key) {
        // return JSON.parse(window.localStorage.getItem(key))
        return window.localStorage[key];
    }
    function setSetting(key, value) {
        window.localStorage[key] = value;
        // window.localStorage.setItem(key, JSON.stringify(value))
    }
    function settingKey(def, listener) {
        return {
            name: null,
            def: function () {
                return def;
            },
            reset: function () {
                this.set(def);
            },
            check: function () {
                var setting = getSetting(this.name);
                if (listener && setting !== undefined && setting !== def) {
                    listener(setting);
                }
            },
            get: function () {
                return getSetting(this.name);
            },
            set: function (value) {
                setSetting(this.name, value);
                if (listener) {
                    listener(value);
                }
            }
        };
    }
    {
        var names = Object.getOwnPropertyNames(settings);
        for (var i = 0; i < names.length; i++) {
            settings[names[i]].name = names[i];
            settings[names[i]].check();
        }
    }
    return new Proxy(settings, {
        get: function (target, p, receiver) {
            return target[p].get();
        },
        set: function (target, p, newValue, receiver) {
            target[p].set(newValue);
            return true;
        }
    });
})();
/*
Tabs.settings.registerSetup(() => {
    let container = createContainer();
    ""
})*/
function registerButton(idx) {
    var htmlElement = document.getElementById("answer-button-" + idx);
    var btn = {
        idx: idx
    };
    return Object.assign(htmlElement, btn);
}
var Elements = /** @class */ (function () {
    function Elements() {
        /** @type HTMLElement*/
        this.taskProgressLabel = document.getElementsByClassName("task-progress-label")[0];
        this.taskTitleLabel = document.getElementsByClassName("task-title-label")[0];
        this.taskTextLabel = document.getElementsByClassName("task-text-label")[0];
        this.answerButtons = [
            registerButton(0),
            registerButton(1),
            registerButton(2),
            registerButton(3),
            registerButton(4)
        ];
        this.extraButton = document.getElementsByClassName("extra_button")[0];
    }
    return Elements;
}());
var elements = new Elements();
function createContainer() {
    var element = document.createElement("div");
    element.className = "element__container";
    MAIN_ELEMENT.append(element);
    return element;
}
function makeCheckedButton(element, listener) {
    if (listener === void 0) { listener = undefined; }
    element.dataset.pressed = "0";
    if (listener) {
        element.addEventListener("click", listener);
    }
    return element;
}
function createDiv(parent, className, configuration) {
    if (configuration === void 0) { configuration = undefined; }
    return create(parent, className, "div", configuration);
}
function create(parent, className, tagName, configuration) {
    if (configuration === void 0) { configuration = undefined; }
    var element = document.createElement(tagName);
    element.className = className;
    if (configuration !== undefined) {
        configuration(element);
    }
    parent.append(element);
    return element;
}
var TestConfig = /** @class */ (function () {
    function TestConfig() {
    }
    TestConfig.prototype.get = function (column, row) {
        return (this.columns)[column][row];
    };
    TestConfig.prototype.getColumn = function (column) {
        return (this.columns)[column];
    };
    return TestConfig;
}());
var CellWrapper = /** @class */ (function () {
    function CellWrapper() {
    }
    return CellWrapper;
}());
var Task = /** @class */ (function () {
    function Task(questionColumn, answerColumn, rowIndex) {
        this.questionColumn = questionColumn;
        this.answerColumn = answerColumn;
        this.rowIndex = rowIndex;
    }
    Task.prototype.getText = function (config) {
        return config.get(this.questionColumn, this.rowIndex);
    };
    Task.prototype.getRow = function (config) {
        var row = [];
        for (var i = 0; i < config.columnsAmount; i++) {
            row[i] = config.get(i, this.rowIndex);
        }
        return row;
    };
    return Task;
}());
/*import {anime} from "./lib/anime";*/
var animationList = [
    [[0], [1, 3], [2, 4]],
    [[1], [0, 2, 3, 4]],
    [[2], [1, 4], [0, 3]],
    [[3], [0, 1, 4], [2]],
    [[4], [1, 2, 3], [0]]
];
var TestComponent = /** @class */ (function () {
    function TestComponent(config) {
        var _this = this;
        this.answers = Array.from({ length: 5 }, function (_, i) { return i; });
        var extraClickCallback = undefined;
        elements.extraButton.addEventListener("click", function () {
            if (extraClickCallback) {
                extraClickCallback();
            }
        });
        this.config = config;
        this.taskIndex = 0;
        this.tasks = [];
        var tasks = this.tasks;
        var _loop_2 = function (column) {
            var headerCell = config.headerCells[column];
            headerCell.answers.forEach(function (answer, idx, arr) {
                for (var i = 1; i < config.getColumn(answer).length; i++) {
                    if (config.get(answer, i) == null)
                        continue;
                    tasks.push(new Task(column, answer, i));
                }
            });
        };
        for (var column = 0; column < config.columnsAmount; column++) {
            _loop_2(column);
        }
        shuffle(tasks);
        this.setTaskIndex(0);
        var self = this;
        var _loop_3 = function (i) {
            var myAnswerButton = elements.answerButtons[i];
            myAnswerButton.addEventListener("click", function (e) {
                var correctButtonIdx = _this.answers.indexOf(_this.task().rowIndex);
                if (extraClickCallback)
                    return;
                if (i == correctButtonIdx) {
                    self.buttonAnimation(animationList[i], 0, function () {
                        self.setTaskIndex(self.taskIndex + 1);
                    });
                }
                else {
                    // myAnswerButton.style.borderColor =
                    var correctButton_1 = elements.answerButtons[correctButtonIdx];
                    // correctButton.style.borderColor =
                    anime({
                        targets: [myAnswerButton, correctButton_1],
                        duration: 100,
                        easing: "linear",
                        borderColor: function (_, idx, i) {
                            return idx == 0 ? "#f55050" : "#8eef70";
                        },
                        complete: function () {
                            var attributeNode = elements.extraButton.getAttributeNode("hidden");
                            elements.extraButton.attributes.removeNamedItem(attributeNode.name);
                            extraClickCallback = function () {
                                elements.extraButton.attributes.setNamedItem(attributeNode);
                                extraClickCallback = undefined;
                                anime({
                                    targets: [myAnswerButton, correctButton_1],
                                    borderColor: "#454545",
                                    duration: 250,
                                    easing: "linear",
                                    complete: function () {
                                        self.buttonAnimation(animationList[i], 0, function () {
                                            shuffle(self.tasks);
                                            self.setTaskIndex(0);
                                            // myAnswerButton.style.borderColor = null
                                        });
                                    }
                                });
                            };
                        }
                    });
                }
            });
        };
        for (var i = 0; i < elements.answerButtons.length; i++) {
            _loop_3(i);
        }
    }
    TestComponent.prototype.task = function () {
        return this.tasks[this.taskIndex];
    };
    TestComponent.prototype.setTaskIndex = function (index) {
        this.taskIndex = index;
        if (index >= this.tasks.length) {
            alert(BUNDLE["test-completed"]);
            shuffle(this.tasks);
            this.setTaskIndex(0);
            return;
        }
        for (var _i = 0, _a = elements.answerButtons; _i < _a.length; _i++) {
            var answerButton = _a[_i];
            answerButton.style.borderColor = null;
        }
        var config = this.config;
        var task = this.task();
        var indexes = Array.from({ length: config.getColumn(task.answerColumn).length - 2 }, function (_, i) {
            var number = i + 1;
            if (number >= task.rowIndex)
                number++;
            return number;
        });
        var answers = this.answers;
        answers[0] = task.rowIndex;
        for (var i = 1; i < answers.length; i++) {
            var randomIndex = Math.floor(Math.random() * indexes.length);
            answers[i] = indexes[randomIndex];
            indexes.splice(randomIndex, 1);
        }
        for (var i = answers.length - 1; i >= 0; i--) {
            var ii = Math.floor(Math.random() * (i + 1));
            var temp = answers[i];
            answers[i] = answers[ii];
            answers[ii] = temp;
        }
        elements.taskProgressLabel.innerHTML = this.taskIndex == this.tasks.length ? "-/-" : (this.taskIndex + 1) + "/" + this.tasks.length;
        elements.taskTextLabel.innerHTML = task.getText(config);
        for (var i = 0; i < answers.length; i++) {
            elements.answerButtons[i].innerText = config.get(task.answerColumn, answers[i]);
        }
        elements.taskTitleLabel.innerHTML = BUNDLE.format("task.title", config.get(task.questionColumn, 0), config.get(task.answerColumn, 0));
    };
    TestComponent.prototype.buttonAnimation = function (frames, idx, callback) {
        if (idx === void 0) { idx = 0; }
        if (idx >= frames.length) {
            if (typeof callback == "function")
                callback();
            this.buttonAnimation(frames, 0, "negative-way");
            return;
        }
        else if (-idx >= frames.length) {
            for (var _i = 0, _a = elements.answerButtons; _i < _a.length; _i++) {
                var answerButton = _a[_i];
                answerButton["disabled"] = false;
            }
            return;
        }
        if (idx == 0 && callback != "negative-way") {
            for (var _b = 0, _c = elements.answerButtons; _b < _c.length; _b++) {
                var answerButton = _c[_b];
                answerButton["disabled"] = true;
            }
        }
        var targets = [];
        for (var _d = 0, _e = frames[Math.max(idx, -idx)]; _d < _e.length; _d++) {
            var number = _e[_d];
            targets.push(elements.answerButtons[number]);
        }
        var deltaIdx = callback == "negative-way" ? -1 : 1;
        var transform = deltaIdx > 0 ? [1, 0] : [0, 1];
        var self = this;
        anime({
            targets: targets,
            duration: 250,
            opacity: transform,
            easing: "linear",
            complete: function (AnimInstance) {
                self.buttonAnimation(frames, idx + deltaIdx, callback);
            }
        });
    };
    return TestComponent;
}());
setTimeout(function () {
    var isTouchDevice = function () {
        return 'ontouchstart' in window || 'onmsgesturechange' in window;
    };
    // var isDesktop = window.screenX != 0 && !isTouchDevice();
    document.getElementsByClassName("answer-buttons")[0]["dataset"]["desktop"] = (isTouchDevice() ? "0" : "1");
    var params = new Proxy(new URLSearchParams(window.location.search), {
        get: function (searchParams, prop) { return searchParams.get(prop.toString()); },
    });
    var file = params["file"];
    if (!file) {
        location.replace(location.href + "?file=" + window.prompt(BUNDLE["no-file"]));
        return;
    }
    var text = loadFile("resources/saves/" + file + ".excel-test");
    if (typeof text == "boolean") {
        alert(BUNDLE["no-such-file"]);
        return;
    }
    /** @type TestConfig*/
    var config = Object.assign(new TestConfig(), JSON.parse(text));
    var comp = new TestComponent(config);
}, 0);
