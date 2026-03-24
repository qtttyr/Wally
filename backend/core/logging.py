"""
Logging configuration for Wally API.

Provides structured logging with appropriate levels for development and production.
"""

import sys
import logging
from typing import Optional

from core.config import settings


class ColorFormatter(logging.Formatter):
    """Colored formatter for console output in development."""
    
    COLORS = {
        "DEBUG": "\033[36m",     # Cyan
        "INFO": "\033[32m",     # Green
        "WARNING": "\033[33m",   # Yellow
        "ERROR": "\033[31m",    # Red
        "CRITICAL": "\033[35m",  # Magenta
        "RESET": "\033[0m",
    }
    
    def format(self, record):
        levelname = record.levelname
        if levelname in self.COLORS:
            record.levelname = (
                f"{self.COLORS[levelname]}{levelname}{self.COLORS['RESET']}"
            )
        return super().format(record)


def setup_logging(
    level: Optional[str] = None,
    log_file: Optional[str] = None
) -> logging.Logger:
    """
    Configure logging for the application.
    
    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional file path for file logging
        
    Returns:
        Configured root logger
    """
    log_level = level or ("DEBUG" if settings.DEBUG else "INFO")
    
    root_logger = logging.getLogger("wally")
    root_logger.setLevel(getattr(logging, log_level.upper()))
    
    if root_logger.handlers:
        root_logger.handlers.clear()
    
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    
    if settings.DEBUG:
        console_formatter = ColorFormatter(
            fmt="%(asctime)s | %(levelname)-18s | %(name)s:%(lineno)d | %(message)s",
            datefmt="%H:%M:%S"
        )
    else:
        console_formatter = logging.Formatter(
            fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
    
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)
    
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.INFO)
        file_formatter = logging.Formatter(
            fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        file_handler.setFormatter(file_formatter)
        root_logger.addHandler(file_handler)
    
    return root_logger


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for a specific module.
    
    Args:
        name: Logger name (typically __name__)
        
    Returns:
        Logger instance
    """
    return logging.getLogger(f"wally.{name}")


# Initialize logging on module import
# Use DEBUG=True in .env for verbose logging
logger = setup_logging()
