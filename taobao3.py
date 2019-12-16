import hashlib
import json
import time
import requests


# import pymysql as mdb


def hex_md5(s):
    m = hashlib.md5()
    m.update(s.encode('UTF-8'))
    return m.hexdigest()


url = 'https://acs.m.taobao.com/h5/mtop.taobao.social.feed.aggregate/1.0/'
appKey = '12574478'
# 获取当前时间戳
t = str(int(time.time() * 1000))
data = '{"m":"shopitemsearch","vm":"nw","sversion":"4.6","shopId":"414515647","sellerId":"2947574489","style":"wf","page":1,"sort":"_coefp","catmap":"","wirelessShopCategoryList":""}'
params = {
    'appKey': appKey,
    'data': data
}
# 请求空获取cookies
html = requests.get(url, params=params)
print(html.cookies)
_m_h5_tk = html.cookies['_m_h5_tk']
_m_h5_tk_enc = html.cookies['_m_h5_tk_enc']

token = _m_h5_tk.split('_')[0]
cookie_t = html.cookies['t']
u = token + '&' + t + '&' + appKey + '&' + data
# MD5加密
sign = hex_md5(u)
print('秘钥：' + sign)
# 设置第二次请求的cookie
headers = {
    'cookie': 'cna=j4Z+FsZrKjUCASSd6HWEm5vQ; cookie2=119e42a6aa5663aa978d39b69315a25a; t=849281c28cb9908652bd99233373670b; _tb_token_=7d79e335e57e;'
              '_m_h5_tk=' + _m_h5_tk +
              '; _m_h5_tk_enc=' + _m_h5_tk_enc +
              '; v=0; thw=cn; ockeqeudmj=umVkltE%3D; munb=2206949545669; WAPFDFDTGFG=%2B4cMKKP%2B8PI%2BP6tPi2aDX%2FGrBg%3D%3D; _w_app_lg=0; unb=2206949545669; sg=z99; _l_g_=Ug%3D%3D; skt=ac66cfe978c3ecc7; uc1=cookie21=UIHiLt3xTIkz&cookie15=Vq8l%2BKCLz3%2F65A%3D%3D&cookie14=UoTbm8LS819%2BCA%3D%3D; cookie1=UteB7PaMtfqJMJSIvbHb6LJbc1Ky%2FaDzoWyzZ1yBf1M%3D; csg=f8aa26e9; uc3=vt3=F8dByuqm7Z8PmBLdatY%3D&id2=UUphzOvBsfqxv1oBDA%3D%3D&nk2=AGiWmiM3gRY%3D&lg2=WqG3DMC9VAQiUQ%3D%3D; tracknick=cracklcz; lgc=cracklcz; _cc_=VFC%2FuZ9ajQ%3D%3D; dnk=cracklcz; _nk_=cracklcz; cookie17=UUphzOvBsfqxv1oBDA%3D%3D; ntm=1; enc=mv5HNurIv8zuL2IZwWuvnR%2B4CT7zYlFgAAoFZAy7mbuV2SXFpAejgXi7EcKWsYqUUH0Rk2xnEhIFZgpClvo%2Bcw%3D%3D; linezing_session=jespgVWLaPC8RdXQvFa1Lr2T_1576507701651HP4H_2; isg=BA4O1RgV346N-2uq54SvcDcmX-LQj9KJ_4bLEDhXepHMm671oB8imbRa18f3g8qh',
}
params = {
    'appKey': appKey,
    't': t,
    'sign': sign,
    'data': data
}
url = 'https://h5api.m.taobao.com/h5/mtop.taobao.wsearch.appsearch/1.0/'

html = requests.get(url, headers=headers, params=params)
html.encoding = 'utf-8'
item = json.loads(html.text)
for i in item['data']['itemsArray']:
    print(i)
