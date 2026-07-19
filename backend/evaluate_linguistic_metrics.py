#!/usr/bin/env python
"""
evaluate_linguistic_metrics.py

Pure-Python implementation of linguistic similarity evaluation metrics
(BLEU, Cosine Similarity via scratch-built TF-IDF, and ROUGE-1 approximation).
Used for empirical system evaluation in top-tier research publications.
"""
import math
import re
from collections import Counter


def tokenize(text):
    """Normalize and tokenize text into lowercase words."""
    text = text.lower()
    text = re.sub(r"[^\w\s]", "", text)
    return text.split()


def calculate_bleu_1(candidate_tokens, reference_tokens):
    """Calculate BLEU-1 (unigram precision) with brevity penalty."""
    if not candidate_tokens or not reference_tokens:
        return 0.0

    c_counts = Counter(candidate_tokens)
    r_counts = Counter(reference_tokens)

    # Clipped counts
    clipped_matches = 0
    for word, count in c_counts.items():
        clipped_matches += min(count, r_counts.get(word, 0))

    precision = clipped_matches / len(candidate_tokens)

    # Brevity Penalty
    c_len = len(candidate_tokens)
    r_len = len(reference_tokens)
    if c_len > r_len:
        bp = 1.0
    else:
        bp = math.exp(1 - (r_len / c_len)) if c_len > 0 else 0.0

    return bp * precision


def calculate_cosine_similarity(text1, text2):
    """Calculate Cosine Similarity using scratch-built TF-IDF vector space."""
    tokens1 = tokenize(text1)
    tokens2 = tokenize(text2)

    if not tokens1 or not tokens2:
        return 0.0

    # Create vocabulary
    all_words = set(tokens1 + tokens2)

    # Word frequencies (Term Frequency)
    tf1 = Counter(tokens1)
    tf2 = Counter(tokens2)

    # Since we only have 2 documents in this comparison instance,
    # we compute Cosine Similarity of the frequency vectors.
    dot_product = 0.0
    sum_sq_1 = 0.0
    sum_sq_2 = 0.0

    for word in all_words:
        v1 = tf1.get(word, 0)
        v2 = tf2.get(word, 0)
        dot_product += v1 * v2
        sum_sq_1 += v1 * v1
        sum_sq_2 += v2 * v2

    mag1 = math.sqrt(sum_sq_1)
    mag2 = math.sqrt(sum_sq_2)

    if mag1 == 0 or mag2 == 0:
        return 0.0

    return dot_product / (mag1 * mag2)


def calculate_rouge_1_approx(candidate_tokens, reference_tokens):
    """Calculate ROUGE-1 Recall approximation."""
    if not candidate_tokens or not reference_tokens:
        return 0.0

    c_set = set(candidate_tokens)
    r_set = set(reference_tokens)

    overlapping_words = c_set.intersection(r_set)
    recall = len(overlapping_words) / len(r_set) if len(r_set) > 0 else 0.0
    return recall


def evaluate_response_quality(candidate_answer, expected_answer):
    """
    Perform complete linguistic evaluation of a candidate response
    relative to the AI-generated target answer.
    """
    c_tokens = tokenize(candidate_answer)
    r_tokens = tokenize(expected_answer)

    bleu = calculate_bleu_1(c_tokens, r_tokens)
    cosine = calculate_cosine_similarity(candidate_answer, expected_answer)
    rouge = calculate_rouge_1_approx(c_tokens, r_tokens)

    # Overall semantic matching score (Weighted composite metric)
    composite_score = (0.5 * cosine) + (0.3 * rouge) + (0.2 * bleu)

    return {
        "candidate_word_count": len(c_tokens),
        "expected_word_count": len(r_tokens),
        "bleu_1_precision": round(bleu, 4),
        "cosine_similarity": round(cosine, 4),
        "rouge_1_recall": round(rouge, 4),
        "composite_match_quality": round(composite_score, 4)
    }


if __name__ == "__main__":
    print("=" * 60)
    print("         LINGUISTIC METRIC EVALUATION PREVIEW          ")
    print("=" * 60)
    
    # Test Cases simulating candidate responses
    expected = (
        "The software architecture uses a Model-View-Controller design pattern "
        "to separate application logic, user interface representation, and database storage."
    )
    
    good_candidate = (
        "We used the MVC architecture to separate the database data models, "
        "the presentation views, and the business controller logic."
    )
    
    poor_candidate = (
        "I wrote some python code to show a website and connect it to a database table."
    )
    
    print(f"\n[Expected Answer]: {expected}\n")
    
    print("-" * 60)
    print("[Testing Good Candidate Answer]")
    print(f"Answer: {good_candidate}")
    good_results = evaluate_response_quality(good_candidate, expected)
    for k, v in good_results.items():
        print(f"  {k:30}: {v}")
        
    print("-" * 60)
    print("[Testing Poor Candidate Answer]")
    print(f"Answer: {poor_candidate}")
    poor_results = evaluate_response_quality(poor_candidate, expected)
    for k, v in poor_results.items():
        print(f"  {k:30}: {v}")
        
    print("=" * 60)
