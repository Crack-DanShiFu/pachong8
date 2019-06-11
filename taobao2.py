import hashlib
import json
import time
import requests
import pymysql as mdb


def hex_md5(s):
    m = hashlib.md5()
    m.update(s.encode('UTF-8'))
    return m.hexdigest()


def get_page(index, num):
    url = 'https://acs.m.taobao.com/h5/mtop.taobao.social.feed.aggregate/1.0/'
    appKey = '12574478'
    # 获取当前时间戳
    t = str(int(time.time() * 1000))
    data = '{"params":"{\\"nodeId\\":\\"\\",\\"sellerId\\":\\"50852803\\",\\"pagination\\":{\\"direction\\":\\"1\\",\\"hasMore\\":\\"true\\",\\"pageNum\\":\\"' + str(
        index) + '\\",\\"pageSize\\":\\"' + str(num) + '\\"}}","cursor":"' + str(
        index) + '","pageNum":"' + str(
        index) + '","pageId":5703,"env":"1"}'
    params = {
        'appKey': appKey,
        'data': data
    }
    # 请求空获取cookies
    html = requests.get(url, params=params)
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
        'cookie': '_m_h5_tk=' + _m_h5_tk + '; _m_h5_tk_enc=' + _m_h5_tk_enc,
    }
    params = {
        'appKey': appKey,
        't': t,
        'sign': sign,
        'data': data
    }
    html = requests.get(url, headers=headers, params=params)
    html.encoding = 'utf-8'
    item = json.loads(html.text)

    # 第一页有21条，第一条无用
    many_result = []
    for i in item['data']['list'][-num:]:
        # print(i)
        result = {
            'id': i['id'],
            'nodeId': i['nodeId'],
            'accountId': i['accountId'],
            'referId': i['referId'],
            'sellershowId': i['sellershowId'],
            'favourCount': i['favourCount'],
            'favourStatus': i['favourStatus'],
            'title': i['title'],
            'isTop': i['isTop'],
            'isElite': i['isElite'],
            # 'privileges': ''.join(i['privileges']),
            'namespace': i['namespace'],
            'gmtCreate': i['gmtCreate'],
            'commentCount': i['commentCount'],
            'targetUrl': i['targetUrl'],
            'cardType': i['cardType'],
            'userLogo': i['user']['userLogo'],
            'userNick': i['user']['userNick'],
            'userUrl': i['user']['userUrl'],
            'pics_path': '',
        }
        for p in i['pics']:
            result['pics_path'] += '<img src="' + p['path'] + '" >'
        many_result.append(list(result.values()))
    for r in many_result:
        print(r)
    insert_db(many_result)


def insert_db(result):
    conn = mdb.connect(host='47.107.173.225', port=3306, user='root', passwd='root', db='tb', charset='utf8mb4')
    cursor = conn.cursor()
    cursor.executemany('INSERT INTO buyers_show values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
                       result)
    conn.commit()
    conn.close()


for i in range(19, 20):
    get_page(i, 20)
    time.sleep(2)
