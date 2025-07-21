#!/usr/bin/env python3
"""
Sample Python application with compliance issues for demonstration
"""

import requests
import os

# This will trigger AC-2 violation - hardcoded password
DATABASE_PASSWORD = "admin123"
API_KEY = "secret-key-hardcoded"

def connect_to_api():
    """Connect to external API"""
    # This will trigger SC-8 violation - unencrypted HTTP connection
    base_url = "http://api.internal.com"
    
    response = requests.get(f"{base_url}/data", 
                          headers={"Authorization": f"Bearer {API_KEY}"})
    return response.json()

def setup_database():
    """Setup database connection"""
    # This will trigger AC-2 violation - hardcoded credentials
    connection_string = f"mysql://admin:{DATABASE_PASSWORD}@db.example.com:3306/app"
    
    # Simulated database setup with encryption = false
    db_config = {
        "host": "db.example.com",
        "user": "admin",
        "password": DATABASE_PASSWORD,
        "encryption": False  # This will trigger SC-13 violation
    }
    
    return db_config

def allow_public_access():
    """Configure network access"""
    # This will trigger AC-3 violation - overly permissive network access
    allowed_ips = ["0.0.0.0/0", "public_ip"]
    
    firewall_rules = {
        "inbound": {
            "protocol": "tcp",
            "ports": [80, 443, 22],
            "source_ips": allowed_ips
        }
    }
    
    return firewall_rules

if __name__ == "__main__":
    print("Starting application with compliance issues...")
    
    # Connect using insecure methods
    api_data = connect_to_api()
    db_config = setup_database()
    network_config = allow_public_access()
    
    print("Application started (with security vulnerabilities)")
