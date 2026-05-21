import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from .utils.resume_parser import parse_resume_pdf, parse_resume_docx
from .utils.resume_analyzer import analyze_resume, calculate_match_score
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'Flask resume analyzer is running'}), 200

@app.route('/api/resume/analyze', methods=['POST'])
def analyze_resume_endpoint():
    try:
        if 'resume' not in request.files:
            return jsonify({'message': 'No resume file provided'}), 400
        
        file = request.files['resume']
        
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'message': 'Invalid file type. Allowed: PDF, DOCX, DOC'}), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Parse resume based on file type
        file_ext = filename.rsplit('.', 1)[1].lower()
        
        if file_ext == 'pdf':
            resume_data = parse_resume_pdf(filepath)
        else:  # docx or doc
            resume_data = parse_resume_docx(filepath)
        
        # Analyze resume
        analysis = analyze_resume(resume_data)
        
        # Clean up uploaded file
        os.remove(filepath)
        
        return jsonify({
            'message': 'Resume analyzed successfully',
            'analysis': analysis
        }), 200
    
    except Exception as e:
        return jsonify({'message': 'Error analyzing resume', 'error': str(e)}), 500

@app.route('/api/resume/match-score', methods=['POST'])
def match_score_endpoint():
    try:
        data = request.json
        resume_skills = data.get('skills', [])
        job_skills = data.get('jobSkills', [])
        student_cgpa = data.get('cgpa', 0)
        min_cgpa = data.get('minCGPA', 0)
        
        score = calculate_match_score(resume_skills, job_skills, student_cgpa, min_cgpa)
        
        return jsonify({
            'message': 'Match score calculated',
            'matchScore': score
        }), 200
    
    except Exception as e:
        return jsonify({'message': 'Error calculating match score', 'error': str(e)}), 500

@app.route('/api/resume/extract-text', methods=['POST'])
def extract_text_endpoint():
    try:
        if 'resume' not in request.files:
            return jsonify({'message': 'No resume file provided'}), 400
        
        file = request.files['resume']
        
        if not allowed_file(file.filename):
            return jsonify({'message': 'Invalid file type'}), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        file_ext = filename.rsplit('.', 1)[1].lower()
        
        if file_ext == 'pdf':
            resume_data = parse_resume_pdf(filepath)
        else:
            resume_data = parse_resume_docx(filepath)
        
        os.remove(filepath)
        
        return jsonify({
            'message': 'Resume text extracted',
            'data': resume_data
        }), 200
    
    except Exception as e:
        return jsonify({'message': 'Error extracting resume text', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
