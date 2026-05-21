import re
from nltk.tokenize import word_tokenize
import nltk

# Download required NLTK data (run this once)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

# Common skill keywords
PROGRAMMING_LANGUAGES = ['python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'php', 'golang', 'rust', 'typescript', 'kotlin', 'swift']
WEB_TECHNOLOGIES = ['react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'asp.net', 'laravel']
DATABASES = ['mongodb', 'mysql', 'postgresql', 'oracle', 'sql', 'redis', 'elasticsearch', 'cassandra']
TOOLS_FRAMEWORKS = ['git', 'docker', 'kubernetes', 'jenkins', 'aws', 'azure', 'gcp', 'agile', 'jira']

ALL_SKILLS = PROGRAMMING_LANGUAGES + WEB_TECHNOLOGIES + DATABASES + TOOLS_FRAMEWORKS

def analyze_resume(resume_data):
    """Analyze resume and extract key information"""
    text = resume_data.get('text', '')
    
    if not text:
        return {
            'status': 'error',
            'message': 'No text extracted from resume'
        }
    
    # Extract skills
    skills = extract_skills(text)
    
    # Extract education
    education = extract_education(text)
    
    # Extract experience
    experience_years = extract_experience_years(text)
    
    # Calculate completeness score
    completeness = calculate_completeness(text, skills, education)
    
    return {
        'status': 'success',
        'skills': skills,
        'education': education,
        'experienceYears': experience_years,
        'completeness': completeness,
        'recommendations': get_recommendations(skills, education, experience_years)
    }

def extract_skills(text):
    """Extract skills from resume text"""
    text_lower = text.lower()
    found_skills = []
    
    for skill in ALL_SKILLS:
        if skill in text_lower:
            found_skills.append(skill)
    
    # Remove duplicates and return
    return list(set(found_skills))

def extract_education(text):
    """Extract education details from resume"""
    education = {
        'degrees': [],
        'institutions': []
    }
    
    # Common degree keywords
    degrees = ['bachelor', 'master', 'phd', 'diploma', 'b.tech', 'b.e', 'm.tech', 'mba', 'b.sc', 'm.sc']
    
    text_lower = text.lower()
    for degree in degrees:
        if degree in text_lower:
            education['degrees'].append(degree)
    
    return education

def extract_experience_years(text):
    """Extract years of experience from resume"""
    # Pattern to match years of experience
    pattern = r'(\d{1,2})\+?\s*years?\s*of\s*experience'
    matches = re.findall(pattern, text, re.IGNORECASE)
    
    if matches:
        try:
            return int(matches[0])
        except:
            return 0
    
    return 0

def calculate_completeness(text, skills, education):
    """Calculate resume completeness score (0-100)"""
    score = 0
    
    # Text length (max 20 points)
    if len(text) > 500:
        score += 20
    elif len(text) > 300:
        score += 15
    elif len(text) > 100:
        score += 10
    
    # Skills (max 30 points)
    if len(skills) >= 10:
        score += 30
    elif len(skills) >= 5:
        score += 20
    elif len(skills) > 0:
        score += 10
    
    # Education (max 20 points)
    if len(education['degrees']) > 0:
        score += 20
    
    # Contact info (max 10 points)
    if has_contact_info(text):
        score += 10
    
    # Experience mention (max 20 points)
    if 'experience' in text.lower():
        score += 20
    elif 'project' in text.lower():
        score += 10
    
    return min(score, 100)

def has_contact_info(text):
    """Check if resume has contact information"""
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    phone_pattern = r'(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})'
    
    return bool(re.search(email_pattern, text)) or bool(re.search(phone_pattern, text))

def calculate_match_score(resume_skills, job_skills, student_cgpa, min_cgpa):
    """Calculate match score between resume and job"""
    score = 0
    
    # Skills match (max 70 points)
    if job_skills:
        matching_skills = set(resume_skills) & set(job_skills)
        skill_match_ratio = len(matching_skills) / len(job_skills) if job_skills else 0
        score += skill_match_ratio * 70
    else:
        score += 50  # Default if no job skills specified
    
    # CGPA match (max 30 points)
    if student_cgpa >= min_cgpa:
        score += 30
    elif student_cgpa >= (min_cgpa * 0.8):
        score += 20
    elif student_cgpa >= (min_cgpa * 0.6):
        score += 10
    
    return round(min(score, 100), 2)

def get_recommendations(skills, education, experience_years):
    """Get recommendations to improve resume"""
    recommendations = []
    
    if len(skills) < 5:
        recommendations.append("Add more technical skills to your resume")
    
    if len(education['degrees']) == 0:
        recommendations.append("Include your educational qualifications")
    
    if experience_years == 0:
        recommendations.append("Highlight your projects and practical experience")
    
    if len(skills) < 10:
        recommendations.append("Learn and add more in-demand skills like cloud technologies and DevOps")
    
    return recommendations
