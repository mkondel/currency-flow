const scrapeIt = require('scrape-it')

// get the links for each available market
scrapeIt('https://cryptocoincharts.info/markets/info', {
    marketLinks: {
        listItem: '.ico_first_line a',
        data: {
            marketLink: { 
                attr: 'href',
                convert: x=>`https://cryptocoincharts.info${x}`,
            }
        },
    }
}).then(({ data, response }) => {
    // return Promise.all(data.marketLinks.filter((v,i,arr)=>i<2).map(link => {
    return Promise.all(data.marketLinks.map(link => {
        // console.log(`scraping ${link.marketLink}`)

        // get the country, list of pairs and any other info for each market
        return scrapeIt(link.marketLink, {
        // scrapeIt('https://cryptocoincharts.info/markets/show/therocktrading', {
            marketInfo: {
                listItem: '.coin-row-box',
                data:{
                    stat: {
                        convert: x => ({ [x.split('\n')[0]]: x.split('\n')[x.split('\n').length-1].trim() })
                    }
                }
            },
            coins: {
                listItem: '.currency',
            }
        }).then(({ data, response }) => {
            // console.log(JSON.stringify(data, null, 1))
            const info = data.marketInfo
            const oneMarket = {coins: data.coins, url: link.marketLink}

            // make an array of market stats by name
            const stats = info.map(stat => {
                let name = Object.keys(stat.stat)[0]
                let value = Object.values(stat.stat)[0]

                // check if this is the name of the market
                if(value.includes('information')){
                    value = value.split(' ').filter((v,i,arr)=>i<arr.length-1)[0]
                    name = 'exchange'
                // otherwise, but only if not the country
                }else if(name != 'Country'){
                    // not the market name, so just use the found names for each value, and keep last token only
                    value = value.split(' ')[value.split(' ').length-1]
                    name = name.split(' ')[name.split(' ').length-1]
                }
                // console.log(`${name}: ${value}`)
                // return { [name]: value }
                Object.assign(oneMarket,  { [name.toLowerCase()]: value } )
            })

            // console.log(oneMarket)
            return oneMarket;
        })
    }))
}).then(data=>{
    const exchangesByName = {}
    data.map(market => {
        exchangesByName[market.exchange] = market
    })
    return exchangesByName
}).then(data=>console.log(JSON.stringify(data)))


