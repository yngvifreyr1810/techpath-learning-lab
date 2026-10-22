# Requirements and accepted decisions

## Learner

Information Systems background, SQL stronger than Excel/BI, Windows/PC interest, prefers diagnosis and fixing problems. Target: Intern/Fresher Application Support, Data Operations or internal IT Support. Learning is in Vietnamese with technical English; Japanese is outside scope.

## Accepted scope

- PC and laptop. Dark mode. Web UI.
- Practice in SSMS, not an embedded SQL runner.
- AI only on request; gradual hint, no immediate rewrite/full solution.
- No paid AI API. External SSMS Copilot Free is optional and limited.
- Session duration adapts to 30/60/90/120 minutes or custom 15–240.
- Track independent practice, unfamiliar requirements, error diagnosis and interview preparation.
- Export/import backup first; no cloud sync in v0.1 (explicit learner choice).
- Source on a new GitHub repository. Personal progress remains outside source.
- User experiences app and requests iterations; no coding lessons required to operate it.

## Product decisions

- Start recommendation: SupportLab stored procedure; do not mark it completed.
- Earlier chat exercises tagged practiced; mastery is not inferred from screenshots.
- Progressive authored hints plus review-context export to external AI, explicitly labeled.
- Review context contains lesson/task, user code/error/question and a small-hint tutoring instruction.
- No invented AI responses or “query optimized” claims.
- Notes/drafts survive navigation and reload. Import validates schema, previews counts, requires backup before replacing local data.
- Import/export concerns isolated from GitHub publishing. Repo is for source, JSON for personal learning state.
- Dataset setup is non-destructive and stops on pre-existing lab tables.
- References and solutions are authored examples; SQL execution remains in SSMS.

## Future candidates (not promises)

Automatic private sync, saved-file SSMS bridge, structured feedback import, more realistic unseen datasets and branching diagnostics. Any AI integration needs an explicit cost and context-access design.
