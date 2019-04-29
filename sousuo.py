import datetime

import requests
from lxml import etree
from mongoengine import *


class custom_task(Document):
    title = StringField(required=True)
    url = StringField(required=True)
    author = StringField(required=False)
    content = StringField(required=True)
    date = DateTimeField(default=datetime.datetime.now)
    createDate = DateTimeField(default=datetime.datetime.now)


class pagelink(Document):
    title = StringField(required=True)
    url = StringField(required=True)
    content = StringField(required=True)
    # link = StringField(required=False)
    published = DateTimeField(default=datetime.datetime.now)


def get_body_info(url):
    page_info = requests.get(url)
    page_info.encoding = 'utf-8'
    html = etree.HTML(page_info.text)
    title_item = html.xpath('//div[@class="article oneColumn pub_border"]/h1/text()')
    main_info = html.xpath('//div[@class="pages_content"]/p/text()')
    time_item = html.xpath('//div[@class="pages-date"]/text()')
    author_item = html.xpath('//div[@class="pages-date"]/span/text()')
    content = ''
    for i in main_info:
        content += str(i).strip()
    # print(title_item)

    custom_t = custom_task(title_item[0].strip(), url, author_item[0], content, time_item[0].strip())
    custom_t.save()
    pagel = pagelink(title_item[0].strip(), url, content, time_item[0].strip())
    pagel.save()


def get_gongwen_body_info(url):
    page_info = requests.get(url)
    page_info.encoding = 'utf-8'
    html = etree.HTML(page_info.text)
    title_item = html.xpath('//div[@class="wrap"]/table[1]//table[1]//td//text()')
    main_info = html.xpath('//td[@class="b12c"]/p//text()')
    content = ''
    for i in main_info:
        content += str(i).strip()
    print(content)
    time_item = str(title_item[-1].strip()).replace('年', '-').replace('月', '-').replace('日', '')
    author_item = title_item[5]
    custom_t = custom_task(title_item[9].strip(), url, author_item, content, time_item)
    custom_t.save()
    pagel = pagelink(title_item[9].strip(), url, content, time_item)
    pagel.save()


def getAll(index):
    url = 'http://sousuo.gov.cn/s.htm?t=zhengce&q=%E7%A7%91%E6%8A%80&timetype=timeqb&mintime=&maxtime=&sort=&sortType=1&searchfield=&pcodeJiguan=&childtype=&subchildtype=&tsbq=&pubtimeyear=&puborg=&pcodeYear=&pcodeNum=&filetype=&p=' + str(
        index) + '&n=5&inpro=&sug_t=zhengce'
    page_info = requests.get(url)
    html = etree.HTML(page_info.text)
    link_items = html.xpath('//div[@class="dys_middle_result_content"]/ul[@index !="gongwen"]/li/a/@href')
    for l in link_items:
        get_body_info(l)
    link_items = html.xpath('//div[@class="dys_middle_result_content"]/ul[@index ="gongwen"]/li/a/@href')
    for l in link_items:
        get_gongwen_body_info(l)


if __name__ == '__main__':
    connect('sousou', host='127.0.0.1', port=27017)
    for i in range(0, 10):
        getAll(i)
