import httpx
from typing import List
from utils.logger import get_logger

logger = get_logger(__name__)

async def send_expo_push_notifications(tokens: List[str], title: str, body: str, data: dict = None):
    """
    Sends push notifications using the Expo Push API.
    """
    if not tokens:
        return
        
    url = "https://exp.host/--/api/v2/push/send"
    
    # Filter valid ExponentPushTokens
    valid_tokens = [t for t in tokens if str(t).startswith("ExponentPushToken")]
    if not valid_tokens:
        logger.warning("No valid Expo push tokens found.")
        return

    messages = []
    for token in valid_tokens:
        message = {
            "to": token,
            "sound": "default",
            "title": title,
            "body": body,
        }
        if data:
            message["data"] = data
        messages.append(message)
        
    try:
        async with httpx.AsyncClient() as client:
            # We can send up to 100 messages at a time according to Expo docs
            for i in range(0, len(messages), 100):
                batch = messages[i:i+100]
                response = await client.post(
                    url,
                    json=batch,
                    headers={
                        "Accept": "application/json",
                        "Accept-encoding": "gzip, deflate",
                        "Content-Type": "application/json",
                    }
                )
                response.raise_for_status()
            logger.info(f"Successfully sent push notifications to {len(valid_tokens)} devices.")
    except Exception as e:
        logger.error(f"Failed to send Expo push notifications: {e}")
