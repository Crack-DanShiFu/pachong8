import re
import time

import execjs
import requests
import xlwt as xlwt
from lxml import etree

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
    'Cookie': '__jsluid=b3b5aa5061fb9fac56a81a3239f134ae; __jsl_clearance=1556710055.389|0|kseKCoQ7rVVScGgt3y5n8NSITJY%3D'
}

url = 'http://www.cbrc.gov.cn/zhuanti/xzcf/get2and3LevelXZCFDocListDividePage//1.html?current='


def get_main_page(url):
    page = requests.get('http://www.cbrc.gov.cn' + url, headers=headers)
    html = etree.HTML(page.text)
    book_number = ''.join(
        html.xpath('//table[@class="MsoNormalTable"]/tr[last()-8]/td[2]//p[@class="MsoNormal"]//text()'))
    personal_name = ''.join(
        html.xpath('//table[@class="MsoNormalTable"]/tr[2]/td[3]//p[@class="MsoNormal"]//text()')).strip()
    name_of_organization = ''.join(html.xpath('//table[@class="MsoNormalTable"]/tr[3]/td[3]//text()')).strip()
    legal_representative = ''.join(html.xpath('//table[@class="MsoNormalTable"]/tr[4]/td[2]//text()')).strip()
    main_facts = ''.join(html.xpath('//table[@class="MsoNormalTable"]/tr[5]/td[2]//text()')).strip()
    the_basis_of = ''.join(html.xpath('//table[@class="MsoNormalTable"]/tr[6]/td[2]//text()')).strip()
    decision = ''.join(html.xpath('//table[@class="MsoNormalTable"]/tr[7]/td[2]//text()')).strip()
    punishment_name = ''.join(html.xpath('//table[@class="MsoNormalTable"]/tr[8]/td[2]//text()')).strip()
    punish_date = ''.join(html.xpath('//table[@class="MsoNormalTable"]/tr[last()]/td[2]//text()')).strip()
    return [book_number, personal_name, name_of_organization, legal_representative, main_facts, the_basis_of, decision,
            punishment_name, punish_date]


def get_page_link(index):
    page = requests.get(url + str(index), headers=headers)
    html = etree.HTML(page.text)
    # title_item = html.xpath('//table[@id="testUI"]//a[@target="_blank"]/text()')
    url_item = html.xpath('//table[@id="testUI"]//a[@target="_blank"]/@href')
    wbk = xlwt.Workbook()
    sheet = wbk.add_sheet('sheet 1')
    for u in range(len(url_item)):
        time.sleep(1)
        content = get_main_page(url_item[u])
        for c in range(len(content)):
            sheet.write(u, c, content[c])
        print(content)
    wbk.save('test.xls')


if __name__ == '__main__':
    for i in range(1, 10):
        get_page_link(i)
