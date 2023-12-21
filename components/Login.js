import Component from "./Component.js"

export default  class extends Component {
    constructor() {
        super()
        this.setTitle("login")
    }

    async getHtml() {
        return `
           login.html
        `
    }
}
