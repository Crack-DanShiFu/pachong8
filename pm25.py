import threading
import time

import requests
# import xlwt
from lxml import etree
from selenium import webdriver


def get_main(url1, city, head):
    print(city)
    # wb = xlwt.Workbook()
    # sheet = wb.add_sheet(city)
    browser = webdriver.Chrome()
    browser.get(url1)
    time.sleep(10)
    html = browser.find_element_by_xpath("//table").get_attribute('innerHTML')
    html_info = etree.HTML(html)
    month = html_info.xpath('//tr[position()>1]/td[1]/a/text()')
    flag = 0
    # for k, v in enumerate(head):
    #     sheet.write(0, k, v)  # i行0列
    flag += 1
    for m in month:
        print(city, m)
        u = 'https://www.aqistudy.cn/historydata/daydata.php?city=' + city + '&month=' + m.replace('-', '')
        browser.get(u)
        time.sleep(4)
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
    wb.save('city/' + city + '.xls')
    browser.close()
    time.sleep(1)


# get_main('https://www.aqistudy.cn/historydata/monthdata.php?city=%E9%98%BF%E5%9D%9D%E5%B7%9E', '阿坝州')


# if __name__ == '__main__':
#     url = 'https://www.aqistudy.cn/historydata/'
#     # 头部
#     head = ['日期', 'AQI', '质量等级', 'PM2.5', 'PM10', 'SO2', 'CO', 'NO2', 'O3_8h']
#
#     html = requests.post(url)
#     html_info = etree.HTML(html.text)
#     href = html_info.xpath('//div[@class="all"]//ul/div[2]/li/a/@href')
#     citys = html_info.xpath('//div[@class="all"]//ul/div[2]/li/a/text()')
#     threads = []
#     for k, v in enumerate(href):
#         details_url = 'https://www.aqistudy.cn/historydata/' + v
#         city = citys[k]
#         threads.append(threading.Thread(target=get_main, args=(details_url, city, head)))
#     print(len(href))
#     print(len(threads))
#
#     sum_of_t = 10  # 同时爬取的数量
#     start = 0
#     for i in range(39):
#         if i * sum_of_t + sum_of_t <= 380:
#             for t in threads[i * sum_of_t: i * sum_of_t + sum_of_t]:
#                 t.start()
#             t.join()
#         else:
#             for t in threads[i * sum_of_t:]:
#                 t.start()
#             t.join()


