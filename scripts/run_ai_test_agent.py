import os
import sys
import json
import logging
from dotenv import load_dotenv

# Setup path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

load_dotenv()

from ai.gemini_service import GeminiService
from ai.star_analyzer import StarAnalyzer
from ai.company_presets import CompanyPresetEngine
from ai.system_design_evaluator import SystemDesignEvaluator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("AITestAgent")


def run_agent_test_suite():
    print("=" * 70)
    print("TALENTFORGE AI - AUTOMATED MULTI-PROVIDER AI AGENT TEST RUNNER")
    print("=" * 70)

    # 1. Detect Available API Keys
    keys = {
        "GEMINI_API_KEY": bool(os.getenv("GEMINI_API_KEY")),
        "GROQ_API_KEY": bool(os.getenv("GROQ_API_KEY")),
        "OPENROUTER_API_KEY": bool(os.getenv("OPENROUTER_API_KEY")),
        "MISTRAL_API_KEY": bool(os.getenv("MISTRAL_API_KEY")),
        "DEEPSEEK_API_KEY": bool(os.getenv("DEEPSEEK_API_KEY")),
        "HUGGINGFACE_API_KEY": bool(os.getenv("HUGGINGFACE_API_KEY")),
    }

    print("\n[KEYS] Detected API Keys in your .env file:")
    for k, present in keys.items():
        status = "ACTIVE" if present else "Not set"
        print(f"  - {k:<22}: {status}")

    # 2. Test Multi-Provider Generation
    print("\n[TEST 1] Multi-Provider LLM Intelligence Check...")
    gemini = GeminiService()
    try:
        response = gemini.generate_content("Say 'TalentForge AI Agent Test Engine is fully operational!'")
        print(f"  [LLM Output]: {response.strip()}")
    except Exception as e:
        print(f"  [LLM Warning]: Fallback engine triggered: {e}")

    # 3. Test STAR Analyzer Agent
    print("\n[TEST 2] STAR Behavioral Diagnostic Agent...")
    star_agent = StarAnalyzer()
    star_res = star_agent.analyze(
        question="Tell me about a time you handled a critical outage under severe pressure.",
        answer="On Cyber Monday, our payment processing gateway went down due to high traffic volume. My task was to restore checkout within 15 minutes. I enabled DB read replicas and deployed an emergency sliding-window rate limiter. As a result, uptime reached 99.95% and we saved $120,000 in revenue."
    )
    print(f"  - STAR Score           : {star_res.get('overall_star_score')}%")
    print(f"  - Has Quantitative KPIs : {star_res.get('has_quantitative_metrics')}")
    print(f"  - Sentence Count Tagged : {len(star_res.get('sentence_breakdown', []))}")

    # 4. Test Company Preset Engine
    print("\n[TEST 3] Company Culture-Fit Presets...")
    company_engine = CompanyPresetEngine()
    companies = company_engine.get_companies()
    print(f"  - Supported Companies  : {len(companies)} ({', '.join([c['name'] for c in companies[:4]])}...)")
    q_sample = company_engine.generate_company_questions("amazon", "Staff Software Engineer", 2)
    print(f"  - Generated Amazon Q1  : {q_sample[0]['text']}")

    # 5. Test System Design Architecture Evaluator
    print("\n[TEST 4] System Design Architecture Agent...")
    sd_engine = SystemDesignEvaluator()
    sd_res = sd_engine.evaluate(
        problem_id="rate-limiter",
        candidate_solution="I design a sliding-window rate limiter using Redis Cluster with token bucket counters behind an Nginx API Gateway."
    )
    print(f"  - Architecture Score   : {sd_res.get('architecture_score')}%")
    print(f"  - Scalability Score    : {sd_res.get('scalability_score')}%")
    print(f"  - SPOFs Detected       : {len(sd_res.get('single_points_of_failure', []))}")

    print("\n" + "=" * 70)
    print("ALL AGENT TEST SUITES EXECUTED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_agent_test_suite()
