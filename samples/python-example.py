#!/usr/bin/env python3
"""
Sample Python application with FedRAMP compliance issues
This file demonstrates various security violations that will trigger AI suggestions
"""

import os
import requests
import mysql.connector

# AC-2 Violation: Hardcoded credentials
DATABASE_PASSWORD = "password123"  # Hardcoded password detected
API_KEY = "sk-1234567890abcdef"    # Another hardcoded secret

def connect_to_database():
    """Connect to database with hardcoded credentials"""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='myapp',
            user='admin',
            password=DATABASE_PASSWORD  # Using hardcoded password
        )
        return connection
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None

def make_api_request():
    """Make API requests with security issues"""
    # SC-8 Violation: Unencrypted HTTP connection
    api_url = "http://api.insecure-service.com/data"  # HTTP instead of HTTPS
    
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
    
    try:
        # This will trigger SC-8 violation
        response = requests.get(api_url, headers=headers, verify=False)
        return response.json()
    except Exception as e:
        print(f"API request failed: {e}")
        return None

class SecurityManager:
    def __init__(self):
        # More hardcoded credentials
        self.admin_password = "admin123"  # AC-2 violation
        self.encryption_enabled = False   # SC-13 violation - encryption disabled
    
    def authenticate_user(self, username, password):
        """Simple authentication with security issues"""
        # This is a simplified example - real apps would use proper auth
        if username == "admin" and password == self.admin_password:
            return True
        return False
    
    def encrypt_data(self, data):
        """Data encryption method"""
        if not self.encryption_enabled:
            # SC-13 Violation: Encryption disabled
            print("WARNING: Encryption is disabled!")
            return data  # Returning unencrypted data
        
        # In a real app, this would implement proper encryption
        return f"encrypted_{data}"

def setup_network_config():
    """Network configuration with overly permissive settings"""
    config = {
        'allowed_ips': ['0.0.0.0/0'],  # AC-3 Violation: overly permissive network access
        'public_access': True,
        'firewall_rules': {
            'allow_all': True,  # Another AC-3 violation
            'ports': ['80', '443', '22', '3306']  # Multiple open ports
        }
    }
    return config

def main():
    """Main application function"""
    print("Starting FedRAMP Compliance Demo Application")
    
    # Initialize security manager with issues
    security_mgr = SecurityManager()
    
    # Connect to database with hardcoded credentials
    db_connection = connect_to_database()
    if db_connection:
        print("Database connected successfully")
        db_connection.close()
    
    # Make insecure API request
    api_data = make_api_request()
    if api_data:
        print("API data received")
    
    # Setup insecure network config
    network_config = setup_network_config()
    print(f"Network configured: {network_config}")
    
    # Test authentication with hardcoded credentials
    if security_mgr.authenticate_user("admin", "admin123"):
        print("Admin authenticated successfully")
    
    # Test encryption (which is disabled)
    encrypted_data = security_mgr.encrypt_data("sensitive information")
    print(f"Data processed: {encrypted_data}")

if __name__ == "__main__":
    main()
