const puppeteer = require('puppeteer');
const selectors = require('./selectors.json');


let scrape = async() => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(selectors['countries']['url']);
    await page.waitFor(1000);

    const result = await page.evaluate(function(selectors) {
        let types = document.querySelectorAll(selectors['countries']['selector']);
        types = [].map.call(types, function(elem) {
            return elem.innerText;
        });
        return {
            data: types.sort()
        };
    }, selectors);

    browser.close();
    return result;

}

scrape().then((value) => {
    console.log(value.data);
}).catch((error) => console.log(error));