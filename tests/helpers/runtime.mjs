import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
export const root = process.env.BLOG_ROOT || process.cwd()
export const read = (name) => fs.readFileSync(path.join(root, name), 'utf8')
export const componentScript = (name) =>
  read(name).match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]
export function execute(source, globals = {}) {
  const context = vm.createContext({ exports: {}, console, ...globals })
  vm.runInContext(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    context,
  )
  return context.exports
}
export class Element {
  constructor() {
    this.events = {}
    this.attrs = {}
    this.dataset = {}
    this.style = {}
    this.hidden = false
    this.textContent = ''
    this.classList = { add() {}, remove() {} }
  }
  addEventListener(name, callback) {
    ;(this.events[name] ||= []).push(callback)
  }
  dispatch(name, event = {}) {
    return Promise.all(
      (this.events[name] || []).map((callback) =>
        callback({ target: this, preventDefault() {}, ...event }),
      ),
    )
  }
  setAttribute(name, value) {
    this.attrs[name] = value
  }
  getAttribute(name) {
    return this.attrs[name] ?? null
  }
  removeAttribute(name) {
    delete this.attrs[name]
  }
  toggleAttribute(name, enabled) {
    if (enabled) this.attrs[name] = ''
    else delete this.attrs[name]
  }
  focus() {
    this.focused = true
  }
}
