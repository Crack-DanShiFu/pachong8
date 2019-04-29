import datetime
import hashlib

import requests
from lxml import etree
from mongoengine import *

url = 'https://www.belfercenter.org/project/middle-east-initiative/publication?f=&page='
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
    'Referer': 'https://www.belfercenter.org/project/middle-east-initiative/publication?f=&page=0',
    'Upgrade-Insecure-Requests': '1'
}


class custom_task(Document):
    title = StringField(required=True)
    url = StringField(required=True)
    urlid = StringField(required=True, unique=True)
    content = StringField(required=True)
    author = StringField(required=False)
    relate = StringField(required=False)
    date = DateTimeField(required=False)
    createDate = DateTimeField(default=datetime.datetime.now)
    taskName = StringField(required=True)


class pagelink(Document):
    title = StringField(required=True)
    url = StringField(required=True)
    content = StringField(required=True)
    date = DateTimeField(default=datetime.datetime.now)


def get_body_info(url):
    url = 'https://www.belfercenter.org' + url
    page_info = requests.get(url, headers=headers)
    html = etree.HTML(page_info.text)
    info = html.xpath('//div[@id="field-page-content"]//text()')
    content = ''
    for i in info:
        content += str(i).strip()
    return content


def getAll(index):
    page_info = requests.get(url + str(index), headers=headers)
    html = etree.HTML(page_info.text)
    img_link_items = html.xpath('//div[@class="views-row"]//p[@class="image"]/a/@href')
    title_items = html.xpath('//div[@class="views-row"]//h2[@class="title"]/a/span/text()')
    link_items = html.xpath('//div[@class="views-row"]//h2[@class="title"]/a/@href')
    # author_items = html.xpath('//div[@class="views-row"]//ul[@class="people-group related-group"]//text()')
    time_items = html.xpath(
        '//div[@class="views-row"]//span[@class="pub-date"]/text()')
    author_and_relate = html.xpath('//div[@class="view-publication-author-and-date"]')
    author = []
    relate = []
    print(time_items)
    for key, val in enumerate(author_and_relate):
        authors = val.xpath('ul/li[@class="author"]//text()')
        relates = val.xpath('ul/li[@class="related"]//text()')
        author_temp = ''
        relates_temp = ''
        for i in authors:
            author_temp += (str(i) + '|')
        for i in relates:
            relates_temp += (str(i) + '|')
        author.append(author_temp)
        relate.append(relates_temp)
    for i in range(len(title_items)):
        title = title_items[i].strip()
        link = link_items[i].strip()
        newurl = 'https://www.belfercenter.org' + link
        m = hashlib.md5()
        m.update(newurl.encode('utf-8'))
        urlid = m.hexdigest()
        published = None
        if ',' in time_items[2 * i + 1].strip():
            if '.' in time_items[2 * i + 1].strip():
                published = datetime.datetime.strptime((time_items[2 * i + 1].strip()), '%b. %d, %Y')
            else:
                published = datetime.datetime.strptime((time_items[2 * i + 1].strip()), '%B %d, %Y')
        # content = get_body_info(link_items[i])
        # pagel = pagelink(title, newurl, content, published)
        # pagel.save()
        # custom_t = custom_task(title, newurl, urlid, content, author[i], relate[i], published, taskName='belfer_task')
        # custom_t.save()
        print(title + '----写入')


if __name__ == '__main__':
    # connect('fangxwtest', host='168.160.18.104', port=27017)
    for i in range(0, 10):
        getAll(i)
