import os
import google.generativeai as genai
from dotenv import load_dotenv

# Import your tools
from app.services.agent_tools import (
    get_disaster_risk_assessment,
    analyze_emergency_message,
    search_safety_protocols,
    get_global_earthquake_forecast
)

# Load environment variables
load_dotenv()

# 1. Configure API Key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    print("🚨 AGENT ERROR: GOOGLE_API_KEY not found in environment.")
else:
    # Configure the SDK
    genai.configure(api_key=GOOGLE_API_KEY)

# 2. Define the Tool List
tools_list = [
    get_disaster_risk_assessment,
    analyze_emergency_message,
    search_safety_protocols,
    get_global_earthquake_forecast
]

# 3. Initialize Model
# We use 'gemini-1.5-pro' because it worked in your test and is excellent at reasoning.
try:
    model = genai.GenerativeModel(
        model_name='gemini-2.5-flash', 
        tools=tools_list
    )
    
    # 4. Start Chat Session with Automatic Tool Calling
    chat_session = model.start_chat(enable_automatic_function_calling=True)
    print("✅ Agent Service Initialized with gemini-1.5-pro")

except Exception as e:
    print(f"❌ Failed to initialize Gemini Model: {e}")
    model = None
    chat_session = None

async def process_chat_message(user_message: str):
    """
    Main entry point. Sends user text to Gemini.
    Gemini handles the Tool Calling loop automatically.
    """
    if not chat_session:
        return "System Error: AI Model is not initialized. Check server logs."

    try:
        # System prompt to steer behavior
        system_instruction = (
            "You are the DisasterInsight AI Assistant. "
            "Your goal is to help users prepare for and respond to crises. "
            "ALWAYS prioritize official safety protocols using the search_safety_protocols tool. "
            "Use the available tools to answer questions based on data, not just general knowledge. "
            "If a risk is High or Critical, advise immediate caution."
        )
        
        # Send message
        response = chat_session.send_message(f"{system_instruction}\n\nUser: {user_message}")
        
        return response.text
    except Exception as e:
        import traceback
        print("\n❌ GEMINI RUNTIME ERROR:")
        traceback.print_exc()
        return "I apologize, but I am currently unable to connect to the decision network. Please try again later."