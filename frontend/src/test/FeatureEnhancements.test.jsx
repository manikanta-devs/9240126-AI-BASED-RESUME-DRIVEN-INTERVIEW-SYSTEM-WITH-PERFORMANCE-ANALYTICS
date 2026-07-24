import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import StarBreakdownCard from '../components/StarBreakdownCard';
import CompanySelector from '../components/CompanySelector';

describe('Feature Enhancements Component Tests', () => {
  it('renders StarBreakdownCard correctly with STAR metrics', () => {
    const analysis = {
      situation_score: 85,
      task_score: 90,
      action_score: 80,
      result_score: 75,
      overall_star_score: 82,
      has_quantitative_metrics: false,
      sentence_breakdown: [
        { sentence: "The server crashed.", category: "Situation" },
        { sentence: "I checked the logs.", category: "Action" }
      ],
      improved_star_rewrite: "When the server crashed, I checked the logs and recovered system availability in 5 minutes."
    };

    render(<StarBreakdownCard analysis={analysis} />);

    expect(screen.getByText('STAR Method Diagnostic')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
    expect(screen.getByText('Missing Quantifiable Metrics:')).toBeInTheDocument();
    expect(screen.getByText('"The server crashed."')).toBeInTheDocument();
  });

  it('renders CompanySelector correctly and triggers selection callback', () => {
    const companies = [
      { id: 'amazon', name: 'Amazon', badge: '16 Leadership Principles', description: 'Customer obsession', principles: ['Ownership'] },
      { id: 'google', name: 'Google', badge: 'Googleyness & Scale', description: 'Cognitive ability', principles: ['Scale'] }
    ];

    const onSelect = vi.fn();

    render(<CompanySelector companies={companies} selectedCompany={companies[0]} onSelectCompany={onSelect} />);

    expect(screen.getByText('Amazon')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();

    const googleBtn = screen.getByText('Google');
    fireEvent.click(googleBtn);
    expect(onSelect).toHaveBeenCalledWith(companies[1]);
  });
});
