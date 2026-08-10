import pytest
from datetime import date
from utils.date_parser import parse_date, convert_bengali_digits

def test_bengali_digits_conversion():
    assert convert_bengali_digits('০১২৩৪৫৬৭৮৯') == '0123456789'
    assert convert_bengali_digits('২০২৬') == '2026'
    
def test_parse_iso_date():
    assert parse_date("2026-08-10") == date(2026, 8, 10)
    
def test_parse_dmy_date():
    assert parse_date("10/08/2026") == date(2026, 8, 10)
    assert parse_date("10-08-2026") == date(2026, 8, 10)
    
def test_parse_english_text_date():
    assert parse_date("10 August 2026") == date(2026, 8, 10)
    assert parse_date("10 Aug 2026") == date(2026, 8, 10)
    
def test_parse_bengali_text_date():
    assert parse_date("১০ আগস্ট ২০২৬") == date(2026, 8, 10)
    assert parse_date("১০ জানুয়ারি ২০২৬") == date(2026, 1, 10)
    
def test_parse_date_with_prefix():
    assert parse_date("Published on: 10/08/2026") == date(2026, 8, 10)
    assert parse_date("তারিখ: ১০ আগস্ট ২০২৬") == date(2026, 8, 10)
    
def test_parse_invalid_date():
    assert parse_date("Invalid Date") is None
    assert parse_date(None) is None
