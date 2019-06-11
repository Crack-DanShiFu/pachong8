import hashlib
import json
import re
import time
import execjs

import requests

url = 'https://acs.m.taobao.com/h5/mtop.taobao.social.feed.aggregate/1.0/'
url2 = ''

t = str(int(time.time() * 1000))

t = '1560072780800'
print(t)


def has_md5(s):
    m = hashlib.md5()  # 声明一个对象
    m.update(s.encode('UTF-8'))
    return m.hexdigest()


token = 'adf5ddb961c2c899157aca96f7814790'

#
appKey = '12574478'
date = '{"params":"{\"nodeId\":\"\",\"sellerId\":\"50852803\"}","cursor":"1","pageNum":"1","pageId":5703,"env":"1"}'

u = token + '&' + t + '&' + appKey + '&' + date
sign = has_md5(u)
print(sign)


def get_des_psswd(u):
    jsstr = get_js()
    ctx = execjs.compile(jsstr)  # 加载JS文件
    return (ctx.call('h', u))  # 调用js方法  第一个参数是JS的方法名，后面的data和key是js方法的参数


def get_js():
    f = open("sign.js", 'r', encoding='utf-8')  # 打开JS文件
    line = f.readline()
    htmlstr = ''
    while line:
        htmlstr = htmlstr + line
        line = f.readline()
    return htmlstr


parms = {
    'appKey': '12574478',
    't': '',
    'sign': '',
    'api': 'mtop.taobao.social.feed.aggregate',
    'v': '1.0',
    'timeout': '300000',
    'timer': '300000',
    'type': 'jsonp',
    'dataType': 'jsonp',
    'callback': 'mtopjsonp1',
    'data': '{"params":"{\"nodeId\":\"\",\"sellerId\":\"50852803\"}","cursor":"1","pageNum":"1","pageId":5703,"env":"1"}',
}

headers = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'cookie': 'cna=JTYAFW4bATACASSd/r3jbnph; isg=BGdnS5Q-94L6FnNU2V5rEMDK9p3xRDur08TBkjnUg_YdKIfqQbzLHqWKTii2wBNG; _m_h5_tk=487dd2b95f4acb458ef0384534bafeeb_1560060017472; _m_h5_tk_enc=e679ce73429fd34586fb764b49635eec; t=43350471fa68ac1a9c4d7dae84e27736',
    'Referer': 'https://h5.m.taobao.com/ocean/privatenode/shop.html?&sellerId=50852803',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Referer': 'https://h5.m.taobao.com/ocean/privatenode/shop.html?&sellerId=50852803',
    'Connection': 'keep-alive'

}
url = 'https://acs.m.taobao.com/h5/mtop.taobao.social.feed.aggregate/1.0/?appKey=12574478&t=1560052745920&sign=e0b7de6d6999a4171207676f304f2627&api=mtop.taobao.social.feed.aggregate&v=1.0&timeout=300000&timer=300000&type=jsonp&dataType=jsonp&callback=mtopjsonp1&data=%7B%22params%22%3A%22%7B%5C%22nodeId%5C%22%3A%5C%22%5C%22%2C%5C%22sellerId%5C%22%3A%5C%2250852803%5C%22%7D%22%2C%22cursor%22%3A%221%22%2C%22pageNum%22%3A%221%22%2C%22pageId%22%3A5703%2C%22env%22%3A%221%22%7D'

# response = requests.get(url, headers=headers)
# cookies = response.cookies
# pattern1 = re.compile(r'_m_h5_tk=([\s\S]*?)_([\s\S]*?) for', re.S)
# tk = pattern1.findall(str(cookies))
# print(tk)
# appKey = '12574478'
# date = '{"params":"{\"nodeId\":\"\",\"sellerId\":\"50852803\"}","cursor":"1","pageNum":"1","pageId":5703,"env":"1"}'
# u = tk[0] + '&' + tk[1] + '&' + appKey + '&' + json.dumps(date)
# has_md5(u)

#
# html = requests.get(url, headers=headers)
# print(html.url)
# print(html.text)
