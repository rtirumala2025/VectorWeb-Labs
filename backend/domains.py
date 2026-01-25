"""
VectorWeb Labs - Domain Checker Service
Handles domain availability checking via WHOIS lookups.
"""

import whois
from typing import Optional
import ai


def check_availability(domain: str, vibe: str = "modern") -> dict:
    """
    Check if a domain is available for registration.
    
    Args:
        domain: The domain to check (e.g., "coolbrand.com")
        vibe: The brand vibe for generating alternatives if taken
    
    Returns:
        dict: {
            "available": bool,
            "domain": str,
            "suggestions": list[str]  # Only populated if domain is taken
        }
    """
    # Ensure domain has a TLD
    if "." not in domain:
        domain = f"{domain}.com"
    
    try:
        # Perform WHOIS lookup
        w = whois.whois(domain)
        
        # Check if domain is registered
        # If whois returns data with a domain_name, it's taken
        if w.domain_name is not None:
            # Domain is taken - generate alternatives
            suggestions = ai.generate_domain_ideas(domain, vibe)
            return {
                "available": False,
                "domain": domain,
                "suggestions": suggestions
            }
        else:
            # No domain_name in response usually means available
            return {
                "available": True,
                "domain": domain,
                "suggestions": []
            }
            
    except Exception as e:
        # On any error, check if it indicates domain is available
        error_str = str(e).lower()
        
        # Common "not found" patterns indicate domain is available
        if any(pattern in error_str for pattern in [
            "no match", "not found", "no entries", "no data", 
            "status: available", "is available", "domain not found"
        ]):
            return {
                "available": True,
                "domain": domain,
                "suggestions": []
            }
        
        # For other errors, log and return available with warning
        print(f"WHOIS lookup error for {domain}: {e}")
        return {
            "available": True,
            "domain": domain,
            "suggestions": [],
            "warning": f"Could not verify: {str(e)}"
        }


def bulk_check(domains: list[str]) -> list[dict]:
    """
    Check availability of multiple domains.
    
    Args:
        domains: List of domains to check
    
    Returns:
        list[dict]: List of availability results
    """
    results = []
    for domain in domains:
        result = check_availability(domain)
        results.append(result)
    return results
