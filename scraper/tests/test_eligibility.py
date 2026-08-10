from models.job import Job

def make_job(**overrides):
    values = {"title": "Sub-Assistant Engineer", "organization": "Bangladesh Railway", "source": "Railway", "source_url": "https://railway.gov.bd/jobs/1"}
    values.update(overrides)
    return Job(**values)

def test_diploma_job_gets_structured_qualification_tag():
    job = make_job(education="Diploma in Civil Engineering", age_requirement="18-30 years")
    assert "diploma" in job.qualification_tags
    assert "Diploma in Civil Engineering" in job.eligibility_summary

def test_non_diploma_job_is_not_misclassified():
    assert "diploma" not in make_job(education="Bachelor degree in Engineering").qualification_tags
