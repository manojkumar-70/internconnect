import PyPDF2
from docx import Document

def parse_resume_pdf(filepath):
    """Extract text from PDF resume"""
    try:
        text = ""
        with open(filepath, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text()
        
        return {
            'text': text,
            'file_type': 'pdf',
            'status': 'success'
        }
    except Exception as e:
        return {
            'text': '',
            'file_type': 'pdf',
            'status': 'error',
            'error': str(e)
        }

def parse_resume_docx(filepath):
    """Extract text from DOCX resume"""
    try:
        doc = Document(filepath)
        text = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
        
        return {
            'text': text,
            'file_type': 'docx',
            'status': 'success'
        }
    except Exception as e:
        return {
            'text': '',
            'file_type': 'docx',
            'status': 'error',
            'error': str(e)
        }

def extract_sections(text):
    """Extract common resume sections"""
    sections = {
        'contact': '',
        'education': '',
        'experience': '',
        'skills': '',
        'projects': '',
        'certifications': ''
    }
    
    keywords = {
        'education': ['education', 'academic', 'degree', 'university', 'college'],
        'experience': ['experience', 'work', 'employment', 'professional'],
        'skills': ['skills', 'technical', 'programming', 'languages'],
        'projects': ['projects', 'portfolio', 'work samples'],
        'certifications': ['certifications', 'certificates', 'licenses']
    }
    
    lines = text.split('\n')
    current_section = None
    
    for line in lines:
        lower_line = line.lower()
        for section, keywords_list in keywords.items():
            if any(keyword in lower_line for keyword in keywords_list):
                current_section = section
        
        if current_section:
            sections[current_section] += line + '\n'
    
    return sections
