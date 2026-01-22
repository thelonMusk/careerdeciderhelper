  import React, { useState, useEffect } from 'react';
  import { careerAPI } from './services/api';
  import { 
    Briefcase, 
    Target, 
    Lightbulb, 
    BookOpen, 
    Send, 
    Loader2,
    GraduationCap,
    TrendingUp,
    DollarSign,
    Clock,
    History,
    MessageCircle 
  } from 'lucide-react';
  import './App.css';

  function App() {
    const [activeTab, setActiveTab] = useState('matcher');
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [showEmailInput, setShowEmailInput] = useState(true);
    
    // Matcher state
    const [matcherInput, setMatcherInput] = useState({
      skills: '',
      interests: '',
      education: '',
      experience: ''
    });
    const [matcherResults, setMatcherResults] = useState(null);
    
    // Ideator state
    const [ideatorPrompt, setIdeatorPrompt] = useState('');
    const [ideatorResults, setIdeatorResults] = useState(null);
    
    // Requirements state
    const [selectedCareer, setSelectedCareer] = useState('');
    const [requirementsResults, setRequirementsResults] = useState(null);
    
    // Q&A state
    const [qaQuestion, setQaQuestion] = useState('');
    const [qaJobTitle, setQaJobTitle] = useState('');
    const [qaResults, setQaResults] = useState(null);
    const [qaHistory, setQaHistory] = useState([]);
    
    // History state
    const [history, setHistory] = useState([]);

    const handleEmailSubmit = async () => {
      if (!userEmail.trim()) {
        alert('Please enter your email');
        return;
      }
      
      try {
        const response = await careerAPI.createUser(userEmail);
        setUserId(response.user_id);
        setShowEmailInput(false);
        localStorage.setItem('career_advisor_user_id', response.user_id);
        localStorage.setItem('career_advisor_email', userEmail);
      } catch (error) {
        alert('Error creating user: ' + (error.message || error));
      }
    };

    useEffect(() => {
      // Check if user already exists in localStorage
      const savedUserId = localStorage.getItem('career_advisor_user_id');
      const savedEmail = localStorage.getItem('career_advisor_email');
      if (savedUserId && savedEmail) {
        setUserId(parseInt(savedUserId));
        setUserEmail(savedEmail);
        setShowEmailInput(false);
      }
    }, []);

    const handleJobMatcher = async () => {
      if (!matcherInput.skills && !matcherInput.interests) {
        alert('Please fill in at least skills or interests');
        return;
      }

      setLoading(true);
      try {
        const response = await careerAPI.jobMatcher({
          ...matcherInput,
          user_id: userId
        });
        
        if (response.success) {
          setMatcherResults(response.careers);
        } else {
          alert('Error: ' + response.error);
        }
      } catch (error) {
        alert('Error: ' + (error.message || error));
      } finally {
        setLoading(false);
      }
    };

    const handleCareerIdeator = async () => {
      if (!ideatorPrompt.trim()) {
        alert('Please describe what you\'re looking for');
        return;
      }

      setLoading(true);
      try {
        const response = await careerAPI.careerIdeator({
          prompt: ideatorPrompt,
          user_id: userId
        });
        
        if (response.success) {
          setIdeatorResults(response.ideas);
        } else {
          alert('Error: ' + response.error);
        }
      } catch (error) {
        alert('Error: ' + (error.message || error));
      } finally {
        setLoading(false);
      }
    };

    const handleGetRequirements = async () => {
      if (!selectedCareer.trim()) {
        alert('Please enter a career name');
        return;
      }

      setLoading(true);
      try {
        const response = await careerAPI.careerRequirements({
          career: selectedCareer,
          user_id: userId
        });
        
        if (response.success) {
          setRequirementsResults(response.requirements);
        } else {
          alert('Error: ' + response.error);
        }
      } catch (error) {
        alert('Error: ' + (error.message || error));
      } finally {
        setLoading(false);
      }
    };

    const handleAskAboutJob = async () => {
      if (!qaQuestion.trim()) {
        alert('Please enter a question');
        return;
      }

      setLoading(true);
      try {
        const response = await careerAPI.askAboutJob({
          question: qaQuestion,
          job_title: qaJobTitle,
          user_id: userId
        });
        
        if (response.success) {
          const newQA = {
            question: response.question,
            answer: response.answer,
            job_title: response.job_title,
            timestamp: new Date().toISOString()
          };
          setQaResults(newQA);
          setQaHistory([newQA, ...qaHistory]);
        } else {
          alert('Error: ' + response.error);
        }
      } catch (error) {
        alert('Error: ' + (error.message || error));
      } finally {
        setLoading(false);
      }
    };

    const loadHistory = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const response = await careerAPI.getUserHistory(userId);
        if (response.success) {
          setHistory(response.history);
        }
      } catch (error) {
        alert('Error loading history: ' + (error.message || error));
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (activeTab === 'history' && userId) {
        loadHistory();
      }
    }, [activeTab, userId]);

    if (showEmailInput) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <Briefcase className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Career Advisor</h1>
              <p className="text-gray-600">Powered by Groq AI</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your email to get started
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
                />
              </div>
              
              <button
                onClick={handleEmailSubmit}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Career Exploration
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
              <Briefcase className="w-10 h-10 text-blue-600" />
              AI Career Advisor
            </h1>
            <p className="text-gray-600">Welcome, {userEmail}</p>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-lg p-2 mb-8 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('matcher')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'matcher' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Target className="w-5 h-5" />
              Job Matcher
            </button>
            <button
              onClick={() => setActiveTab('ideator')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'ideator' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Lightbulb className="w-5 h-5" />
              Career Ideator
            </button>
            <button
              onClick={() => setActiveTab('requirements')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'requirements' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Requirements
            </button>
            <button
              onClick={() => setActiveTab('qa')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'qa' 
                  ? 'bg-pink-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              Ask About Jobs
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'history' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <History className="w-5 h-5" />
              History
            </button>
          </div>

          {/* Job Matcher Tab */}
          {activeTab === 'matcher' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  Find Your Perfect Career Match
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Skills</label>
                    <textarea
                      value={matcherInput.skills}
                      onChange={(e) => setMatcherInput({...matcherInput, skills: e.target.value})}
                      placeholder="e.g., Python, JavaScript, Data Analysis, Communication..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Interests</label>
                    <textarea
                      value={matcherInput.interests}
                      onChange={(e) => setMatcherInput({...matcherInput, interests: e.target.value})}
                      placeholder="e.g., Technology, Creative work, Helping people..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
                    <input
                      value={matcherInput.education}
                      onChange={(e) => setMatcherInput({...matcherInput, education: e.target.value})}
                      placeholder="e.g., Bachelor's in Computer Science"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                    <select
                      value={matcherInput.experience}
                      onChange={(e) => setMatcherInput({...matcherInput, experience: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select experience</option>
                      <option value="Entry Level">Entry Level (0-2 years)</option>
                      <option value="Mid Level">Mid Level (3-5 years)</option>
                      <option value="Senior Level">Senior Level (5+ years)</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={handleJobMatcher}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Your Profile...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Find Matching Careers
                    </>
                  )}
                </button>
              </div>

              {matcherResults && (
                <div className="space-y-4">
                  {matcherResults.map((career, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{career.title}</h3>
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {career.matchScore}% Match
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{career.whyGoodFit}</p>
                      
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <DollarSign className="w-5 h-5 text-green-600 mt-1" />
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Salary Range</p>
                            <p className="text-sm text-gray-600">{career.salaryRange}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <TrendingUp className="w-5 h-5 text-purple-600 mt-1" />
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Growth Potential</p>
                            <p className="text-sm text-gray-600">{career.growthPotential}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <GraduationCap className="w-5 h-5 text-blue-600 mt-1" />
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Requirements</p>
                            <p className="text-sm text-gray-600">{career.requirements.slice(0, 2).join(', ')}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Key Requirements:</p>
                        <div className="flex flex-wrap gap-2">
                          {career.requirements.map((req, i) => (
                            <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Career Ideator Tab */}
          {activeTab === 'ideator' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                  Discover Unique Career Ideas
                </h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What kind of career are you looking for?
                  </label>
                  <textarea
                    value={ideatorPrompt}
                    onChange={(e) => setIdeatorPrompt(e.target.value)}
                    placeholder="e.g., 'I want to combine technology and environmental sustainability' or 'Something creative that involves helping people'"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={handleCareerIdeator}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Ideas...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-5 h-5" />
                      Generate Career Ideas
                    </>
                  )}
                </button>
              </div>

              {ideatorResults && (
                <div className="space-y-4">
                  {ideatorResults.map((idea, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{idea.title}</h3>
                      
                      <p className="text-gray-700 mb-4">{idea.description}</p>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-purple-900 mb-1">Why It's Interesting:</p>
                        <p className="text-sm text-purple-800">{idea.whyInteresting}</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Industries:</p>
                          <div className="flex flex-wrap gap-2">
                            {idea.industries.map((industry, i) => (
                              <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                {industry}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Key Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {idea.skillsNeeded.slice(0, 3).map((skill, i) => (
                              <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-gray-700">Earning Potential:</span>
                        <span className="text-gray-600">{idea.earningPotential}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Requirements Tab */}
          {activeTab === 'requirements' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-green-600" />
                  Career Requirements & Path
                </h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter a career you want to learn about
                  </label>
                  <input
                    value={selectedCareer}
                    onChange={(e) => setSelectedCareer(e.target.value)}
                    placeholder="e.g., Software Engineer, UX Designer, Data Scientist..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleGetRequirements()}
                  />
                </div>
                
                <button
                  onClick={handleGetRequirements}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gathering Information...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-5 h-5" />
                      Get Career Guide
                    </>
                  )}
                </button>
              </div>

              {requirementsResults && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{requirementsResults.careerTitle}</h3>
                  
                  <div className="space-y-6">
                    {/* Education */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        Education Requirements
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {requirementsResults.education.map((edu, i) => (
                          <li key={i}>{edu}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Essential Skills</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Technical Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {requirementsResults.essentialSkills.technical.map((skill, i) => (
                              <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Soft Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {requirementsResults.essentialSkills.soft.map((skill, i) => (
                              <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Career Path */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        Career Path
                      </h4>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        {requirementsResults.careerPath.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Timeline */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Timeline
                      </h4>
                      <p className="text-gray-700">{requirementsResults.timeline}</p>
                    </div>

                    {/* Salary */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Salary Expectations
                      </h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Entry Level</p>
                          <p className="text-lg font-semibold text-gray-900">{requirementsResults.salaryExpectations.entry}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Mid Level</p>
                          <p className="text-lg font-semibold text-gray-900">{requirementsResults.salaryExpectations.mid}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Senior Level</p>
                          <p className="text-lg font-semibold text-gray-900">{requirementsResults.salaryExpectations.senior}</p>
                        </div>
                      </div>
                    </div>

                    {/* Job Market */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Job Market Outlook</h4>
                      <p className="text-gray-700">{requirementsResults.jobMarketOutlook}</p>
                    </div>

                    {/* Resources */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Learning Resources</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {requirementsResults.learningResources.map((resource, i) => (
                          <li key={i}>{resource}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Challenges */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Common Challenges</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {requirementsResults.challenges.map((challenge, i) => (
                          <li key={i}>{challenge}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Daily Responsibilities */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Day-to-Day Responsibilities</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {requirementsResults.dailyResponsibilities.map((resp, i) => (
                          <li key={i}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ask About Jobs Tab */}
          {activeTab === 'qa' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-pink-600" />
                  Ask Questions About Any Job
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job/Career (Optional)
                    </label>
                    <input
                      value={qaJobTitle}
                      onChange={(e) => setQaJobTitle(e.target.value)}
                      placeholder="e.g., Data Scientist, UX Designer (leave empty for general questions)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Question
                    </label>
                    <textarea
                      value={qaQuestion}
                      onChange={(e) => setQaQuestion(e.target.value)}
                      placeholder="e.g., What's the typical work-life balance? How do I break into this field? What are the biggest challenges?"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleAskAboutJob}
                  disabled={loading}
                  className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Getting Answer...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Ask Question
                    </>
                  )}
                </button>
              </div>

              {/* Current Answer */}
              {qaResults && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="mb-4">
                    {qaResults.job_title && (
                      <div className="inline-block bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-semibold mb-3">
                        {qaResults.job_title}
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{qaResults.question}</h3>
                  </div>
                  
                  <div className="prose max-w-none">
                    <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {qaResults.answer}
                    </div>
                  </div>
                </div>
              )}

              {/* Q&A History */}
              {qaHistory.length > 1 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Previous Questions</h3>
                  <div className="space-y-4">
                    {qaHistory.slice(1).map((qa, index) => (
                      <div key={index} className="border-l-4 border-pink-400 pl-4 py-2">
                        {qa.job_title && (
                          <span className="text-sm font-semibold text-pink-600">{qa.job_title} • </span>
                        )}
                        <p className="font-semibold text-gray-900 mb-1">{qa.question}</p>
                        <p className="text-gray-600 text-sm line-clamp-2">{qa.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <History className="w-6 h-6 text-orange-600" />
                  Your Search History
                </h2>
                
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                    <p className="text-gray-600 mt-2">Loading history...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No search history yet. Start exploring careers!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {item.type === 'matcher' && <Target className="w-5 h-5 text-blue-600" />}
                            {item.type === 'ideator' && <Lightbulb className="w-5 h-5 text-purple-600" />}
                            {item.type === 'requirements' && <BookOpen className="w-5 h-5 text-green-600" />}
                            {item.type === 'job_qa' && <MessageCircle className="w-5 h-5 text-pink-600" />}
                            <span className="font-semibold text-gray-900 capitalize">{item.type}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Query:</strong> {
                            item.type === 'matcher' 
                              ? (typeof item.query === 'string' ? JSON.parse(item.query).skills || 'N/A' : item.query.skills || 'N/A')
                              : (typeof item.query === 'string' ? item.query : JSON.stringify(item.query))
                          }
                        </div>
                        
                        <button
                          onClick={() => {
                            if (item.type === 'matcher') {
                              setMatcherResults(item.results);
                              setActiveTab('matcher');
                            } else if (item.type === 'ideator') {
                              setIdeatorResults(item.results);
                              setActiveTab('ideator');
                            } else if (item.type === 'requirements') {
                              setRequirementsResults(item.results);
                              setActiveTab('requirements');
                            } else if (item.type === 'job_qa') {
                              const query = typeof item.query === 'string' ? JSON.parse(item.query) : item.query;
                              const results = typeof item.results === 'string' ? JSON.parse(item.results) : item.results;
                              setQaResults({
                                question: query.question,
                                answer: results.answer,
                                job_title: query.job_title
                              });
                              setActiveTab('qa');
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Results →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  export default App;