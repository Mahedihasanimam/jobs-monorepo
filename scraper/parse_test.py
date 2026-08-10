from bs4 import BeautifulSoup
with open('bpsc_test.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

items = soup.select('.notice-board-area ul li, table tr')
print(f"Found {len(items)} items")
for item in items[:10]:
    a = item.select_one('a')
    if a:
        print(a.get_text().strip(), a.get('href'))
