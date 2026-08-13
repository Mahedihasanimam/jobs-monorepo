import asyncio
import sys
from dotenv import load_dotenv
from utils.logger import get_logger
from services.supabase_service import SupabaseJobService
from services.notification_service import send_expo_push_notifications

# Load environment variables
load_dotenv()
logger = get_logger(__name__)

async def notify_deadlines():
    supabase = SupabaseJobService()
    if not supabase.is_configured():
        logger.error("Supabase is not configured. Exiting.")
        sys.exit(1)

    # Dictionary mapping 'days away' to emotional message templates
    templates = {
        3: {
            "title": "⏳ আবেদনের সময় শেষ হতে ৩ দিন বাকি!",
            "body": "আপনার সেভ করা '{title}' জবের আবেদনের শেষ সময় আর মাত্র ৩ দিন! স্বপ্ন পূরণের প্রথম ধাপটি আজই সম্পন্ন করুন।"
        },
        1: {
            "title": "⚠️ সময় ফুরিয়ে আসছে!",
            "body": "'{title}' জবের আবেদনের শেষ দিন কাল। সুযোগটি হাতছাড়া করবেন না, আজই আবেদন করুন।"
        },
        0: {
            "title": "🚨 আজই শেষ সুযোগ!",
            "body": "'{title}' এর ডেডলাইন আজ শেষ হচ্ছে। আপনার একটি আবেদনই হয়তো বদলে দিতে পারে আপনার জীবন!"
        }
    }

    total_notifications = 0

    for days_away, msg_template in templates.items():
        jobs = supabase.get_approaching_deadlines(days_away)
        
        for job in jobs:
            job_id = job["id"]
            job_title = job["title"]
            
            # Get users subscribed to this job
            tokens = supabase.get_job_subscribers(job_id)
            if not tokens:
                continue
                
            title = msg_template["title"]
            body = msg_template["body"].format(title=job_title)
            
            logger.info(f"Sending '{days_away} days left' notification for job {job_id} to {len(tokens)} users.")
            
            # Send notification
            await send_expo_push_notifications(
                tokens=tokens, 
                title=title, 
                body=body, 
                data={"type": "deadline_reminder", "job_id": job_id, "days_left": days_away}
            )
            total_notifications += len(tokens)

    logger.info(f"Deadline notification process completed. Total sent: {total_notifications}")

if __name__ == "__main__":
    asyncio.run(notify_deadlines())
