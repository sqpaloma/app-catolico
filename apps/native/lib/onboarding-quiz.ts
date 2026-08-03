export type OnboardingQuizAnswers = {
  gender?: "masculino" | "feminino" | "prefiro_nao_identificar";
  ageGroup?: "-18" | "18-25" | "25-35" | "35-45" | "45-55" | "55+";
  hasDepression?: boolean;
  goesToChurch?: boolean;
};

/** In-memory only — never put health/onboarding data in URL params or logs. */
let pendingQuiz: OnboardingQuizAnswers | null = null;

export function saveOnboardingQuiz(answers: OnboardingQuizAnswers): void {
  pendingQuiz = answers;
}

export function loadOnboardingQuiz(): OnboardingQuizAnswers | null {
  return pendingQuiz;
}

export function clearOnboardingQuiz(): void {
  pendingQuiz = null;
}
