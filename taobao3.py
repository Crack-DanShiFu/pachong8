import hashlib
import json
import re
import time
import requests


def hex_md5(s):
    m = hashlib.md5()
    m.update(s.encode('UTF-8'))
    return m.hexdigest()


def getItem(page):
    # 设置店铺的shopId和sellerId  (必须)
    shopId, sellerId, = '', '',
    # 在https://h5.m.taobao.com/ 截取自己登录的cookies 中的enc字段 (必须)
    cookie_enc = ''
    # _m_h5_tk=,_m_h5_tk_enc=后的值用{}代替  (必须)
    cookie = '_m_h5_tk={}; _m_h5_tk_enc={}; enc={}'
    url_s = 'https://acs.m.taobao.com/h5/mtop.taobao.social.feed.aggregate/1.0/'
    appKey = '12574478'
    # 获取当前时间戳
    t = str(int(time.time() * 1000))
    data = '{{"m":"shopitemsearch","vm":"nw","sversion":"4.6","shopId":"{}","sellerId":"{}","style":"wf","page":{},"sort":"_coefp","catmap":"","wirelessShopCategoryList":""}}'.format(
        shopId, sellerId, page)
    params = {
        'appKey': appKey,
        'data': data
    }
    # 请求空获取cookies
    html = requests.get(url_s, params=params)
    _m_h5_tk = html.cookies['_m_h5_tk']
    _m_h5_tk_enc = html.cookies['_m_h5_tk_enc']
    token = _m_h5_tk.split('_')[0]
    cookie_t = html.cookies['t']
    # MD5加密
    sign = hex_md5(token + '&' + t + '&' + appKey + '&' + data)
    # 设置第二次请求的cookie
    headers = {
        'cookie': cookie.format(_m_h5_tk, _m_h5_tk_enc, cookie_enc)
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
    return item


if __name__ == '__main__':
    totalPage = int(getItem(1)['data']['totalPage'])
    for i in range(totalPage):
        result = getItem(i + 1)
        print(result['data']['itemsArray'])
