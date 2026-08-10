from bs4 import BeautifulSoup
with open('bpsc_test.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')
rows = soup.select('table tr')
print(f"Total rows in table: {len(rows)}")
for row in rows[:5]:
    cols = row.find_all(['th', 'td'])
    print([c.get_text().strip()[:20] for c in cols])
