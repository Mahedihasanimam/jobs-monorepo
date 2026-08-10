from scrapers.generic_gov import GenericGovScraper

class BPSCScraper(GenericGovScraper):
    """
    Bangladesh Public Service Commission (BPSC) scraper.
    Inherits from the GenericGovScraper since it uses the National Web Portal framework.
    """
    def __init__(self):
        super().__init__({
            "name": "BPSC",
            "base_url": "https://bpsc.gov.bd",
            "listing_url": "https://bpsc.gov.bd/site/view/notices",
            "organization": "Bangladesh Public Service Commission",
            "category": "জনপ্রশাসন",
            # We can use the default selectors from GenericGovScraper
        })
