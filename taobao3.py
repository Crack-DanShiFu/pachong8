import json
import re

import requests
from selenium import webdriver


def getPages():
    url = 'https://h5api.m.taobao.com/h5/mtop.taobao.detail.getdesc/6.0/'
    params = {
        # 'jsv': '2.5.6',
        # 'appKey': '12574478',
        # 't': '1576139974507',
        # 'sign': '38003d6eff439d2a92a26152991303a6',
        # 'api': 'mtop.taobao.detail.getdesc',
        # 'v': '6.0',
        # 'isSec': '0',
        # 'ecode': '0',
        # 'AntiFlood': 'true',
        # 'AntiCreep': 'true',
        # 'H5Request': 'true',
        # 'type': 'jsonp',
        # 'dataType': 'jsonp',
        'callback': 'mtopjsonp2',
        'data': '{"id": "555107532169", "type": "0"}'
    }
    resp = requests.get(url, params=params)
    pattern1 = re.compile(r'mtopjsonp2\((.*?)\)', re.S)
    result = pattern1.findall(str(resp.text))[0]
    for i in json.loads(result)['data']['wdescContent']['pages']:
        print(i)


url = 'https://shop414515647.taobao.com/search.htm?spm=a1z10.3-c.0.0.57016a7fRe09M5&search=y'
browser = webdriver.Chrome()
browser.add_cookie({
    'cookie': 't=57f094909d14cb053ee724ca93eb3343; hng=CN%7Czh-CN%7CCNY%7C156; thw=cn; _m_h5_tk=59c72c3570b249fb6311d9ec8c23e7b6_1576147169050; _m_h5_tk_enc=911a5080b835a99138faf15a2acd8402; cookie2=18a1841af6819273f6fe9848383570f9; _tb_token_=f60bb6d86083e; cna=FOhSFsYv7igCAS11KFOpjAqE; unb=2206949545669; uc3=nk2=AGiWmiM3gRY%3D&lg2=WqG3DMC9VAQiUQ%3D%3D&id2=UUphzOvBsfqxv1oBDA%3D%3D&vt3=F8dByus7Sabkgh8jzIc%3D; csg=c3262218; lgc=cracklcz; cookie17=UUphzOvBsfqxv1oBDA%3D%3D; dnk=cracklcz; skt=b818a953f95be90c; existShop=MTU3NjE0NTAyMQ%3D%3D; uc4=nk4=0%40AgbP7VEAD%2FiOHAlcoyCsSGcN7A%3D%3D&id4=0%40U2grF8CNEuHb01oI3nGl2mkmn2w2s6OH; tracknick=cracklcz; _cc_=Vq8l%2BKCLiw%3D%3D; tg=5; _l_g_=Ug%3D%3D; sg=z99; _nk_=cracklcz; cookie1=UteB7PaMtfqJMJSIvbHb6LJbc1Ky%2FaDzoWyzZ1yBf1M%3D; mt=ci=-1_1; v=0; x5sec=7b2273686f7073797374656d3b32223a2232343162393263313363633834656661643935393361663066376634653665334349366b794f3846454958752f6366706b714f484f686f504d6a49774e6a6b304f5455304e5459324f547378227d; uc1=cart_m=0&cookie14=UoTbm8bqffxyzQ%3D%3D&lng=zh_CN&cookie16=V32FPkk%2FxXMk5UvIbNtImtMfJQ%3D%3D&existShop=false&cookie21=W5iHLLyFfoaZ&tag=8&cookie15=VFC%2FuZ9ayeYq2g%3D%3D&pas=0; pnm_cku822=098%23E1hvwQvUvbpvUvCkvvvvvjiPRsdh6jlHPsLpljljPmPp6jrbP2FhQjDvRFsWsjYRiQhvChCvCCpPvpvhvv2MMQyCvh1HXzUvIqpyCjvnY4mQRoaobZkt6fy78Z1S7SjvDE6kZmxhdJA1%2B2n7OHbI32RTby66cf0tH2i%2Bv0yosa06Rknb4vJyqfVQWlX9ZRFEuphvmhCvCb5GxePfkphvCyEmmvAf5byCvm3vpvmkMMYvuZCv2PGvvh7Pphv%2BvQvvBrivpmQ2vvCVJZCvEWpvvhXMvphvCyCCvvvvv2yCvvBvpvvv; l=dB_nCFFmq0yyRShFBOCwourza77OSIRAguPzaNbMi_5Bh6L_GO7OkE-SQFp6VjWfMM8B4_9r3Je9-etbioGmhrGTCkIfcxDc.; isg=BN3d6Y9FXI6cSTiFQ9u2MwjQ7L_X-hFM4310G5-iGTRjVv2IZ0ohHKtAgAp1likE'
})
browser.get(url)
