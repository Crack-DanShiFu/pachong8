import hashlib
import json
import re
import time
import requests


def hex_md5(s):
    m = hashlib.md5()
    m.update(s.encode('UTF-8'))
    return m.hexdigest()


def get_item(orderId):
    # 复制cookie到这里就好了，会自动替换
    cookie = "t=b1e61704b0d75d91b6f3fb7923aa3fec; cookie2=17e84f1fe0ba2dd281d8656b2c7cd1c7; _tb_token_=e357eae13744f; _samesite_flag_=true; cna=4VYcF6re9CcCAXjmQeyy+OqK; lgc=%5Cu98DE%5Cu626C25; dnk=%5Cu98DE%5Cu626C25; tracknick=%5Cu98DE%5Cu626C25; _m_h5_tk=825908232a6fe4963ac3b426fab1d5d8_1590388282347; _m_h5_tk_enc=bb953051fa43bbbae18f6117dbfdfaae; v=0; tfstk=cnlRBuYQlEQ8TWgzQXp0dKo0WZTGZjL80aaR9ePZCo9vDzfdisGi6L1MFuzpqEC..; sgcookie=EN8%2BKF3nhhyzUPa%2FxehAw; unb=125631501; uc1=cookie14=UoTV7NXSO6%2FvLA%3D%3D&cookie21=URm48syIZJfmZ9wVCtpzEQ%3D%3D&existShop=true&pas=0&cookie16=VT5L2FSpNgq6fDudInPRgavC%2BQ%3D%3D&cookie15=Vq8l%2BKCLz3%2F65A%3D%3D; uc3=nk2=1A4I4JMa&lg2=Vq8l%2BKCLz3%2F65A%3D%3D&vt3=F8dBxGZjLFL5d03xY8U%3D&id2=UoM%2BHFLBZrjX; csg=4cae1f5f; cookie17=UoM%2BHFLBZrjX; skt=e8ddbb66a2581df6; existShop=MTU5MDM4NjU3OQ%3D%3D; uc4=id4=0%40UOu6NkxNYe1tyYJXft7cwhMi8vQ%3D&nk4=0%401t8ZlLjDPrY2KKcpk7tjzXY%3D; _cc_=Vq8l%2BKCLiw%3D%3D; _l_g_=Ug%3D%3D; sg=51a; _nk_=%5Cu98DE%5Cu626C25; cookie1=Vq1EeJmNrDn%2BE1At7jjnWFVVvdfdsp8nTaSJuDtXBKs%3D; l=eBI-OiyPQevo02AwBO5Zhurza77TZKdf1sPzaNbMiInca18VGF6BrOQDsTnBPdtjgtff2e-PB21nLRHWJqzLSttEIoSJGpOp-xv9-; isg=BCAgk8EQaqgJXdasFa8cFxNP8SjyKQTzQ6g0Cpo4JTvOlcO_QTk-gyJjLT0VJbzL"

    params = {
        'jsv': '2.4.11',
        'appKey': '12574478',
        't': '',
        'v': '1.0',
        'dataType': 'json',
        'api': 'mtop.com.alibaba.cco.ssc.complaint.validate',
        'type': 'originaljson',
    }
    cookie = re.sub(r'_m_h5_tk=([\s\S]*?);', "_m_h5_tk={}; ", cookie)
    cookie = re.sub(r'_m_h5_tk_enc=([\s\S]*?);', "_m_h5_tk_enc={}; ", cookie)
    validate_url = 'https://h5api.m.taobao.com/h5/mtop.com.alibaba.cco.ssc.complaint.validate/1.0/'
    appKey = '12574478'
    p1 = params
    p1['t'] = str(int(time.time() * 1000))
    headers = {
        "cookie": cookie.format('', '')
    }
    html = requests.get(validate_url, params=p1, headers=headers)
    _m_h5_tk = html.cookies['_m_h5_tk']
    _m_h5_tk_enc = html.cookies['_m_h5_tk_enc']
    token = _m_h5_tk.split('_')[0]
    p2 = params
    p2['t'] = str(int(time.time() * 1000))
    p2[
        'data'] = '{"type":1,"code":"ORDER","params":"{\\"orderId\\":\\""' + orderId + '""""\\",\\"caseType\\":\\"720\\",\\"subCaseType\\":\\"3110\\",\\"sceneNodeId\\":\\"34952317\\"}"}'
    p2['sign'] = hex_md5(token + '&' + p2['t'] + '&' + appKey + '&' + p2['data'])
    headers = {
        "cookie": cookie.format(_m_h5_tk, _m_h5_tk_enc)
    }
    requests.get(validate_url, params=p2, headers=headers)
    renderRateUrl = "https://h5api.m.taobao.com/h5/mtop.com.alibaba.cco.ssc.complaint.renderrate/1.0/"
    p3 = params
    p3['data'] = '{"orderId":"' + orderId + '"}'
    p3['api'] = 'mtop.com.alibaba.cco.ssc.complaint.renderRate'
    p3['t'] = str(int(time.time() * 1000))
    sign = hex_md5(token + '&' + p3['t'] + '&' + appKey + '&' + p3['data'])
    p3['sign'] = sign
    html = requests.get(renderRateUrl, params=p3, headers=headers)
    print(html.text)


get_item("985139619002794461")
