"""
Automated HR CV Scraping & Resume Parsing Engine
------------------------------------------------
Scrapes, parses, and structures candidate CVs from PDF, DOCX, and TXT files.
Performs Named Entity Recognition (NER), Contact Extraction, Skill Matching,
and Candidate Job Compatibility Scoring for the ERP HR module.
"""

import os
import re
import json
from datetime import datetime

try:
    import pymupdf  # PyMuPDF for high-fidelity PDF text extraction
except ImportError:
    pymupdf = None

class ResumeScraperParser:
    def __init__(self):
        # Target skill taxonomies
        self.skill_database = {
            "biomedical": [
                "ultrasound", "x-ray", "ct scan", "mri", "ecg", "patient monitor", 
                "ventilator", "dialysis", "biomedical calibration", "soldering", "pcb repair",
                "sensor troubleshooting", "iso 13485", "medical equipment maintenance"
            ],
            "sales": [
                "b2b sales", "hospital procurement", "client negotiation", "tender management",
                "lead generation", "crm", "territory management", "cold calling", "key accounts",
                "deal closing", "sales quota", "revenue growth"
            ],
            "accounting": [
                "quickbooks", "vyapar", "tally", "erp", "accounts payable", "accounts receivable",
                "bank reconciliation", "financial auditing", "tax filing", "fbr", "withholding tax",
                "general ledger", "balance sheet", "p&l"
            ],
            "software": [
                "vue.js", "javascript", "node.js", "express", "mongodb", "python",
                "rest api", "git", "tailwind css", "sql", "html5", "css3"
            ]
        }

        # Target job openings with required competencies
        self.job_profiles = {
            "JOB-01": {
                "title": "Medical Equipment Sales Engineer",
                "keywords": ["sales", "ultrasound", "b2b sales", "hospital procurement", "tender management", "negotiation", "crm"],
                "min_exp_years": 2
            },
            "JOB-02": {
                "title": "Biomedical Workshop Technician",
                "keywords": ["biomedical", "ultrasound", "pcb repair", "soldering", "biomedical calibration", "maintenance", "ventilator"],
                "min_exp_years": 1
            },
            "JOB-03": {
                "title": "Senior ERP Accountant",
                "keywords": ["accounting", "reconciliation", "tax filing", "ledger", "vyapar", "quickbooks", "financial auditing"],
                "min_exp_years": 3
            }
        }

    def extract_text_from_pdf(self, file_path):
        """Extracts raw text from a PDF file using PyMuPDF."""
        if not pymupdf:
            return ""
        text = ""
        with pymupdf.open(file_path) as doc:
            for page in doc:
                text += page.get_text() + "\n"
        return text

    def extract_contact_info(self, text):
        """Extracts email, phone, location, and candidate name using regex heuristics."""
        # Email pattern
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        email = email_match.group(0) if email_match else "N/A"

        # Phone pattern (supports international & local formats like +92 300 1234567, 0321-7654321)
        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        if not phone_match:
            phone_match = re.search(r'(03\d{2}[-\s]?\d{7})', text)
        phone = phone_match.group(0) if phone_match else "N/A"

        # Candidate name heuristic (typically first non-empty line of the resume)
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        candidate_name = lines[0] if lines else "Unknown Candidate"
        # Sanitize if the first line is generic like 'Curriculum Vitae' or 'Resume'
        if candidate_name.lower() in ["curriculum vitae", "resume", "cv", "bio-data"] and len(lines) > 1:
            candidate_name = lines[1]

        # Location heuristic
        cities = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Peshawar", "Multan", "Faisalabad", "Sialkot", "Gujranwala"]
        detected_city = "Not Specified"
        for city in cities:
            if re.search(rf'\b{city}\b', text, re.IGNORECASE):
                detected_city = city
                break

        return {
            "name": candidate_name,
            "email": email,
            "phone": phone,
            "location": detected_city
        }

    def extract_skills(self, text):
        """Matches resume text against domain-specific skill taxonomy."""
        text_lower = text.lower()
        extracted_skills = {}
        total_found = []

        for category, skills in self.skill_database.items():
            found = [s for s in skills if re.search(rf'\b{re.escape(s)}\b', text_lower)]
            if found:
                extracted_skills[category] = found
                total_found.extend(found)

        return extracted_skills, total_found

    def extract_experience_and_education(self, text):
        """Identifies years of experience and education level."""
        text_lower = text.lower()

        # Experience regex (e.g., '4 years of experience', '3+ yrs experience')
        exp_match = re.search(r'(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience', text_lower)
        years = int(exp_match.group(1)) if exp_match else 1

        # Education degree recognition
        degrees = []
        if re.search(r'\b(bachelor|bs|bsc|b\.e|b\.tech|bba|b\.com)\b', text_lower):
            degrees.append("Bachelor's Degree")
        if re.search(r'\b(master|ms|msc|mba|m\.tech|m\.com)\b', text_lower):
            degrees.append("Master's Degree")
        if re.search(r'\b(phd|doctorate)\b', text_lower):
            degrees.append("PhD / Doctorate")
        if re.search(r'\b(dae|diploma|associate)\b', text_lower):
            degrees.append("Diploma / DAE")

        return {
            "years_of_experience": years,
            "degrees": degrees if degrees else ["High School / Diploma"]
        }

    def score_candidate(self, total_skills, exp_years):
        """Scores candidate suitability against active job roles."""
        scores = {}
        for job_id, job in self.job_profiles.items():
            req_keywords = set(job["keywords"])
            matched_keywords = [k for k in req_keywords if any(k in s for s in total_skills)]
            
            # Skill match ratio (60% weight)
            skill_score = (len(matched_keywords) / len(req_keywords)) * 60
            
            # Experience ratio (40% weight)
            exp_score = min(40, (exp_years / max(1, job["min_exp_years"])) * 40)
            
            total_score = round(min(100, skill_score + exp_score), 1)
            scores[job_id] = {
                "job_title": job["title"],
                "match_percentage": f"{total_score}%",
                "matched_skills": matched_keywords,
                "fit_verdict": "High Match" if total_score >= 70 else ("Moderate Match" if total_score >= 45 else "Low Match")
            }
        return scores

    def parse_resume_text(self, text, source_filename="sample_resume.pdf"):
        """Full pipeline processing raw text into structured applicant record."""
        contacts = self.extract_contact_info(text)
        categorized_skills, all_skills = self.extract_skills(text)
        exp_edu = self.extract_experience_and_education(text)
        job_matches = self.score_candidate(all_skills, exp_edu["years_of_experience"])

        return {
            "source_file": source_filename,
            "processed_at": datetime.now().isoformat(),
            "candidate": contacts,
            "education": exp_edu["degrees"],
            "experience_years": exp_edu["years_of_experience"],
            "skills": categorized_skills,
            "all_detected_skills": all_skills,
            "job_compatibility": job_matches,
            "hiring_pipeline_status": "Screened / In Review"
        }

if __name__ == "__main__":
    parser = ResumeScraperParser()
    sample_cv = """
    Tariq Mehmood
    Email: tariq.biomed@gmail.com
    Phone: +92 321 8849120
    Address: Lahore, Pakistan

    PROFESSIONAL SUMMARY:
    Energetic Biomedical Engineer with 3+ years of experience in hospital procurement, medical equipment maintenance,
    and B2B sales of ultrasound, patient monitor, and x-ray machines. Experienced in client negotiation, tender management,
    and biomedical calibration.

    EDUCATION:
    BSc in Biomedical Engineering - UET Lahore (2022)

    TECHNICAL SKILLS:
    - Medical Devices: Ultrasound, X-Ray, ECG, Patient Monitor, Ventilator
    - Maintenance: Biomedical calibration, soldering, PCB repair, sensor troubleshooting
    - Sales & Operations: B2B sales, hospital procurement, tender management, client negotiation, CRM
    """
    parsed = parser.parse_resume_text(sample_cv, "tariq_mehmood_cv.pdf")
    print(json.dumps(parsed, indent=2))
