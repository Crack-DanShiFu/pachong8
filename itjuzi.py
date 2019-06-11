import json
import random
import threading

import requests
import xlwt
from lxml import etree

url = 'https://www.itjuzi.com/login?url=%2Fcompany'

import time
from selenium import webdriver

result = []


def login(browser):
    browser.get(url)
    time.sleep(5)
    browser.find_element_by_xpath('//input[@name="account"]').send_keys('15948433446')
    browser.find_element_by_xpath('//input[@name="password"]').send_keys('111111')
    time.sleep(1)
    browser.find_element_by_xpath('//button[@class="btn btn-primary submit-btn w-100 mt-3"]').click()
    time.sleep(4)



def get_info(browser, num):
    result = []
    for i in range(1, num + 1):
        html = browser.find_element_by_xpath('//div[@id="table"]').get_attribute('innerHTML')
        html_info = etree.HTML(html)
        tr_list = html_info.xpath('//tr')
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

        js = "var q=document.documentElement.scrollTop=10000"
        browser.execute_script(js)
        browser.find_element_by_xpath('//button[@class="btn-next"]').click()
        time.sleep(2)
    return result


def get_details(i, PROXY, num):
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument('--proxy-server={0}'.format(PROXY))
    prefs = {"profile.managed_default_content_settings.images": 2}
    chrome_options.add_experimental_option("prefs", prefs)
    browser = webdriver.Chrome(options=chrome_options)
    login(browser)
    flag = 0
    for r in result[i * num: i * num + num]:
        browser.get('https://www.itjuzi.com' + r['com_details'])
        time.sleep(3)
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
        flag += 1
        print(com_name2)
    return result


def get_proxy():
    url = 'http://www.xiongmaodaili.com/xiongmao-web/api/glip?secret=59a7a0df437f4caae30d8b6335b8a043&orderNo=GL201906081646489eJ8iSrf&count=5&isTxt=0&proxyType=1'
    html = requests.get(url)
    ips = json.loads(html.text)
    return ips['obj']


def get_thread(ips, num):
    thread = []
    for i in range(5):
        PROXY = ips[i]['ip'] + ":" + ips[i]['port']
        thread.append(threading.Thread(target=get_details, args=(i, PROXY, num)))
    for i in range(5):
        thread[i].start()
    for i in range(5):
        thread[i].join()
    for r in result:
        print(r)


if __name__ == '__main__':
    ips = get_proxy()
    ip = random.choice(ips)
    PROXY = ip['ip'] + ":" + ip['port']
    print(PROXY)
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument('--proxy-server={0}'.format(PROXY))
    prefs = {"profile.managed_default_content_settings.images": 2}
    chrome_options.add_experimental_option("prefs", prefs)
    # browser = webdriver.Chrome(options=chrome_options)
    browser = webdriver.Chrome()
    login(browser)
    browser.find_element_by_xpath('//span[text() = "国内"]').click()
    time.sleep(4)
    result = get_info(browser, 2)
    num = int(len(result)/8)
    get_thread(ips, num)


