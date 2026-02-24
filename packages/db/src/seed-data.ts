/**
 * Seed data constants for InternMarket demo marketplace.
 * Extracted from seed.ts to keep files under 200 LOC.
 */

// Demo clerkUserIds — static strings used as stable seed identities
export const CREATORS_DATA = [
  { clerkUserId: "demo_alice_001", displayName: "Alice Builder", bio: "Full-stack agent creator", githubUsername: "alice-builder" },
  { clerkUserId: "demo_bob_002", displayName: "Bob DevTools", bio: "CLI tools and automation", githubUsername: "bob-devtools" },
  { clerkUserId: "demo_carol_003", displayName: "Carol AI", bio: "AI-powered agents for productivity" },
] as const;

/** creatorId is set dynamically after creators are inserted */
export function buildAgentData(creatorIds: { alice: string; bob: string; carol: string }) {
  return [
    { slug: "code-reviewer-pro", creatorId: creatorIds.alice, name: "Code Reviewer Pro", description: "AI-powered code review with security analysis, best practices, and style suggestions.", category: "coding", tags: ["code-review", "security", "typescript"], currentVersion: "1.2.0", packageUrl: "packages/code-reviewer-pro/code-reviewer-pro-1.2.0.clawagent", packageSize: 45000, downloads: 128, ratingAvg: "4.50", ratingCount: 12, trustTier: "bronze" as const },
    { slug: "git-commit-wizard", creatorId: creatorIds.alice, name: "Git Commit Wizard", description: "Generates conventional commit messages from staged changes with scope detection.", category: "coding", tags: ["git", "commit", "conventional-commits"], currentVersion: "2.0.1", packageUrl: "packages/git-commit-wizard/git-commit-wizard-2.0.1.clawagent", packageSize: 28000, downloads: 340, ratingAvg: "4.80", ratingCount: 18, trustTier: "bronze" as const },
    { slug: "seo-content-optimizer", creatorId: creatorIds.bob, name: "SEO Content Optimizer", description: "Analyzes and optimizes content for search engines with keyword suggestions.", category: "marketing", tags: ["seo", "content", "optimization"], currentVersion: "1.0.0", packageUrl: "packages/seo-content-optimizer/seo-content-optimizer-1.0.0.clawagent", packageSize: 62000, downloads: 89, ratingAvg: "4.20", ratingCount: 8, trustTier: "new" as const },
    { slug: "devops-deploy-agent", creatorId: creatorIds.bob, name: "DevOps Deploy Agent", description: "Automated deployment pipelines for Docker, K8s, and cloud platforms.", category: "devops", tags: ["docker", "kubernetes", "deployment", "ci-cd"], currentVersion: "0.9.0", packageUrl: "packages/devops-deploy-agent/devops-deploy-agent-0.9.0.clawagent", packageSize: 95000, downloads: 42, ratingAvg: "3.90", ratingCount: 5, trustTier: "new" as const },
    { slug: "meeting-summarizer", creatorId: creatorIds.carol, name: "Meeting Summarizer", description: "Transcribes and summarizes meetings with action items and follow-ups.", category: "assistant", tags: ["meetings", "summary", "productivity"], currentVersion: "1.1.0", packageUrl: "packages/meeting-summarizer/meeting-summarizer-1.1.0.clawagent", packageSize: 38000, downloads: 210, ratingAvg: "4.60", ratingCount: 15, trustTier: "bronze" as const },
    { slug: "copy-crafter", creatorId: creatorIds.carol, name: "Copy Crafter", description: "AI copywriter for landing pages, emails, and ad copy with tone control.", category: "copywriting", tags: ["copywriting", "landing-pages", "email"], currentVersion: "1.0.0", packageUrl: "packages/copy-crafter/copy-crafter-1.0.0.clawagent", packageSize: 41000, downloads: 67, ratingAvg: "4.30", ratingCount: 6, trustTier: "new" as const },
    { slug: "trade-signal-bot", creatorId: creatorIds.alice, name: "Trade Signal Bot", description: "Real-time trading signal analysis and portfolio alerts for crypto markets.", category: "trading", tags: ["trading", "crypto", "signals", "portfolio"], currentVersion: "0.8.0", packageUrl: "packages/trade-signal-bot/trade-signal-bot-0.8.0.clawagent", packageSize: 52000, downloads: 35, ratingAvg: "3.80", ratingCount: 4, trustTier: "new" as const },
    { slug: "social-scheduler", creatorId: creatorIds.bob, name: "Social Scheduler", description: "Schedule and optimize social media posts across platforms with analytics.", category: "social", tags: ["social-media", "scheduling", "analytics"], currentVersion: "1.0.0", packageUrl: "packages/social-scheduler/social-scheduler-1.0.0.clawagent", packageSize: 47000, downloads: 78, ratingAvg: "4.10", ratingCount: 7, trustTier: "new" as const },
  ];
}

/** Build ratings — agentIds keyed by slug, creatorIds for userId */
export function buildRatingData(
  agentIdBySlug: Record<string, string>,
  creatorIds: { alice: string; bob: string; carol: string }
) {
  return [
    { agentId: agentIdBySlug["code-reviewer-pro"], userId: creatorIds.bob, score: 5, review: "Excellent code review agent!" },
    { agentId: agentIdBySlug["code-reviewer-pro"], userId: creatorIds.carol, score: 4, review: "Very thorough analysis." },
    { agentId: agentIdBySlug["git-commit-wizard"], userId: creatorIds.bob, score: 5, review: "Best commit message generator." },
    { agentId: agentIdBySlug["git-commit-wizard"], userId: creatorIds.carol, score: 5, review: "Saves me so much time." },
    { agentId: agentIdBySlug["meeting-summarizer"], userId: creatorIds.alice, score: 5, review: "Perfect for standup prep." },
    { agentId: agentIdBySlug["meeting-summarizer"], userId: creatorIds.bob, score: 4, review: "Great summarization." },
    { agentId: agentIdBySlug["copy-crafter"], userId: creatorIds.alice, score: 4, review: "Good tone control for emails." },
    { agentId: agentIdBySlug["copy-crafter"], userId: creatorIds.bob, score: 5, review: "Saved hours on landing page copy." },
    { agentId: agentIdBySlug["trade-signal-bot"], userId: creatorIds.carol, score: 4, review: "Useful alerts, still early." },
    { agentId: agentIdBySlug["social-scheduler"], userId: creatorIds.alice, score: 4, review: "Scheduling works great." },
    { agentId: agentIdBySlug["social-scheduler"], userId: creatorIds.carol, score: 4, review: "Nice analytics dashboard." },
    { agentId: agentIdBySlug["seo-content-optimizer"], userId: creatorIds.carol, score: 4, review: "Solid keyword suggestions." },
  ];
}
