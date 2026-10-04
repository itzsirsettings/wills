# Website information pages

- `/privacy-policy`: project-brief handling, browser preferences, infrastructure requests and contact information.
- `/terms-of-use`: informational website use and the need to agree project-specific specifications and arrangements.
- `/cookie-policy`: the dismissal cookie, persistent local-storage preference and browser controls.
- `/security`: privacy requests and private security reporting.

The footer, privacy notice and project brief link to these pages. Cookie settings remains a button that immediately reopens the notice. The automatic notice waits ten seconds after the document load event, skips visitors with an existing dismissal, and cleans up its timer on unmount. No optional tracking is enabled by delaying the notice.

**Decision:** Keep these pages within the existing React Router application and serve route-specific metadata through the Railway Express server.

**Alternatives:** Homepage sections or a separate documentation site.

**Rationale:** Dedicated URLs support direct access and sharing while retaining the existing design and deployment. Copy describes current website behaviour and does not introduce refund periods, warranties, response deadlines or project contracts.

**Revisit when:** Checkout, analytics, account registration or the way enquiries are collected changes, or the business supplies approved project terms.
