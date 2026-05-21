"""
Initialize Flask app utilities
"""

def init_uploads_folder():
    """Initialize uploads folder for resume storage"""
    import os
    if not os.path.exists('uploads'):
        os.makedirs('uploads')

def init_nltk_data():
    """Initialize NLTK data"""
    import nltk
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt')
