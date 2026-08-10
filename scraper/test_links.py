from bs4 import BeautifulSoup
import re
with open('/Users/mehedihasan/.gemini/antigravity-ide/brain/dcaf0e4c-375b-4a96-bf8d-7af98670b616/.system_generated/steps/180/content.md', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')
links = soup.find_all('a', href=True)
for a in links:
    text = a.get_text().strip()
    if 'নিয়োগ' in text or 'recruitment' in text.lower():
        print(text, a['href'])
