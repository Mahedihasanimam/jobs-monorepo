import httpx
from bs4 import BeautifulSoup
import warnings
warnings.filterwarnings('ignore')

html = httpx.get('https://bpsc.gov.bd', verify=False).text
soup = BeautifulSoup(html, 'html.parser')
links = set()
for a in soup.find_all('a', href=True):
    links.add((a.get_text().strip(), a['href']))

for text, href in sorted(links):
    if href.startswith('/site/view/'):
        print(text, href)
