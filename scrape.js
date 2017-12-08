const express = require('express');
const puppeteer = require('puppeteer');
const selectors = require('./selectors.json');

const app = express();
app.set('port', (process.env.PORT || 3000));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headerss", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/:list_type', function(req, res) {
    var responseData = {};
    scrape(req.params.list_type).then((value) => {
        responseData[req.params.list_type] = value.data;
        res.send(200, responseData);
    }).catch((error) => res.send(200, { error: error }));

});

let scrape = async(list_type) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(selectors[list_type]['url']);
    await page.waitFor(1000);

    const result = await page.evaluate(function(selectors, list_type) {
        let types = document.querySelectorAll(selectors[list_type]['selector']);
        types = [].map.call(types, function(elem) {
            return elem.innerText;
        });
        return {
            data: types
        };
    }, selectors, list_type);

    browser.close();
    console.log(result);
    return result;

}

app.listen(app.get('port'), function() {
    console.log('Express server started at PORT : ' + app.get('port'));
});