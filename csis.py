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
    type = StringField(required=True)
    date = DateTimeField(default=datetime.datetime.now)
    createDate = DateTimeField(default=datetime.datetime.now)


class pagelink(Document):
    title = StringField(required=True)
    url = StringField(required=True)
    content = StringField(required=True)
    # link = StringField(required=False)
    data = DateTimeField(default=datetime.datetime.now)


def get_body_info(url):
    page_info = requests.get('https://www.csis.org/' + url)
    page_info.encoding = 'utf-8'
    html = etree.HTML(page_info.text)
    main_info = html.xpath('//article//text()')
    content = ''
    for i in main_info:
        content += str(i).strip()
    # print(title_item)
    return content


def getAll(index):
    parms = {
        'page': index,
        'view_dom_id': 'd7f541b73bcb26498e37c5d69f35cf5d',
        'view_name': 'listing_page_search',
        'view_display_id': 'block_1',
        'view_path': 'analysis',
        'pager_element': 0,
    }
    url = 'https://www.csis.org/views/ajax'
    page_info = requests.post(url, parms, headers=headers, )
    page_info = json.loads(page_info.text)[2]['data']
    # page_info.text.encode('iso-8859-1').decode('gbk')
    html = etree.HTML(page_info)
    title_item = html.xpath('//div[contains(@class,"node")]//div[@class="teaser__title"]/a/text()')
    link_item = html.xpath('//div[contains(@class,"node")]//div[@class="teaser__title"]/a/@href')
    data_item = html.xpath('//div[contains(@class,"node")]//span[@class="date-display-single"]/text()')
    type_item = html.xpath('//div[contains(@class,"node")]//div[@class="teaser__type"]/text()')
    author_item = []
    detal_item = html.xpath('//div[contains(@class,"node")]//div[@class="teaser__detail"]')
    for d in detal_item:
        # print(d)
        author_Temp = ''
        teaser_expert = d.xpath('span[@class="teaser__expert"]/a/text()')
        for t in teaser_expert:
            author_Temp += str(t + '|')
        author_item.append(author_Temp)
    for i in range(len(title_item)):
        published = datetime.datetime.strptime(data_item[i], '%B %d, %Y')
        custom_t = custom_task(title_item[i], link_item[i], author_item[i], get_body_info(link_item[i]), type_item[i],
                               published)
        pagel = pagelink(title_item[i], link_item[i], get_body_info(link_item[i]), published)
        print(title_item[i] + '----写入')
        custom_t.save()
        pagel.save()


if __name__ == '__main__':
    connect('csis', host='127.0.0.1', port=27017)
    for i in range(0, 10):
        getAll(i)
