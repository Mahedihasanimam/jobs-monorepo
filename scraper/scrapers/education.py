from scrapers.generic_gov import GenericGovScraper

class EducationScraper(GenericGovScraper):
    def __init__(self):
        super().__init__({
            "name": "SHED",
            "base_url": "https://shed.gov.bd",
            "listing_url": "https://shed.gov.bd/site/view/notices",
            "organization": "Secondary and Higher Education Division",
            "category": "শিক্ষা"
        })
