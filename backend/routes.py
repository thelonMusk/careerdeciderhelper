from flask import Blueprint, request, jsonify
import requests
import json
from models import db, User, SearchHistory, Career
from config import Config

api = Blueprint('api', __name__)

def call_groq_api(messages):
    """Helper function to call Groq API"""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {Config.GROQ_API_KEY}'
    }
    
    data = {
        'model': 'llama-3.3-70b-versatile',
        'messages': messages,
        'temperature': 0.7,
        'max_tokens': 2000,
        'top_p': 1,
        'stream': False
    }
    
    try:
        print(f"🔄 Calling Groq API with model: {data['model']}")
        response = requests.post(Config.GROQ_API_URL, headers=headers, json=data, timeout=30)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code != 200:
            error_detail = response.text
            print(f"❌ Error Response: {error_detail}")
            raise Exception(f"Groq API returned status {response.status_code}: {error_detail}")
        
        response_data = response.json()
        return response_data['choices'][0]['message']['content']
        
    except requests.exceptions.Timeout:
        raise Exception("Request timed out. Please try again.")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Groq API Error: {str(e)}")
    except KeyError as e:
        raise Exception(f"Invalid response format from Groq API: {str(e)}")

@api.route('/health', methods=['GET'])
def health_check():
    """Check if API is running"""
    if not Config.GROQ_API_KEY:
        return jsonify({
            'status': 'error', 
            'message': 'GROQ_API_KEY not configured'
        }), 500
    
    return jsonify({
        'status': 'healthy', 
        'message': 'API is running with Groq',
        'api_key_configured': bool(Config.GROQ_API_KEY)
    }), 200

@api.route('/test-groq', methods=['GET'])
def test_groq():
    """Test Groq API connection"""
    try:
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say 'Hello' in JSON format: {\"message\": \"Hello\"}"}
        ]
        response = call_groq_api(messages)
        return jsonify({'success': True, 'response': response}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api.route('/job-matcher', methods=['POST'])
def job_matcher():
    """Match jobs based on user profile"""
    data = request.json
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    skills = data.get('skills', '')
    interests = data.get('interests', '')
    education = data.get('education', '')
    experience = data.get('experience', '')
    user_id = data.get('user_id')
    
    if not skills and not interests:
        return jsonify({'success': False, 'error': 'Please provide skills or interests'}), 400
    
    prompt = f"""As a career advisor, analyze this profile and suggest 5 suitable career paths:

Skills: {skills or 'Not specified'}
Interests: {interests or 'Not specified'}
Education: {education or 'Not specified'}
Experience Level: {experience or 'Not specified'}

Provide ONLY a JSON array with 5 career suggestions. Each suggestion must have:
- title: Job title as a string
- matchScore: Number between 0-100
- whyGoodFit: String explaining why (2-3 sentences)
- requirements: Array of strings
- salaryRange: String (e.g., "$50,000 - $80,000")
- growthPotential: String describing growth

Example format:
[{{"title":"Software Engineer","matchScore":85,"whyGoodFit":"Your Python and JavaScript skills align well...","requirements":["Bachelor's degree","2+ years experience"],"salaryRange":"$70,000 - $120,000","growthPotential":"High growth in tech industry"}}]

Respond with ONLY the JSON array, no other text."""
    
    try:
        messages = [
            {"role": "system", "content": "You are an expert career advisor. Respond only with valid JSON arrays, no markdown, no explanations."},
            {"role": "user", "content": prompt}
        ]
        
        response = call_groq_api(messages)
        print(f"🤖 Groq Response: {response[:200]}...")
        
        response = response.strip()
        if response.startswith('```json'):
            response = response[7:]
        if response.startswith('```'):
            response = response[3:]
        if response.endswith('```'):
            response = response[:-3]
        response = response.strip()
        
        import re
        json_match = re.search(r'\[[\s\S]*\]', response)
        
        if json_match:
            careers_json = json_match.group(0)
            careers = json.loads(careers_json)
            
            if not isinstance(careers, list) or len(careers) == 0:
                return jsonify({'success': False, 'error': 'Invalid career data format'}), 500
            
            if user_id:
                search = SearchHistory(
                    user_id=user_id,
                    search_type='matcher',
                    search_query=json.dumps(data),  # ✅ FIXED: changed from query to search_query
                    results=json.dumps(careers)
                )
                db.session.add(search)
                db.session.commit()
            
            return jsonify({'success': True, 'careers': careers}), 200
        else:
            print(f"❌ Could not find JSON in response: {response}")
            return jsonify({'success': False, 'error': 'Invalid response format from AI', 'raw_response': response[:500]}), 500
            
    except json.JSONDecodeError as e:
        print(f"❌ JSON Decode Error: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to parse AI response: {str(e)}'}), 500
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@api.route('/career-ideator', methods=['POST'])
def career_ideator():
    """Generate creative career ideas"""
    data = request.json
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    prompt_text = data.get('prompt', '')
    user_id = data.get('user_id')
    
    if not prompt_text:
        return jsonify({'success': False, 'error': 'Please provide a prompt'}), 400
    
    prompt = f"""Based on this request: "{prompt_text}"

Generate 5 creative and practical career ideas. Provide ONLY a JSON array.

Each idea must have:
- title: Career title as a string
- description: String (2-3 sentences)
- whyInteresting: String explaining why it's innovative
- industries: Array of strings
- skillsNeeded: Array of strings
- earningPotential: String (e.g., "$60,000 - $100,000")

Example format:
[{{"title":"Sustainability Consultant","description":"Help companies reduce environmental impact...","whyInteresting":"Combines business with environmental goals","industries":["Consulting","Environmental"],"skillsNeeded":["Data analysis","Communication"],"earningPotential":"$60,000 - $100,000"}}]

Respond with ONLY the JSON array, no other text."""
    
    try:
        messages = [
            {"role": "system", "content": "You are a creative career advisor. Respond only with valid JSON arrays, no markdown, no explanations."},
            {"role": "user", "content": prompt}
        ]
        
        response = call_groq_api(messages)
        
        response = response.strip()
        if response.startswith('```json'):
            response = response[7:]
        if response.startswith('```'):
            response = response[3:]
        if response.endswith('```'):
            response = response[:-3]
        response = response.strip()
        
        import re
        json_match = re.search(r'\[[\s\S]*\]', response)
        
        if json_match:
            ideas_json = json_match.group(0)
            ideas = json.loads(ideas_json)
            
            if user_id:
                search = SearchHistory(
                    user_id=user_id,
                    search_type='ideator',
                    search_query=prompt_text,  # ✅ FIXED: changed from query to search_query
                    results=json.dumps(ideas)
                )
                db.session.add(search)
                db.session.commit()
            
            return jsonify({'success': True, 'ideas': ideas}), 200
        else:
            return jsonify({'success': False, 'error': 'Invalid response format from AI', 'raw_response': response[:500]}), 500
            
    except json.JSONDecodeError as e:
        return jsonify({'success': False, 'error': f'Failed to parse AI response: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api.route('/career-requirements', methods=['POST'])
def career_requirements():
    """Get detailed requirements for a specific career"""
    data = request.json
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    career = data.get('career', '')
    user_id = data.get('user_id')
    
    if not career:
        return jsonify({'success': False, 'error': 'Please provide a career name'}), 400
    
    prompt = f"""Provide a comprehensive guide for becoming a {career}.

Provide ONLY a JSON object with this exact structure:
{{
  "careerTitle": "{career}",
  "education": ["requirement1", "requirement2"],
  "essentialSkills": {{
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"]
  }},
  "experienceNeeded": "description of experience needed",
  "careerPath": ["step1", "step2", "step3"],
  "timeline": "typical timeline description",
  "salaryExpectations": {{
    "entry": "$X - $Y",
    "mid": "$X - $Y",
    "senior": "$X - $Y"
  }},
  "jobMarketOutlook": "market outlook description",
  "learningResources": ["resource1", "resource2"],
  "challenges": ["challenge1", "challenge2"],
  "dailyResponsibilities": ["responsibility1", "responsibility2"]
}}

Respond with ONLY the JSON object, no other text."""
    
    try:
        messages = [
            {"role": "system", "content": "You are a detailed career advisor. Respond only with valid JSON objects, no markdown, no explanations."},
            {"role": "user", "content": prompt}
        ]
        
        response = call_groq_api(messages)
        
        response = response.strip()
        if response.startswith('```json'):
            response = response[7:]
        if response.startswith('```'):
            response = response[3:]
        if response.endswith('```'):
            response = response[:-3]
        response = response.strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response)
        
        if json_match:
            requirements_json = json_match.group(0)
            requirements = json.loads(requirements_json)
            
            if user_id:
                search = SearchHistory(
                    user_id=user_id,
                    search_type='requirements',
                    search_query=career,  # ✅ FIXED: changed from query to search_query
                    results=json.dumps(requirements)
                )
                db.session.add(search)
                db.session.commit()
            
            return jsonify({'success': True, 'requirements': requirements}), 200
        else:
            return jsonify({'success': False, 'error': 'Invalid response format from AI', 'raw_response': response[:500]}), 500
            
    except json.JSONDecodeError as e:
        return jsonify({'success': False, 'error': f'Failed to parse AI response: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api.route('/ask-about-job', methods=['POST'])
def ask_about_job():
    """Ask questions about a specific job or career"""
    data = request.json
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    question = data.get('question', '')
    job_title = data.get('job_title', '')
    user_id = data.get('user_id')
    
    if not question:
        return jsonify({'success': False, 'error': 'Please provide a question'}), 400
    
    # Build context-aware prompt
    if job_title:
        prompt = f"""You are a knowledgeable career advisor. Answer this question about the career: {job_title}

Question: {question}

Provide a detailed, helpful answer that is:
- Accurate and factual
- Easy to understand
- Practical and actionable
- 2-4 paragraphs long

Answer:"""
    else:
        prompt = f"""You are a knowledgeable career advisor. Answer this career-related question:

Question: {question}

Provide a detailed, helpful answer that is:
- Accurate and factual
- Easy to understand
- Practical and actionable
- 2-4 paragraphs long

Answer:"""
    
    try:
        messages = [
            {"role": "system", "content": "You are an expert career advisor with deep knowledge of various industries, job roles, and career development. Provide helpful, accurate, and practical advice."},
            {"role": "user", "content": prompt}
        ]
        
        response = call_groq_api(messages)
        
        # Save to database if user_id provided
        if user_id:
            search = SearchHistory(
                user_id=user_id,
                search_type='job_qa',
                search_query=json.dumps({'question': question, 'job_title': job_title}),  # ✅ FIXED
                results=json.dumps({'answer': response})
            )
            db.session.add(search)
            db.session.commit()
        
        return jsonify({'success': True, 'answer': response, 'question': question, 'job_title': job_title}), 200
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@api.route('/user/create', methods=['POST'])
def create_user():
    """Create a new user"""
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({'success': False, 'error': 'Email required'}), 400
    
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'success': True, 'user_id': existing_user.id}), 200
    
    user = User(email=email)
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'success': True, 'user_id': user.id}), 201

@api.route('/user/<int:user_id>/history', methods=['GET'])
def get_user_history(user_id):
    """Get user's search history"""
    try:
        searches = SearchHistory.query.filter_by(user_id=user_id).order_by(SearchHistory.created_at.desc()).all()
        
        history = []
        for search in searches:
            try:
                # Safely parse search_query and results
                query_data = search.search_query  # ✅ FIXED: changed from search.query
                results_data = search.results
                
                # Try to parse as JSON if they're strings
                if query_data and isinstance(query_data, str):
                    try:
                        query_data = json.loads(query_data)
                    except:
                        pass  # Keep as string if not valid JSON
                
                if results_data and isinstance(results_data, str):
                    try:
                        results_data = json.loads(results_data)
                    except:
                        pass  # Keep as string if not valid JSON
                
                history.append({
                    'id': search.id,
                    'type': search.search_type,
                    'query': query_data,
                    'results': results_data,
                    'created_at': search.created_at.isoformat()
                })
            except Exception as e:
                print(f"⚠️ Warning: Could not parse history item {search.id}: {str(e)}")
                continue
        
        return jsonify({'success': True, 'history': history}), 200
    
    except Exception as e:
        print(f"❌ Error getting history: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500