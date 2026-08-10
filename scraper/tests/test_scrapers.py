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
    
    # Second row is NOT a job notice
    job2 = await scraper.parse_job(rows[1])
    assert job2 is None
