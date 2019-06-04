import time

import requests
from xlutils.copy import copy as xl_copy
import xlrd
from lxml import etree
from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait

url = 'https://www.aqistudy.cn/historydata/'

parms = {

}
head = ['月份', 'AQI', '范围', '质量等级', 'PM2.5', 'PM10', 'SO2', 'CO', 'NO2', 'O3']


def get_main(url1, city):
    print(city)
    browser = webdriver.Chrome()
    browser.get(url1)
    time.sleep(4)
    html = browser.find_element_by_xpath("//table").get_attribute('innerHTML')
    html_info = etree.HTML(html)

    month = html_info.xpath('//tr[position()>1]/td[1]/a/text()')
    AQI = html_info.xpath('//tr[position()>1]/td[2]/text()')
    scope = html_info.xpath('//tr[position()>1]/td[3]/text()')
    rank = html_info.xpath('//tr[position()>1]/td[4]/span/text()')
    PM25 = html_info.xpath('//tr[position()>1]/td[5]/text()')
    PM10 = html_info.xpath('//tr[position()>1]/td[6]/text()')
    SO2 = html_info.xpath('//tr[position()>1]/td[7]/text()')
    CO = html_info.xpath('//tr[position()>1]/td[8]/text()')
    NO2 = html_info.xpath('//tr[position()>1]/td[9]/text()')
    O3 = html_info.xpath('//tr[position()>1]/td[10]/text()')

    rb = xlrd.open_workbook('test.xls', formatting_info=True)
    wb = xl_copy(rb)
    sheet = wb.add_sheet(city)
    for k, v in enumerate(head):
        sheet.write(0, k, v)  # i行0列
    for k, v in enumerate(month):
        sheet.write(k + 1, 0, str(month[k]))  # i行0列
        sheet.write(k + 1, 1, float(AQI[k]))  # i行0列
        sheet.write(k + 1, 2, str(scope[k]))  # i行0列
        sheet.write(k + 1, 3, str(rank[k]))  # i行0列
        sheet.write(k + 1, 4, float(PM25[k]))  # i行0列
        sheet.write(k + 1, 5, float(PM10[k]))  # i行0列
        sheet.write(k + 1, 6, float(SO2[k]))  # i行0列
        sheet.write(k + 1, 7, float(CO[k]))  # i行0列
        sheet.write(k + 1, 8, float(NO2[k]))  # i行0列
        sheet.write(k + 1, 9, float(O3[k]))  # i行0列
    wb.save('test.xls')
    browser.close()
    time.sleep(1)


# get_main('https://www.aqistudy.cn/historydata/monthdata.php?city=%E9%98%BF%E5%9D%9D%E5%B7%9E', '阿坝州')

html = requests.post(url, data=parms)
html_info = etree.HTML(html.text)
href = html_info.xpath('//div[@class="all"]//ul/div[2]/li/a/@href')
citys = html_info.xpath('//div[@class="all"]//ul/div[2]/li/a/text()')

for k, v in enumerate(href):
    details_url = 'https://www.aqistudy.cn/historydata/' + v
    city = citys[k]
    get_main(details_url, city)
