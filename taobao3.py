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
    url_s = 'https://h5api.m.taobao.com/h5/mtop.com.alibaba.cco.ssc.complaint.renderrate/1.0/'
    appKey = '12574478'
    # 获取当前时间戳
    t = str(int(time.time() * 1000))
    data = '{"orderId":"985139619002794461"}'
    params = {
        't'
        'appKey': appKey,
        'data': data,
    }
    # 请求空获取cookies
    h = {
        "cookie": "t=b1e61704b0d75d91b6f3fb7923aa3fec; cookie2=17e84f1fe0ba2dd281d8656b2c7cd1c7; _tb_token_=e357eae13744f; _samesite_flag_=true; cna=4VYcF6re9CcCAXjmQeyy+OqK; tfstk=cWB5B91nMwBVqgXr3wZ2T_YRkNphZv3XY7tdVs25qM54ktj5iOkw58SctVATxn1..; sgcookie=EDbPP71FrRVNk1zW5ICff; unb=125631501; uc3=id2=UoM%2BHFLBZrjX&nk2=1A4I4JMa&lg2=VFC%2FuZ9ayeYq2g%3D%3D&vt3=F8dBxGZjLFrVIvnFqQg%3D; csg=640e9cf0; lgc=%5Cu98DE%5Cu626C25; cookie17=UoM%2BHFLBZrjX; dnk=%5Cu98DE%5Cu626C25; skt=87933d1d92463bfd; existShop=MTU5MDM3ODU2MQ%3D%3D; uc4=nk4=0%401t8ZlLjDPrY2KKcpnM%2FsdmU%3D&id4=0%40UOu6NkxNYe1tyYJXft7czZkJez4%3D; tracknick=%5Cu98DE%5Cu626C25; _cc_=URm48syIZQ%3D%3D; _l_g_=Ug%3D%3D; sg=51a; _nk_=%5Cu98DE%5Cu626C25; cookie1=Vq1EeJmNrDn%2BE1At7jjnWFVVvdfdsp8nTaSJuDtXBKs%3D; _m_h5_tk=825908232a6fe4963ac3b426fab1d5d8_1590388282347; _m_h5_tk_enc=bb953051fa43bbbae18f6117dbfdfaae; v=0; uc1=cookie14=UoTV7NXdewQpWQ%3D%3D&cookie16=VFC%2FuZ9az08KUQ56dCrZDlbNdA%3D%3D&existShop=true&cookie21=V32FPkk%2Fhodroid0QSjisQ%3D%3D&cookie15=U%2BGCWk%2F75gdr5Q%3D%3D&pas=0; l=eBagJCsnQetnmtxNBO5anurza77tXQAbzsPzaNbMiInca6tl_FoIhOQDs1qJ8dtjgtfX1e-PB21nLRUw82aLSttEIoSJGpOp-xJ9-; isg=BGlpQ3f1E1N3My_nOxAhm5j8eBPDNl1oIo_tAQtck9CM0ovkUIfoOIwElHZkyvWg"
    }
    html = requests.get(url_s, params=params, headers=h)
    _m_h5_tk = html.cookies['_m_h5_tk']
    _m_h5_tk_enc = html.cookies['_m_h5_tk_enc']
    token = _m_h5_tk.split('_')[0]
    # MD5加密
    print(_m_h5_tk)

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
    getItem(1)
