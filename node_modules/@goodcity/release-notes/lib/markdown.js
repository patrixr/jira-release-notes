const showdown      = require('showdown');
const markdownpdf   = require("markdown-pdf") 

class Markdown {
  constructor(str) {
    this.markdown = str;
  }

  dump() {
    console.log('----------------------------------------------------------------------------');
    console.log(this.markdown);
    console.log('----------------------------------------------------------------------------');
  }

  toHTML() {
    const converter = new showdown.Converter();
    return converter.makeHtml(this.markdown);
  }

  toPDF(filepath) {
    return new Promise((good, bad) => {
      markdownpdf().from.string(this.markdown).to(filepath, (error) => {
        if (error) {
          bad(error);
        } else {
          good(filepath);
        }
      });
    });
  }
}


module.exports = Markdown;