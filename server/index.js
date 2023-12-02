const express = require('express')
const cors = require('cors')
const puppeteer = require('puppeteer');
const port = 5000
const app = express()

app.use(cors());
app.options('*', cors());

app.use(express.json());

async function getProductDetails(item) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    const searchUrl = `https://www.alibaba.com//trade/search?fsb=y&IndexArea=product_en&CatId=&tab=all&SearchText=${item}`;
    await page.goto(searchUrl, { timeout: 0 });

    const names = await page.evaluate(() =>
    {
        return Array.from(document.querySelectorAll("#root > div > div.app-organic-search__main-body > div.app-organic-search__content > div > div > div > div > div > div.list-no-v2-main > div.list-no-v2-main__top-area > h2 > a > p")).map((x) =>x.textContent)
    })

    const price = await page.evaluate(() =>
    {
        return Array.from(document.getElementsByClassName("elements-offer-price-normal__price")).map((x) =>x.textContent)
    })

    

    const link = await page.evaluate(() =>
    {
        return Array.from(document.querySelectorAll("#root > div > div.app-organic-search__main-body > div.app-organic-search__content > div > div > div > div > div > div.list-no-v2-main > div.list-no-v2-main__top-area > h2 > a")).map((x) =>x.getAttribute('href'))
    })

    const minOrder = await page.evaluate(() =>
    {
        return Array.from(document.querySelectorAll(".element-offer-minorder-normal__value")).map((x) =>x.textContent)
    })

    const image = await page.evaluate(() =>
    {
        return Array.from(document.querySelectorAll("#root > div > div.app-organic-search__main-body > div.app-organic-search__content > div > div > div > div > div > div.list-no-v2-left > a > div.seb-img-switcher.J-img-switcher > div.seb-img-switcher__imgs > img")).map((x) =>x.getAttribute('src'))
    })

    await browser.close();

    let details =[
    ]

    names.forEach((val,index) =>
    {
        let obj ={}
        obj.name = val
        obj.price = price[index]
        obj.minOrder= minOrder[index]
        obj.link=link[index]
        obj.image = image[index]

        details.push(obj)
    })
    return details;
}


app.get('/:item', async (req, res) => {
    const {item} = req.params
    console.log(item)
    const details = await getProductDetails(item);
    console.log(details)
    console.log('data sent')
    res.send(details);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})