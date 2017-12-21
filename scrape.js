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
    },(error) => res.send(200, { error: error }));

});

let scrape =  (list_type) => {
    let browser;
    let page;
    return puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']}).then(function(browserT){
        browser = browserT;
        return browserT.newPage();
            
    }).then(function(pageT){
        page  = pageT;
        return pageT.goto(selectors[list_type]['url'])
            .then(function(){
                pageT.waitFor(1000);
            });

    }).then(function(){
        var evlPromise =  page.evaluate(function(selectors, list_type) {
            let types = document.querySelectorAll(selectors[list_type]['selector']);
            types = [].map.call(types, function(elem) {
                return elem.innerText;
            });
            return {
                data: types
            };
        }, selectors, list_type);

        evlPromise.then(function(result){
            browser.close();
            console.log(result);
        });

        return evlPromise;
    });

}

app.listen(app.get('port'), function() {
    console.log('Express server started some change at PORT : ' + app.get('port'));
});