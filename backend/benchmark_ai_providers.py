#!/usr/bin/env python
"""
benchmark_ai_providers.py

A script to benchmark all configured AI providers in the fallback chain.
Measures latency (response time) and success rate for research publication.
"""
import sys
import os
import time
import json

# Ensure parent directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load dotenv to read configured keys
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    from ai.gemini_service import GeminiService
except ImportError:
    print("Error: Could not import GeminiService. Please run from the backend directory.")
    sys.exit(1)


def run_benchmark():
    print("=" * 60)
    print("           AI PROVIDERS PERFORMANCE BENCHMARK          ")
    print("=" * 60)
    
    # Initialize service
    service = GeminiService()
    
    # Find all available providers
    available_providers = [p for p in service.providers if p.is_available()]
    
    if not available_providers:
        print("[-] No AI providers found or configured. Make sure your .env file is loaded.")
        return
        
    print(f"[+] Found {len(available_providers)} configured provider(s) in the chain:")
    for idx, p in enumerate(available_providers, 1):
        print(f"    {idx}. {p.provider_id} (API Key: Yes)")
        
    print("\n[+] Starting benchmarks (3 queries per provider)...")
    print("-" * 60)
    
    test_prompt = "Hello. Reply with the exact phrase 'API OK' and nothing else."
    
    results = {}
    
    for provider in available_providers:
        print(f"\n[Benchmarking] {provider.provider_id.upper()}...")
        latencies = []
        successes = 0
        failures_log = []
        
        for i in range(1, 4):
            print(f"  Attempt {i}/3... ", end="", flush=True)
            start_time = time.time()
            try:
                # Call generate_content directly on the provider subclass
                res = provider.generate_content(test_prompt, temperature=0.2, max_tokens=10)
                elapsed = time.time() - start_time
                if res and "API OK" in res:
                    print(f"Success ({elapsed:.2f}s)")
                    latencies.append(elapsed)
                    successes += 1
                elif res:
                    print(f"Partial Success ({elapsed:.2f}s) - Unexpected response: '{res[:20]}'")
                    latencies.append(elapsed)
                    successes += 1
                else:
                    print("Failed (No response)")
                    failures_log.append("Empty response returned")
            except Exception as e:
                elapsed = time.time() - start_time
                print(f"Failed with error ({elapsed:.2f}s)")
                failures_log.append(str(e))
                
            time.sleep(1) # Small pause to avoid rate limiting
            
        if successes > 0:
            avg_time = sum(latencies) / len(latencies)
            min_time = min(latencies)
            max_time = max(latencies)
        else:
            avg_time = 0
            min_time = 0
            max_time = 0
            
        results[provider.provider_id] = {
            "success_rate": (successes / 3) * 100,
            "avg_latency": avg_time,
            "min_latency": min_time,
            "max_latency": max_time,
            "errors": failures_log
        }

    # Print Report in Markdown Table Format
    print("\n" + "=" * 60)
    print("                  BENCHMARK REPORT                     ")
    print("=" * 60)
    print("\nCopy the Markdown table below directly into your paper (Section 6: Results):\n")
    
    markdown_table = [
        "| AI Provider ID | Model Name / Type | Success Rate | Avg Latency (s) | Min/Max Latency (s) |",
        "| :--- | :--- | :---: | :---: | :---: |"
    ]
    
    # Map provider IDs to friendly model names
    model_mapping = {
        "local": "Local distilgpt2 (Offline)",
        "hf": "Mistral-7B-Instruct (Hugging Face API)",
        "gemini": "Gemini-2.5-flash / Gemini-2.0-flash",
        "groq": "Llama-3.3-70b-versatile (Groq API)",
        "openrouter": "Gemma-4-31b-it (OpenRouter Free)",
        "mistral": "Mistral-Small-Latest (Mistral AI)",
        "deepseek": "DeepSeek-Chat (DeepSeek API)"
    }
    
    for pid, data in results.items():
        base_name = pid.split("_")[0]
        model_name = model_mapping.get(base_name, "Custom AI Model")
        
        success_str = f"{data['success_rate']:.1f}%"
        avg_str = f"{data['avg_latency']:.2f}s" if data['avg_latency'] > 0 else "N/A"
        min_max_str = f"{data['min_latency']:.2f}s / {data['max_latency']:.2f}s" if data['avg_latency'] > 0 else "N/A"
        
        markdown_table.append(f"| **{pid.upper()}** | {model_name} | {success_str} | {avg_str} | {min_max_str} |")
        
    for line in markdown_table:
        print(line)
        
    print("\n" + "-" * 60)
    print("System optimization note:")
    print("1. Providers with 0% success rate should have their API keys checked in the .env file.")
    print("2. Providers with lower latencies should be prioritised in the fallback list.")
    print("=" * 60)


if __name__ == "__main__":
    run_benchmark()
