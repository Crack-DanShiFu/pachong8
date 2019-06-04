import threading
import time

import requests
from xlutils.copy import copy as xl_copy
import xlrd
from lxml import etree
from selenium import webdriver

url = 'https://www.aqistudy.cn/historydata/'
flag = 0
parms = {

}
head = ['日期', 'AQI', '质量等级', 'PM2.5', 'PM10', 'SO2', 'CO', 'NO2', 'O3_8h']
rb = xlrd.open_workbook('test.xls', formatting_info=True)
wb = xl_copy(rb)


def get_main(url1, city):
    print(city)

    sheet = wb.add_sheet(city)

    browser = webdriver.Chrome()
    browser.get(url1)
    time.sleep(10)
    html = browser.find_element_by_xpath("//table").get_attribute('innerHTML')
    html_info = etree.HTML(html)
    month = html_info.xpath('//tr[position()>1]/td[1]/a/text()')
    flag = 0
    for k, v in enumerate(head):
        sheet.write(0, k, v)  # i行0列
    flag += 1
    for m in month:
        print(city, m)
        u = 'https://www.aqistudy.cn/historydata/daydata.php?city=' + city + '&month=' + m.replace('-', '')
        browser.get(u)
        time.sleep(2)
        html = browser.find_element_by_xpath("//table").get_attribute('innerHTML')
        html_info = etree.HTML(html)

        day = html_info.xpath('//tr[position()>1]/td[1]/text()')
        AQI = html_info.xpath('//tr[position()>1]/td[2]/text()')
        rank = html_info.xpath('//tr[position()>1]/td[3]/span/text()')
        PM25 = html_info.xpath('//tr[position()>1]/td[4]/text()')
        PM10 = html_info.xpath('//tr[position()>1]/td[5]/text()')
        SO2 = html_info.xpath('//tr[position()>1]/td[6]/text()')
        CO = html_info.xpath('//tr[position()>1]/td[7]/text()')
        NO2 = html_info.xpath('//tr[position()>1]/td[8]/text()')
        O3 = html_info.xpath('//tr[position()>1]/td[9]/text()')
        for k, v in enumerate(day):
            sheet.write(flag, 0, str(day[k]))  # i行0列
            sheet.write(flag, 1, float(AQI[k]))  # i行0列
            sheet.write(flag, 2, str(rank[k]))  # i行0列
            sheet.write(flag, 3, float(PM25[k]))  # i行0列
            sheet.write(flag, 4, float(PM10[k]))  # i行0列
            sheet.write(flag, 5, float(SO2[k]))  # i行0列
            sheet.write(flag, 6, float(CO[k]))  # i行0列
            sheet.write(flag, 7, float(NO2[k]))  # i行0列
            sheet.write(flag, 8, float(O3[k]))  # i行0列
            flag += 1
    browser.close()
    time.sleep(1)


# get_main('https://www.aqistudy.cn/historydata/monthdata.php?city=%E9%98%BF%E5%9D%9D%E5%B7%9E', '阿坝州')

html = requests.post(url, data=parms)
html_info = etree.HTML(html.text)
href = html_info.xpath('//div[@class="all"]//ul/div[2]/li/a/@href')
citys = html_info.xpath('//div[@class="all"]//ul/div[2]/li/a/text()')

threads = []

for k, v in enumerate(href):
    details_url = 'https://www.aqistudy.cn/historydata/' + v
    city = citys[k]
    # threads.append(threading.Thread(target=get_main, args=(details_url, city)))
print(len(href))

#
# for j in range(38, 39):
#     for i in threads[j * 10:j * 10 + 4]:
#         i.start()
#     i.join()
# wb.save('test.xls')
