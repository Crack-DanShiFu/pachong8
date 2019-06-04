import requests

url = 'https://www.amz520.com/spydomains/get_Spy_domains'
parms = {
    'length': '10',
    'start': '1',
    'sord': 'rank',
    'sorttype': '2',
    'searchType': '1',
}
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
    'Cookie': 'JSESSIONID=2FD07839D6ADAF4EB421CE4912E32E97; Hm_lvt_c3870653989089cd00b5c2f83f09ffd6=1557671242; user=oXwsfwQTZERvPOorfkwxBiK7aWbs-----%E9%98%A1%E9%99%8C%E6%B5%81%E8%8B%8F-----http%3A%2F%2Fthirdwx.qlogo.cn%2Fmmopen%2FPiajxSqBRaEIwIlwygcyvIYhFWMbnIY28iaZeXxePVf1YeFV94BCbMtL3bErng7GXeMMbDQh2PB2jl6CMu6p5YnQ%2F132-----97772699; Hm_lpvt_c3870653989089cd00b5c2f83f09ffd6=1557672243',
    'Host': 'www.amz520.com',
    'Origin': 'https://www.amz520.com',
    'Referer': 'https://www.amz520.com/amztools/searchshopify.html',
    'Content-Length': '58',
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Connection': 'keep-alive',
}
page = requests.post(url, data=parms, headers=headers)

print(page)
