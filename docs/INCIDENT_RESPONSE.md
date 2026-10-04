# Incident response

Scope: Wills informational website on Railway. Commerce stays closed. The company
must assign a named on-call owner and alert destination before public launch.

1. Detect: verify uptime alerts against /api/health and inspect Railway metrics and
   structured security events. Correlate event type, status and request ID. Do not
   copy secret environment values or customer messages into reports.
2. Contain: keep both commerce flags false. For abusive traffic, apply the verified
   edge/WAF emergency rule. If compromise is suspected, restrict ingress or roll
   back to the last verified deployment. Preserve bounded logs with timestamps.
3. Eradicate: identify the affected release and entry point. Patch and rerun the
   dependency, secret, SAST, API and browser checks. Rotate any affected platform,
   storage, payment or admin credentials through their account consoles. Never
   rotate encryption keys without a data re-encryption and recovery plan.
4. Recover: deploy the reviewed fixed artifact. Verify health, headers, closed API
   guards, routes and browser interactions. Test alert delivery before restoring
   normal access. Revoke former compromised credentials and verify they fail.
5. Notify: the business owner coordinates customer/provider notices and obtains
   legal advice about applicable notification obligations. Document facts and
   uncertainty without exposing personal information.
6. Review: record timeline, root cause, impact, containment and preventive actions.
   Assign owners and dates. Verify the corrective controls against the incident.

Rollback drill: record the current Railway deployment ID, redeploy a previously
verified artifact, verify health and headers, then return to the reviewed current
artifact. Do not claim the drill passed until this has actually been exercised.

The active site has no application database. Before enabling commerce, add an
encrypted backup policy, perform a restore into an isolated environment and verify
integrity before applying any production schema change.
