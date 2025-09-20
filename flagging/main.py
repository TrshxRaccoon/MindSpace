import firebase_admin
from firebase_admin import credentials, firestore
import google.generativeai as genai
import os
import json
from datetime import datetime, timezone


GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
SERVICE_ACCOUNT_KEY_PATH = "/Users/tejasagarwal/Programming/project/ZephyrHack/zephyr-hackathon-55ff5-firebase-adminsdk-fbsvc-de7068ee14.json"

def initialize_firebase():
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
            firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        print("Please make sure the SERVICE_ACCOUNT_KEY_PATH is correct.")
        exit()

def flag_post(title, content):
    genai.configure(api_key = GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")
    context = f"Title: {title}\n\n, Content: {content}"
    prompt = (
        "You are a content moderation assistant for a mental health app called MindSpace. "
        "Analyze the following post and determine if it violates community guidelines (Hate Speech, Harassment, Spam, Self-Harm, Misinformation). "
        "Your response MUST be a single, valid JSON object with the following structure: "
        '{"isFlagged": boolean, "reason": "string", "severity": "string"}. '
        '"isFlagged" should be true if it violates any guideline. '
        '"reason" should be one of: "Hate Speech", "Harassment", "Spam", "Self-Harm", "Misinformation", or "None". '
        '"severity" should be one of: "Low", "Medium", "High", or "None".\n\n'
        f"Analyze this content: '{context}'"
    )
    try:
        response = model.generate_content(prompt)
        json_response = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(json_response)
    except Exception as e:
        print(f"  - Error with LLM response: {e}")
        return {"isFlagged": True, "reason": "Verification Error", "severity": "Unknown"}

def main():
    """Main function to verify all posts and move flagged ones."""
    initialize_firebase()
    db = firestore.client()
    
    print("\nFetching unverified posts from the 'posts' collection...")
    posts_ref = db.collection("posts")
    flagged_ref = db.collection("flagged")
    unverified_posts = posts_ref.where("llmVerified", "!=", True).stream()

    count = 0
    for post in unverified_posts:
        count += 1
        post_id = post.id
        post_data = post.to_dict()
        print(f"\nProcessing post ID: {post_id}")

        verification_result = flag_post(post_data.get("title", ""), post_data.get("content", ""))
        print(f"  - LLM Verification: {verification_result}")

        if verification_result.get("isFlagged"):
            print(f"  - Post flagged. Reason: {verification_result.get('reason')}")
            
            flagged_doc_ref = flagged_ref.document(post_id)
            flagged_doc_ref.set({
                **post_data,
                "llmVerification": verification_result,
                "verifiedAt": datetime.now(timezone.utc)
            })
            
            posts_ref.document(post_id).delete()
            print(f"  - Moved post {post_id} to 'flagged' collection.")
        else:
            posts_ref.document(post_id).update({
                "llmVerified": True,
                "llmVerification": verification_result
            })
            print(f"  - Post {post_id} is clean and marked as verified.")
    
    if count == 0:
        print("\nNo new posts to moderate.")
    else:
        print(f"\nModeration complete. Processed {count} posts.")

if __name__ == "__main__":
    main()
