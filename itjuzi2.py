import json
import random
import threading

import requests
import xlwt
from lxml import etree

url = 'https://www.itjuzi.com/login'

import time
from selenium import webdriver

result = []


def login(browser):
    browser.get(url)
    time.sleep(1)
    browser.find_element_by_xpath('//input[@name="account"]').send_keys('15948433446')
    browser.find_element_by_xpath('//input[@name="password"]').send_keys('111111')
    time.sleep(1)
    browser.find_element_by_xpath('//button[@class="btn btn-primary submit-btn w-100 mt-3"]').click()
    time.sleep(4)
    browser.get('https://www.itjuzi.com/company')
    time.sleep(2)
    browser.find_element_by_xpath('//span[text() = "国内"]').click()
    time.sleep(4)


def get_info(browser, num):
    result = []
    for i in range(1, num + 1):
        html = browser.find_element_by_xpath('//div[@id="table"]').get_attribute('innerHTML')
        html_info = etree.HTML(html)
        tr_list = html_info.xpath('//tr')
        js = "var q=document.documentElement.scrollTop=10000"
        browser.execute_script(js)

        for t in tr_list[1:]:
            com_img = t.xpath('td[2]/a[1]/img/@src')[0]
            com_name = t.xpath('td[2]/a[last()]/text()')
            com_details = t.xpath('td[2]/a[last()]/@href')[0]
            com_local = t.xpath('td[3]/text()')
            com_time = t.xpath('td[4]/text()')[0]
            com_industry = t.xpath('td[5]/text()')[0]
            com_rounds = t.xpath('td[6]/text()')[0]
            com_financing = t.xpath('td[7]/text()')[0]
            if not com_local:
                com_local = ['-']
            result.append({
                'com_img': com_img,
                'com_name': com_name,
                'com_details': com_details,
                'com_local': com_local,
                'com_time': com_time,
                'com_industry': com_industry,
                'com_rounds': com_rounds,
                'com_financing': com_financing,
            })
            time.sleep(10)
            css_str = '//div[@id="table"]//a[text()="' + com_name[0] + '"]'
            browser.find_element_by_xpath(css_str).click()
            time.sleep(10)
            handles = browser.window_handles
            browser.switch_to_window(handles[1])
            get_details(browser, result[-1])
            browser.close()
            browser.switch_to_window(handles[0])
            time.sleep(random.randint(1, 3))
        browser.execute_script(js)
        browser.find_element_by_xpath('//button[@class="btn-next"]').click()
        time.sleep(10)
    return result


def get_details(browser, r):
    time.sleep(1)
    html = browser.find_element_by_xpath('//body').get_attribute('innerHTML')
    html_info = etree.HTML(html)
    com_name2 = html_info.xpath('//div[@id="basic"]/div[last()]/p[1]/text()')
    com_basic = html_info.xpath('//div[@id="basic"]/div[2]/text()')
    com_CEO = html_info.xpath('//tr[@class="el-table__row"]/td[2]/div/a/text()')
    com_contact = html_info.xpath('//ul[@class="contact-list limited-itemnum"]//text()')
    if not com_name2:
        com_name2 = ['-']
    if not com_basic:
        com_basic = ['-']
    if not com_CEO:
        com_CEO = ['-']
    r['com_name'].extend(com_name2)
    r['basic'] = str(com_basic[0]).strip()
    r['com_CEO'] = str(com_CEO[0]).strip()
    r['com_contact'] = com_contact
    print(r)


def get_proxy():
    url = 'http://www.xiongmaodaili.com/xiongmao-web/api/glip?secret=59a7a0df437f4caae30d8b6335b8a043&orderNo=GL201906081646489eJ8iSrf&count=1&isTxt=0&proxyType=1'
    html = requests.get(url)
    ips = json.loads(html.text)
    return ips['obj']


if __name__ == '__main__':
    # ips = get_proxy()
    # ip = random.choice(ips)
    # PROXY = ip['ip'] + ":" + ip['port']
    # time.sleep(1)
    # print(PROXY)
    chrome_options = webdriver.ChromeOptions()
    # chrome_options.add_argument('--proxy-server={0}'.format(PROXY))
    prefs = {"profile.managed_default_content_settings.images": 2}
    chrome_options.add_experimental_option("prefs", prefs)
    # chrome_options.add_argument(
    #     'user-agent="MQQBrowser/26 Mozilla/5.0 (Linux; U; Android 2.3.7; zh-cn; MB200 Build/GRJ22; CyanogenMod-7) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"')

    browser = webdriver.Chrome(options=chrome_options)
    # browser = webdriver.Chrome()

    login(browser)
    result = get_info(browser, 15)
    wbk = xlwt.Workbook()
    sheet = wbk.add_sheet('comp')
    for k, v in enumerate(result):
        sheet.write(k, 0, v['com_img'])
        sheet.write(k, 1, v['com_name'][0])
        sheet.write(k, 2, v['com_name'][1])
        sheet.write(k, 3, v['com_details'])
        sheet.write(k, 4, v['com_local'][0])
        sheet.write(k, 5, v['com_time'])
        sheet.write(k, 6, v['com_industry'])
        sheet.write(k, 7, v['com_rounds'])
        sheet.write(k, 8, v['com_financing'])
        sheet.write(k, 9, v['basic'])
        sheet.write(k, 10, v['com_CEO'])
        sheet.write(k, 11, ''.join(v['com_contact']))
    wbk.save('test.xls')
    browser.close()
