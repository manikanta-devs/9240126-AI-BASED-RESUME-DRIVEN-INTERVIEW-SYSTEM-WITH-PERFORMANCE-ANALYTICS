/**
 * Panel Interview System
 * 3 AI interviewer personas that rotate through questions
 */

export const PANEL_MEMBERS = [
  {
    id: 'technical_lead',
    name: 'Alex Chen',
    role: 'Technical Lead',
    initials: 'AC',
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-300',
    style: 'direct',
    intro: "Let's dive into the technical details.",
    questionTypes: ['technical'],
    feedbackTone: 'analytical',
    adjustFeedback: (feedback) => `Technical assessment: ${feedback} Focus on architecture patterns and implementation trade-offs.`,
  },
  {
    id: 'hr_manager',
    name: 'Sarah Park',
    role: 'HR Manager',
    initials: 'SP',
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-300',
    style: 'encouraging',
    intro: "I'd love to hear about your experience.",
    questionTypes: ['behavioral', 'situational'],
    feedbackTone: 'supportive',
    adjustFeedback: (feedback) => `Great effort! ${feedback} Consider sharing more about how you collaborated with your team.`,
  },
  {
    id: 'strict_manager',
    name: 'David Okafor',
    role: 'Engineering Manager',
    initials: 'DO',
    color: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-500/30',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-300',
    style: 'strict',
    intro: "Let's see how you handle pressure.",
    questionTypes: ['technical', 'situational'],
    feedbackTone: 'critical',
    adjustFeedback: (feedback) => `${feedback} In a real interview, the bar would be higher. Push for more specificity and measurable outcomes.`,
  },
]

/**
 * Get the panel member for a given question index
 */
export function getPanelMember(questionIndex) {
  return PANEL_MEMBERS[questionIndex % PANEL_MEMBERS.length]
}

/**
 * Get the best-fit panel member for a question type
 */
export function getPanelMemberForQuestion(question) {
  if (question?.persona_id) {
    const directMatch = PANEL_MEMBERS.find(p => p.id === question.persona_id)
    if (directMatch) return directMatch
  }
  const type = question?.type || 'technical'
  const match = PANEL_MEMBERS.find(p => p.questionTypes.includes(type))
  return match || PANEL_MEMBERS[0]
}

/**
 * Adjust feedback based on persona tone
 */
export function adjustFeedbackForPersona(evaluation, persona) {
  if (!evaluation || !persona) return evaluation

  return {
    ...evaluation,
    feedback: persona.adjustFeedback(evaluation.feedback || ''),
    persona_id: persona.id,
    persona_name: persona.name,
  }
}
