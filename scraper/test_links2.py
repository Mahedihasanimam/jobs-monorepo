import httpx
from bs4 import BeautifulSoup

html = httpx.get('https://bpsc.gov.bd', verify=False).text
soup = BeautifulSoup(html, 'html.parser')
for a in soup.find_all('a', href=True):
    text = a.get_text().strip()
    if 'নিয়োগ' in text or 'বিজ্ঞপ্তি' in text:
        print(text, a['href'])
