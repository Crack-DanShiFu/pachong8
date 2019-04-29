import datetime

import requests
from lxml import etree
from mongoengine import *

url = 'http://zc.nipso.cn/search/page.shtml'


class custom_task(Document):
    author = StringField(required=False)
    cate = StringField(required=False)
    img = ListField(required=False)


class pagelink(Document):
    title = StringField(required=True)
    url = StringField(required=True)
    content = StringField(required=True)
    link = StringField(required=False)
    published = DateTimeField(default=datetime.datetime.now)


def get_body_info(url):
    page_info = requests.get(url)
    html = etree.HTML(page_info.text)
    info = html.xpath('//div[@class="content-text"]/p/text()')
    content = ''
    for i in info:
        content += str(i).strip()
    return content


def getAll(index):
    parms = {
        'page': index,
        'limit': 10,
        'setOrder': 'desc'
    }

    page_info = requests.post(url, parms)
    html = etree.HTML(page_info.text)
    titile_items = html.xpath('//tr[@class="tbody tbody-item"]/td[2]/a/text()')
    link_items = html.xpath('//tr[@class="tbody tbody-item"]/td[2]/a/@href')
    time_items = html.xpath('//tr[@class="tbody tbody-item"]/td[4]/text()')
    Titanic = html.xpath('//tr[@class="tbody tbody-item"]/td[3]/text()')
    for t in range(len(titile_items)):
        if Titanic[t] is '无':
            Titanic[t] = ''
        titile = titile_items[t].strip() + Titanic[t].strip()
        links = link_items[t]
        published = time_items[t].strip()
        main_body = get_body_info(link_items[t])
        if len(published) is 4:
            published += '-01-01'
        page = pagelink(titile, links, main_body, published)
        page.save()
        print(titile + "-----写入")


if __name__ == '__main__':

    connect('zcnipso', host='127.0.0.1', port=27017)
    for i in range(1, 137):
        getAll(i)
