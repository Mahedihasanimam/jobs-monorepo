from services.pdf_enrichment import PDFExtraction, parse_position_requirements, parse_requirements


def test_parses_structured_requirements_with_page_sources():
    extraction = PDFExtraction(
        pages=[
            "শিক্ষাগত যোগ্যতা: কম্পিউটার সায়েন্সে স্নাতক। অভিজ্ঞতা: ২ বছর। বয়সসীমা: ১৮ থেকে ৩০ বছর।",
            "বেতন স্কেল: ২২,০০০-৫৩,০৬০ টাকা। আবেদন ফি: ৫০০ টাকা। আবেদনের শেষ তারিখ: ২৫ আগস্ট ২০২৬।",
        ],
        method="embedded_text",
        document_hash="abc",
    )
    result = parse_requirements(extraction)
    assert "কম্পিউটার" in result["education"]
    assert "৫০০" in result["application_fee"]
    assert result["requirement_sources"]["education"]["page"] == 1
    assert result["requirement_sources"]["application_fee"]["page"] == 2
    assert result["requirement_confidence"]["education"] == 0.92


def test_marks_ocr_fields_with_lower_confidence_and_detects_freshers():
    extraction = PDFExtraction(
        pages=["শিক্ষাগত যোগ্যতা: এসএসসি পাস। অভিজ্ঞতা প্রয়োজন নেই। অনভিজ্ঞ প্রার্থীরা আবেদন করতে পারবেন।"],
        method="ocr",
        document_hash="def",
        ocr_pages=[1],
    )
    result = parse_requirements(extraction)
    assert result["freshers_allowed"] is True
    assert result["requirement_confidence"]["education"] <= 0.68

def test_extracts_only_the_requested_position_row():
    extraction = PDFExtraction(pages=["""১. অফিস সহকারী (গ্রেড-১৬) ৯,৩০০-২২,৪৯০ ২টি
কোন স্বীকৃত বোর্ড হতে এইচএসসি বা সমমান উত্তীর্ণ হতে হবে।
২. বার্তা বাহক (গ্রেড-১৯) ৮,৫০০-২০,৫৭০ ১টি
অষ্টম শ্রেণি উত্তীর্ণ হতে হবে।"""], method="ocr", document_hash="x", ocr_pages=[1])
    result = parse_position_requirements(extraction, "অফিস সহকারী")
    assert "এইচএসসি" in result["education"]
    assert "অষ্টম" not in result["education"]
