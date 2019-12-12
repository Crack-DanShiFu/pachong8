import requests
import re
import pandas as pd


def get_info():
    result = []
    for i in range(1, 11):
        url = 'https://bj.lianjia.com/ershoufang/pg' + str(i) + 'rs%E5%8C%97%E4%BA%AC/'
        # 请求头
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
        }
        html = requests.get(url, headers=headers).text
        # 正则表达式，匹配 a标签的href 和val 值
        pattern1 = re.compile(r'<div.*?class="title"><a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)</a>', re.S)
        pattern2 = re.compile(
            r'<div.*?class="houseInfo"><a.*?>([\s\S]*?)</a><span class="divide">/</span>([\s\S]*?)</div>', re.S)
        title_list = pattern1.findall(html)
        info_list = pattern2.findall(html)
        pattern1.findall(html)
        pattern2.findall(html)
        # 拼接结果
        for k, v in enumerate(info_list):
            info = []
            info.append(v[0])
            houseInfo = str(v[1]).replace('<span class="divide">/</span>', '/').split('/')
            if len(houseInfo) != 5:
                houseInfo.append('/')
            info.extend(houseInfo)
            info.append(title_list[k][0])
            result.append(info)
    print(result)
    return result


if __name__ == '__main__':
    result = get_info()
    # 用lambda 表达式排序
    result.sort(key=lambda res: float(res[2][:-2]))
    for r in result:
        print(r)
    # ['小区', '户型', '面积', '朝向', '装修', '电梯', '链接']
    df1 = pd.DataFrame(result, index=list(range(1, len(result) + 1)),
                       columns=list(['地址', '户型', '面积', '朝向', '装修', '电梯', '链接']))
