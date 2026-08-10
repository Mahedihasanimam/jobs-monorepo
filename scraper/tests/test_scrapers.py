import pytest
from bs4 import BeautifulSoup
from scrapers.generic_gov import GenericGovScraper
from models.job import Job
from datetime import date

@pytest.mark.asyncio
async def test_generic_gov_parser():
    html = """
    <table>
        <tr>
            <th>Serial</th>
            <th>Title</th>
            <th>Date</th>
            <th>Download</th>
        </tr>
        <tr>
            <td>1</td>
            <td><a href="/doc1.pdf">সহকারী পরিচালক পদে নিয়োগ বিজ্ঞপ্তি</a></td>
            <td>১০ আগস্ট ২০২৬</td>
            <td><a href="/doc1.pdf">PDF</a></td>
        </tr>
        <tr>
            <td>2</td>
            <td><a href="/doc2.pdf">সাধারণ বিজ্ঞপ্তি</a></td>
            <td>১১ আগস্ট ২০২৬</td>
            <td><a href="/doc2.pdf">PDF</a></td>
        </tr>
    </table>
    """
    
    scraper = GenericGovScraper({
        "name": "Test Ministry",
        "base_url": "https://test.gov.bd",
        "listing_url": "https://test.gov.bd/notices"
    })
    
    soup = BeautifulSoup(html, "html.parser")
    rows = soup.find_all("tr")[1:] # Skip header
    
    # First row is a job notice
    job = await scraper.parse_job(rows[0])
    assert job is not None
    assert job.title == "সহকারী পরিচালক পদে নিয়োগ বিজ্ঞপ্তি"
    assert job.published_date == date(2026, 8, 10)
    assert job.circular_url == "https://test.gov.bd/doc1.pdf"
    assert job.source_url == "https://test.gov.bd/doc1.pdf"
    
    # Second row is NOT a job notice
    job2 = await scraper.parse_job(rows[1])
    assert job2 is None

def test_logo_extractor_rejects_shared_government_emblem():
    scraper = GenericGovScraper({"base_url": "https://railway.gov.bd"})
    generic = BeautifulSoup('<header><img class="logo" src="/bangladesh-government-logo.png"></header>', "html.parser")
    railway = BeautifulSoup('<header><img class="logo" src="/assets/railway-logo.png" alt="Bangladesh Railway logo"></header>', "html.parser")
    assert scraper.extract_organization_logo(generic) is None
    assert scraper.extract_organization_logo(railway) == "https://railway.gov.bd/assets/railway-logo.png"

def test_labelled_deadline_extraction():
    text = "অনলাইনে আবেদনের শেষ তারিখ: ২৫ আগস্ট ২০২৬ বিস্তারিত বিজ্ঞপ্তি"
    assert GenericGovScraper._date_after_label(text, ('আবেদনের শেষ তারিখ',)) == date(2026, 8, 25)

@pytest.mark.asyncio
async def test_notice_source_is_preserved_when_pdf_is_resolved():
    scraper = GenericGovScraper({"name": "Test", "base_url": "https://test.gov.bd"})
    row = BeautifulSoup('<tr><td>1</td><td><a href="/notice/1">নিয়োগ বিজ্ঞপ্তি</a></td><td>১০ আগস্ট ২০২৬</td></tr>', "html.parser").tr
    detail = BeautifulSoup('<div>আবেদনের শেষ তারিখ ২৫ আগস্ট ২০২৬</div><a href="/files/circular.pdf">PDF</a>', "html.parser")
    async def fake_soup(_url):
        return detail
    scraper.get_soup = fake_soup
    job = await scraper.parse_job(row)
    assert job is not None
    assert job.source_url == "https://test.gov.bd/notice/1"
    assert job.circular_url == "https://test.gov.bd/files/circular.pdf"
    assert job.deadline == date(2026, 8, 25)
