from scrapers.generic_gov import GenericGovScraper

class RailwayScraper(GenericGovScraper):
    def __init__(self):
        super().__init__({
            "name": "Bangladesh Railway",
            "base_url": "https://railway.gov.bd",
            "listing_url": "https://railway.gov.bd/site/view/notices",
            "organization": "Bangladesh Railway",
            "category": "রেলওয়ে"
        })
