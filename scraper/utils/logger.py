import logging
import sys

def get_logger(name: str) -> logging.Logger:
    """Configure and return a standardized logger."""
    
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Standard output handler
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        # Prevent propagation to the root logger to avoid double printing
        logger.propagate = False
        
    return logger
