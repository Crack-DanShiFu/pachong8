import requests
from lxml import etree

url = 'http://zjw.beijing.gov.cn/eportal/ui?pageId=523766'

parms = {
    'currentPage': 185,
    'pageSize': 15
}

html = requests.post(url, data=parms)
html_info = etree.HTML(html.text)
tr = html_info.xpath('//table[@class="gridview_m"]//tr')
result = []
for t in tr[2:]:
    id_items = t.xpath('td[1]/text()')
    name_items = t.xpath('td[2]/text()')
    code_items = t.xpath('td[3]/text()')
    man_items = t.xpath('td[4]/text()')
    sum_items = t.xpath('td[5]/text()')
    area_items = t.xpath('td[6]/text()')
    code_items = code_items if code_items else ['']
    area_items = area_items if area_items else ['']
    result.append(id_items + name_items + code_items + man_items + sum_items + area_items)
print(result)
