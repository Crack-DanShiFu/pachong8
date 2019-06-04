import re

import execjs
import requests
from .中文 import 中文

def get_521_content():
    headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.119 Safari/537.36'
    }
    req = requests.get('http://www.cbrc.gov.cn/zhuanti/xzcf/get2and3LevelXZCFDocListDividePage//1.html?current=1',
                       headers=headers)
    cookies = req.cookies

    cookies = '; '.join(['='.join(item) for item in cookies.items()])
    txt_521 = req.text
    txt_521 = ''.join(re.findall('<script>(.*?)</script>', txt_521))
    return (txt_521, cookies)


def fixed_fun(function):
    # print(function)
    func_return = function.replace('eval', 'return')
    content = execjs.compile(func_return)
    evaled_func = content.call('f')
    evaled_func = evaled_func.replace('document.cookie=', 'return')
    evaled_func = evaled_func.replace(r"setTimeout('location.href=location.pathname+location.search.replace(/[\?|&]captcha-challenge/,\'\')',1500);", '')
    evaled_func = evaled_func.replace(
        "if((function(){try{return !!window.addEventListener;}catch(e){return false;}})()){document.addEventListener('DOMContentLoaded',"+evaled_func[4:7]+",false)}else{document.attachEvent('onreadystatechange',"+evaled_func[4:7]+")}",
        '')

    print(evaled_func)

    content1 = execjs.compile(evaled_func)

    evaled_func1 = content1.call(evaled_func[4:7])
    print(evaled_func1)


if __name__ == '__main__':
    func = get_521_content()
    content = func[0]
    cookie_id = func[1]
    print(cookie_id)
    cookie_js = fixed_fun(func[0])
    # print(cookie_js)
