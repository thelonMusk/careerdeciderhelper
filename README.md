# Career Decider Helper

An AI-powered career guidance tool that helps you explore career paths, match jobs to your skills, and get detailed information about career requirements and opportunities.

## Features

- **Career Ideas Generator**: Get personalized career suggestions based on your interests, skills, and background
- **Job Matcher**: Match your profile with suitable job roles and career paths
- **Interactive Q&A**: Ask questions about specific careers, job requirements, qualifications, and career paths
- **Chat History**: All your conversations are saved so you can review previous career explorations
- **Requirements Analysis**: Get detailed information about education, skills, and experience needed for different careers

## Tech Stack

- **Backend**: Python with Flask
- **Frontend**: React
- **AI**: Groq API
- **Database**: SQLite

## Installation

### Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm (comes with Node.js)
- A Groq API key ([Get one here](https://console.groq.com))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/thelonMusk/careerdeciderhelper.git
   cd careerdeciderhelper
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv .venv
   ```

3. **Activate virtual environment**
   - Windows:
     ```bash
     .venv\Scripts\activate
     ```
   - Mac/Linux:
     ```bash
     source .venv/bin/activate
     ```

4. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   FLASK_ENV=development
   ```

6. **Initialize the database**
   ```bash
   python create_db.py
   ```

7. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

## Usage

### Starting the Backend

1. Navigate to the backend directory
   ```bash
   cd backend
   ```

2. Activate the virtual environment (if not already activated)
   ```bash
   .venv\Scripts\activate  # Windows
   source .venv/bin/activate  # Mac/Linux
   ```

3. Run the Flask server
   ```bash
   python app.py
   ```

   The backend will start on `http://localhost:5000`

### Starting the Frontend

1. Open a new terminal and navigate to the frontend directory
   ```bash
   cd frontend
   ```

2. Start the React development server
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:3000` and automatically open in your browser

### Using the Application

1. **Explore Career Ideas**: 
   - Enter your interests, skills, and background
   - Receive AI-generated career suggestions tailored to your profile

2. **Match Jobs**: 
   - Input your qualifications and preferences
   - Get matched with suitable career paths and job roles

3. **Ask Questions**: 
   - Ask about specific careers: "What does a software engineer do?"
   - Inquire about requirements: "What degree do I need to become a nurse?"
   - Explore career paths: "How do I transition from teaching to UX design?"

4. **Review History**: 
   - Access your previous conversations
   - Track your career exploration journey
   - Review advice and suggestions from past sessions

## Project Structure

```
careerdeciderhelper/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── config.py           # Configuration settings
│   ├── models.py           # Database models
│   ├── routes.py           # API routes
│   ├── create_db.py        # Database initialization
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Environment variables (not in repo)
├── frontend/
│   ├── public/             # Static files
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── services/
│   │   │   └── api.js     # API service layer
│   │   └── ...            # Other React components
│   ├── package.json       # Node dependencies
│   └── package-lock.json  # Dependency lock file
├── instance/
│   └── database.db        # SQLite database (not in repo)
└── README.md
```

## API Endpoints

The backend provides the following API endpoints:

- `POST /api/career-ideas` - Generate career suggestions
- `POST /api/job-match` - Match jobs to user profile
- `POST /api/ask-question` - Ask questions about careers
- `GET /api/chat-history` - Retrieve conversation history
- `POST /api/requirements` - Get career requirements information

## Environment Variables

Create a `.env` file in the `backend` directory with the following:

```env
GROQ_API_KEY=your_groq_api_key_here
FLASK_ENV=development
SECRET_KEY=your_secret_key_here
DATABASE_URL=sqlite:///database.db
```

**Important**: Never commit your `.env` file to version control. It contains sensitive API keys.

## Security Note

- The `.env` file is excluded from version control via `.gitignore`
- Always keep your API keys secure and never share them publicly
- Regenerate your API key immediately if you suspect it has been exposed
- The `node_modules` directory is also excluded as it contains thousands of files that should be installed locally

## Development

### Running Tests

Backend:
```bash
cd backend
python -m pytest
```

Frontend:
```bash
cd frontend
npm test
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

The production-ready files will be in the `frontend/build` directory.

## Contributing

Feel free to fork this project and submit pull requests for any improvements!

## Common Issues

**Issue**: Backend won't start
- **Solution**: Make sure you've activated the virtual environment and installed all dependencies from `requirements.txt`

**Issue**: Frontend can't connect to backend
- **Solution**: Ensure the backend is running on port 5000 and check CORS settings in `app.py`

**Issue**: Database errors
- **Solution**: Run `python create_db.py` to reinitialize the database



## Acknowledgments

- Powered by [Groq](https://groq.com) AI
- Built with Flask and React
- Career data and insights generated by AI

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Note**: This tool provides AI-generated career guidance and should be used as a starting point for career exploration. Always verify information with official sources and career counselors.
