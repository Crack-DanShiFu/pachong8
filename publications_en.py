import datetime
import json

import requests
from lxml import etree
from mongoengine import *

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
    ,
    'Cookie': 'has_js=1; _ga=GA1.2.1364123100.1556417950; _gid=GA1.2.295443429.1556417950; _fbp=fb.1.1556417950242.885768051; _cb_ls=1; _cb=DaDO6oDQfW_UD22O4t; _chartbeat2=.1556446772000.1556446772000.1.De_FiQnYeCcCJ6iStD79Ms5c6Vf3.1; _cb_svref=null; _chartbeat5=679,2573,%2Fanalysis,https%3A%2F%2Fwww.csis.org%2Fanalysis%3Fpage%3D1,bTuLyCmnrfQDyyN9KCZOvHTH9YAj,,c,0p6zlSJJ48BFkNOrC_Fr9hDj4K8Q,csis.org,::765,2548,%2Fanalysis,https%3A%2F%2Fwww.csis.org%2Fanalysis%3Fpage%3D2,C33gEZD63XLQC9OjwGBhxXPvTYj-l,,c,wBFLPBqIGDuB9uCiTCZ3SV2BKasvg,www.csis.org'
}


class custom_task(Document):
    title = StringField(required=True)
    url = StringField(required=True)
    author = StringField(required=False)
    content = StringField(required=True)
    abstract = StringField(required=True)
    date = DateTimeField(default=datetime.datetime.now)
    createDate = DateTimeField(default=datetime.datetime.now)


class pagelink(Document):
    title = StringField(required=True)
    url = StringField(required=True)
    content = StringField(required=True)
    # link = StringField(required=False)
    data = DateTimeField(default=datetime.datetime.now)


def get_body_info(url):
    page_info = requests.get('http://ec.europa.eu' + url)
    page_info.encoding = 'utf-8'
    html = etree.HTML(page_info.text)
    main_info = html.xpath('//div[@class="views-field views-field-body"]/div[@class="field-content"]//text()')
    author_info = html.xpath(
        '//div[@class="views-field views-field-field-newsroom-author"]/span[@class="field-content"]/text()')
    abstract_info = html.xpath('//div[@class="views-field views-field-field-newsroom-teaser"]/div/text()')
    content = ''
    for i in main_info:
        content += str(i).strip()
    if len(author_info) is 0:
        author_info = ['']
    if len(abstract_info) is 0:
        abstract_info = ['']
    return content, author_info[0], abstract_info[0]


def getAll(index):
    parms = {
        'page': index,
        'view_dom_id': 'd820c186b9eac2efb2d2f9389bbcca7b',
        'view_name': 'newsroom_item_list',
        'view_display_id': 'publications_list',
        'view_path': 'publications',
        'pager_element': 0,
    }
    url = 'http://ec.europa.eu/growth/views/ajax_en?field_newsroom_topics_tid=232'
    page_info = requests.post(url, parms, headers=headers)
    page_info = json.loads(page_info.text)[2]['data']
    html = etree.HTML(page_info)
    title_item = html.xpath('//div[@class="view-content"]//div[contains(@class,"views-field-title")]//a/text()')
    link_item = html.xpath('//div[@class="view-content"]//div[contains(@class,"views-field-title")]//a/@href')
    data_item = html.xpath(
        '//div[@class="view-content"]//div[contains(@class,"views-field-field-newsroom-item-date")]//span/text()')
    for i in range(len(title_item)):
        # print(get_body_info(i))
        published = datetime.datetime.strptime(data_item[i], '%d/%m/%Y')
        content, author, abstract = get_body_info(link_item[i])
        custom_t = custom_task(title_item[i], link_item[i], author, content, abstract, published)
        custom_t.save()
        pagel = pagelink(title_item[i], link_item[i], content, published)
        print(title_item[i] + '----写入')
        pagel.save()


if __name__ == '__main__':
    connect('publications_en', host='127.0.0.1', port=27017)
    for i in range(0, 10):
        getAll(i)
