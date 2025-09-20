import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta, timezone
import google.generativeai as genai
import os
import dateutil.parser

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
SERVICE_ACCOUNT_KEY_PATH = "/Users/tejasagarwal/Programming/project/ZephyrHack/zephyr-hackathon-55ff5-firebase-adminsdk-fbsvc-de7068ee14.json"
USER_EMAIL = "vinayaksingh3012@gmail.com"

def initialize_firebase():
    """Initializes the Firebase Admin SDK."""
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
            firebase_admin.initialize_app(cred)
    except Exception as e:
        exit()

def get_weekly_journal_entries(user_email):
    """Fetches the last 7 days of journal entries for a user."""
    db = firestore.client()
    user_ref = db.collection("users").document(user_email)

    try:
        user_doc = user_ref.get()
        if not user_doc.exists:
            return []

        user_data = user_doc.to_dict()
        journal_entries = user_data.get("journal", [])

        one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        weekly_entries = []

        for entry in journal_entries:
            entry_date = entry.get("date")
            # This now only needs to handle Firestore's datetime objects
            if entry_date and isinstance(entry_date, datetime):
                # Ensure the entry_date is timezone-aware for correct comparison
                if entry_date.tzinfo is None:
                    entry_date = entry_date.replace(tzinfo=timezone.utc)

                if entry_date >= one_week_ago:
                    weekly_entries.append(entry)
                else:
                    print(f"  - Skipping old entry from {entry_date.strftime('%Y-%m-%d')}")
        
        return weekly_entries

    except Exception as e:
        return []

def summarize_with_gemini(entries):
    """Summarizes journal entries using the Gemini API."""
    if not entries:
        return "No journal entries from the last week to summarize."

    full_text = "\n\n".join([f"Mood: {entry.get('mood', 'N/A')}\nEntry: {entry.get('entry', '')}" for entry in entries])
    
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = (
        "You are an AI assistant that provides a compassionate and insightful summary, do not include any introductory message get the summary directly"
        "of a user's journal entries from the past week. "
        "Your response MUST be a single, clean HTML string. "
        "Do not include any CSS, <style> tags, markdown, or the ```html wrapper. "
        "Use only the following HTML tags: <p>, <strong>, <em>, <ul>, and <li>. "
        "Highlight key themes, emotions, and potential insights. The summary should be supportive, "
        "encouraging"
        "\n\nJournal Entries:\n"
        f"{full_text}"
    )

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"❌ Error generating summary: {e}"

def main():
    """Main function to generate and save summaries for all users."""
    initialize_firebase()
    db = firestore.client()
    
    print("\nFetching all users...")
    users_ref = db.collection("users")
    users = users_ref.stream()

    for user in users:
        user_email = user.id
        user_data = user.to_dict()
        print(f"\nProcessing user: {user_email}")

        # 1. Get weekly entries directly from the user_data we already fetched
        weekly_entries = get_weekly_journal_entries(user_email=user_email)
        
        # 2. Generate summary
        summary = summarize_with_gemini(weekly_entries)
        print(f"  - Summary generated.")

        # 3. Save summary back to Firestore
        user_doc_ref = users_ref.document(user_email)
        user_doc_ref.update({
            "weeklySummary": {
                "summaryText": summary,
                "generatedAt": datetime.now(timezone.utc)
            }
        })
        print(f"  - Summary saved to Firestore.")
    
    print("\n✅ All user summaries have been updated.")

if __name__ == "__main__":
    main()
