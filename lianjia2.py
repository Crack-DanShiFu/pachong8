import time
from bs4 import BeautifulSoup
from selenium import webdriver
import pandas as pd


def get_info():
    result = []
    # 初始化一个浏览器窗口
    browser = webdriver.Chrome()
    for i in range(1, 11):
        url = 'https://bj.lianjia.com/ershoufang/pg' + str(i) + 'rs%E5%8C%97%E4%BA%AC/'
        browser.get(url)
        time.sleep(1)
        # 选择到数据所在的div
        html = browser.find_element_by_xpath("//div[@class='leftContent']").get_attribute('innerHTML')
        # 用BeautifulSoup选择需要的元素
        bs = BeautifulSoup(html, 'lxml')  # 将请求结果传递给bs构造对象
        title_item = bs.select('.title > a')
        info_item = bs.select('.houseInfo')
        for k, v in enumerate(title_item):
            res = []
            # 有些结果是带有 / 的
            res.extend(info_item[k].text.split('/'))
            if len(res) is not 6:
                res.append('/')
            res.append(v.get('href'))
            result.append(res)
    browser.close()
    return result


if __name__ == '__main__':
    result = get_info()
    # 用lambda 表达式排序
    result.sort(key=lambda res: float(res[2][:-2]))
    for r in result:
        print(r)
    # ['小区', '户型', '面积', '朝向', '装修', '电梯', '链接']
    df1 = pd.DataFrame(result, index=list(range(1, len(result)+1)),
                       columns=list(['地址', '户型', '面积', '朝向', '装修', '电梯', '链接']))
