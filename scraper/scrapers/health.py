from scrapers.generic_gov import GenericGovScraper

class HealthScraper(GenericGovScraper):
    def __init__(self):
        super().__init__({
            "name": "DGHS",
            "base_url": "https://dghs.gov.bd",
            "listing_url": "https://dghs.gov.bd/site/view/notices",
            "organization": "Directorate General of Health Services",
            "category": "স্বাস্থ্য"
        })
