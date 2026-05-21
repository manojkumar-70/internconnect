# Flask Resume Analyzer Service

## Overview

The Flask service handles resume parsing and analysis, providing skill extraction and matching capabilities.

## Setup

### Prerequisites
- Python 3.11+
- pip

### Installation

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file if needed:

```
FLASK_ENV=development
FLASK_DEBUG=1
```

### Running the Service

```bash
python app.py
```

The service runs on `http://localhost:5001`

## API Endpoints

### 1. Health Check
```
GET /health
```

Returns service status.

**Response:**
```json
{
  "status": "Flask resume analyzer is running"
}
```

### 2. Analyze Resume
```
POST /api/resume/analyze
```

Analyzes a resume file and extracts information.

**Request:**
- File: PDF or DOCX resume
- Headers: `Content-Type: multipart/form-data`

**Response:**
```json
{
  "message": "Resume analyzed successfully",
  "analysis": {
    "status": "success",
    "skills": ["Python", "JavaScript", "React"],
    "education": {
      "degrees": ["bachelor"],
      "institutions": []
    },
    "experienceYears": 3,
    "completeness": 85,
    "recommendations": [
      "Add more technical skills",
      "Highlight certifications"
    ]
  }
}
```

### 3. Calculate Match Score
```
POST /api/resume/match-score
```

Calculates match score between candidate and job.

**Request Body:**
```json
{
  "skills": ["Python", "React", "Node.js"],
  "jobSkills": ["Python", "Django", "PostgreSQL"],
  "cgpa": 8.5,
  "minCGPA": 7.0
}
```

**Response:**
```json
{
  "message": "Match score calculated",
  "matchScore": 75.5
}
```

### 4. Extract Resume Text
```
POST /api/resume/extract-text
```

Extracts raw text from resume.

**Request:**
- File: PDF or DOCX resume

**Response:**
```json
{
  "message": "Resume text extracted",
  "data": {
    "text": "...",
    "file_type": "pdf",
    "status": "success"
  }
}
```

## Resume Analysis Features

### Skill Extraction
Recognizes programming languages, frameworks, tools:
- Programming Languages: Python, Java, JavaScript, C++, etc.
- Web Technologies: React, Angular, Vue, Node.js, Django, etc.
- Databases: MongoDB, MySQL, PostgreSQL, Oracle, etc.
- Tools: Git, Docker, Kubernetes, AWS, etc.

### Education Extraction
- Identifies degrees (Bachelor, Master, PhD)
- Detects educational institutions
- Recognizes degree types (B.Tech, B.E, MBA, etc.)

### Experience Detection
- Extracts years of experience
- Identifies work history
- Finds project descriptions

### Resume Completeness Score
Rates resume on a 0-100 scale based on:
- Text length (20 points)
- Skills included (30 points)
- Education details (20 points)
- Contact information (10 points)
- Experience section (20 points)

### Match Score Calculation
Scores match between candidate and position:
- Skills match: 70 points max
- CGPA match: 30 points max
- Total: 0-100 scale

## Supported File Formats

- **PDF**: `.pdf` files using PyPDF2
- **DOCX**: `.docx` files using python-docx
- **DOC**: `.doc` files converted from DOCX

## Error Handling

All errors return JSON format:

```json
{
  "message": "Error description",
  "error": "detailed error message"
}
```

Common errors:
- 400: Bad request (missing file, invalid format)
- 500: Server error (parsing failed)

## File Upload Configuration

- Max file size: 10MB
- Allowed formats: PDF, DOCX, DOC
- Upload directory: `uploads/`
- Files deleted after processing

## Dependencies

```
flask==2.3.2           # Web framework
Flask-CORS==4.0.0      # CORS support
python-docx==0.8.11    # DOCX parsing
PyPDF2==3.0.1          # PDF parsing
requests==2.31.0       # HTTP requests
numpy==1.24.3          # Numerical computing
nltk==3.8.1            # NLP toolkit
scikit-learn==1.2.2    # Machine learning
```

## Example Usage

### cURL Examples

#### Analyze Resume
```bash
curl -X POST http://localhost:5001/api/resume/analyze \
  -F "resume=@resume.pdf"
```

#### Match Score
```bash
curl -X POST http://localhost:5001/api/resume/match-score \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["Python", "React"],
    "jobSkills": ["Python", "Django"],
    "cgpa": 8.5,
    "minCGPA": 7.0
  }'
```

## Python API Integration

```python
import requests

# Analyze resume
with open('resume.pdf', 'rb') as f:
    files = {'resume': f}
    response = requests.post(
        'http://localhost:5001/api/resume/analyze',
        files=files
    )
    print(response.json())

# Match score
payload = {
    'skills': ['Python', 'React'],
    'jobSkills': ['Python', 'Django'],
    'cgpa': 8.5,
    'minCGPA': 7.0
}
response = requests.post(
    'http://localhost:5001/api/resume/match-score',
    json=payload
)
print(response.json())
```

## Deployment

### Docker
```bash
docker build -t internconnect-flask .
docker run -p 5001:5001 internconnect-flask
```

### Gunicorn (Production)
```bash
pip install gunicorn
gunicorn -b 0.0.0.0:5001 app:app
```

### Heroku
```bash
heroku create your-flask-app
git push heroku main
```

## Performance Optimization

1. Cache NLTK data after first run
2. Implement file size optimization
3. Use async processing for large files
4. Add rate limiting

## Future Enhancements

- [ ] Support for more file formats (TXT, DOC via LibreOffice)
- [ ] AI-based skill recommendations
- [ ] Resume templates and formatting
- [ ] Cover letter analysis
- [ ] Interview question generation
- [ ] Advanced NLP for better understanding
- [ ] Duplicate detection across resumes
- [ ] ATS score calculation

## Troubleshooting

### NLTK Data Missing
```python
import nltk
nltk.download('punkt')
```

### PDF Parsing Issues
- Ensure PyPDF2 is compatible with PDF version
- Some scanned PDFs may not parse correctly

### DOCX Issues
- Ensure file is valid DOCX format
- Corrupted files may not parse

## Testing

```python
# Test file upload
import requests

files = {'resume': open('test_resume.pdf', 'rb')}
response = requests.post('http://localhost:5001/api/resume/analyze', files=files)
print(response.status_code)  # Should be 200
print(response.json())
```

## Monitoring

Recommended monitoring solutions:
- Flask logging
- Sentry for error tracking
- New Relic for performance
- DataDog for infrastructure monitoring
