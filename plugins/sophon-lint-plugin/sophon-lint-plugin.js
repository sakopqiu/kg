const colors = require( "colors");
const fs = require('fs');
const path = require('path');

class SophonLintPlugin {
    constructor (src, options) {
        this.src = src;
        this.options = options;
        this.sophonLintErrors = [];                  // 错误收集
        this.loadOnDemandReg = new Map();            // 按需加载的正则
        this.existReactClass = [];                   // 已存在的react class
        this.existReactClassFile = false;            // 判断existReactClassFile文件是否存在，如果存在，则直接赋值existReactClass
        this.loadOnDemand = !!(options && options['load-on-demand']);   // 判断是否使用按需加载检测
        this.useReactHook = !!(options && options['use-react-hook']);   // 判断是否强制使用react-hook
        if (this.loadOnDemand) {
            options['load-on-demand'].forEach(item => {
                this.loadOnDemandReg.set(item, new RegExp(`^\\s*import\\s*{.*}\\s*from\\s*['|"]${item}['|"]`, 'g'))
            })
        }
        if (this.useReactHook) {
            const file = './.existReactClass.json';
            this.existReactClassFile = fs.existsSync(file);
            if (this.existReactClassFile) {
                this.existReactClass = JSON.parse(fs.readFileSync(file))
            }
        }
    }

    _checkLoadOnDemand(file, content) {
        const textArray = content.split('\n');
        textArray.forEach((text, index) => {
            this.loadOnDemandReg.forEach((value, key) => {
                if (value.test(text)) {
                    this.sophonLintErrors.push(`\nError: load-on-demand-error(${key}): ${file}-第 ${index+1} 行`)
                }
            })
        })
    }

    _getCharCount(str, char) {         // 获取string中指定char的个数
        const reg = new RegExp(char, 'g');
        const res = str.match(reg);
        let count = 0;
        if (res) {
            count = res.length;
        }
        return count
    }

     _checkReactHook(file, content) {
         const reactHookReg = new RegExp(`^(?!//).*class\\s+([^<]+)\\s+extends\\s*`, 'g');
         const textArray = content.split('\n');
         let bracketCount = 0;                    // 用以判断{}配对
         let existRender = false;                 // 判断是否存在render
         let className = '';
         textArray.forEach((text, index) => {
            const res = reactHookReg.exec(text)
            if (res && res[1]) {                  // 获取class的名称
                className = res[1]
            }
            if (className) {                      // 从抓取到class的这一行开始匹配{}
                bracketCount = bracketCount + this._getCharCount(text, '{') - this._getCharCount(text, '}')  // bracketCount === 0表示class已闭合
                if (!existRender) {  // 判断 {...}中是否含有render()或render:
                    existRender = /^\s*(public)?\s*render\s*(\(\s*\)|(\:))+/.test(text)
                }
                if (bracketCount === 0) {   // 闭合时，确定该class是否为react Component
                    if (existRender) {      // existRender为true，表示该class为react Component
                        if (!this.existReactClassFile) {
                            this.existReactClass.push(className)
                        } else {
                            if (this.existReactClass.indexOf(className) === -1) {  // 判断该class是否为新增
                                this.sophonLintErrors.push(`\nError: use-react-hook-error(${className}): ${file}-第 ${index+1} 行`)
                            }
                        }
                        existRender = false
                    }
                    className = ''
                }
            }
        })
    }

    check(file) {
        const data = fs.readFileSync(file);
        this._checkLoadOnDemand(file, data.toString())
        this._checkReactHook(file, data.toString())
    }

    walk(entry) {
        fs.stat(entry, (err, stat) => {
            if (!err) {
                const list = fs.readdirSync(entry);
                list.forEach((file) => {
                    file = `${entry}/${file}`;
                    const stat = fs.statSync(file);
                    if (stat && stat.isDirectory()) {
                        this.walk(file)                                    // 递归文件夹
                    } else if (/\.(tsx|ts)$/i.test(file)) {
                        this.check(file);
                    }
                })
            }
        });
    }

    handler() {
        if (this.useReactHook && !this.existReactClassFile) {       // 判断写入已存在react class的文件是否存在
            const data = JSON.stringify(this.existReactClass, null, 2);
            fs.writeFileSync('./.existReactClass.json', data, { flag: 'a' });
            this.existReactClassFile = true;
        }

        if (this.sophonLintErrors.length !== 0) {
            this.sophonLintErrors.forEach(item => {
                console.log(String(item).red)
            })
        }
    }

    apply(compiler) {
        const self = this;
        compiler.hooks.watchRun.tapAsync('SophonLintPlugin', (compiler, callback) => {
            if (self.src) {
                self.sophonLintErrors = [];
                self.src.forEach(dir => {
                    self.walk(dir)
                })
                callback()
            }
        })
        compiler.hooks.shouldEmit.tap('SophonLintPlugin', () => {
            self.handler()
            return self.sophonLintErrors.length === 0
        })
    }
}

module.exports = SophonLintPlugin;

