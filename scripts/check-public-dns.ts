const DOMAIN = 'thewworksict.com';
const EXPECTED_ORIGIN = `https://${DOMAIN}`;

interface GoogleDnsResponse {
  Status: number;
  Answer?: Array<{ name: string; type: number; TTL: number; data: string }>;
  Authority?: Array<{ name: string; type: number; TTL: number; data: string }>;
  Comment?: string;
}

async function fetchJson<T>(url: string): Promise<{ status: number; body: T | null; text: string }> {
  const response = await fetch(url, {
    headers: { accept: 'application/json, application/rdap+json' },
  });
  const text = await response.text();

  try {
    return { status: response.status, body: JSON.parse(text) as T, text };
  } catch {
    return { status: response.status, body: null, text };
  }
}

async function queryDns(type: string) {
  const url = `https://dns.google/resolve?name=${encodeURIComponent(DOMAIN)}&type=${type}`;
  const { body } = await fetchJson<GoogleDnsResponse>(url);
  return body;
}

async function checkDomainRegistration() {
  const rdapUrl = `https://rdap.verisign.com/com/v1/domain/${DOMAIN}`;
  return fetchJson<Record<string, unknown>>(rdapUrl);
}

async function checkHttps() {
  try {
    const response = await fetch(EXPECTED_ORIGIN, {
      method: 'HEAD',
      redirect: 'manual',
    });

    return {
      ok: response.ok,
      status: response.status,
      location: response.headers.get('location') || '',
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      location: '',
      error: error instanceof Error ? error.message : 'HTTPS request failed',
    };
  }
}

function summarizeDns(label: string, response: GoogleDnsResponse | null) {
  if (!response) {
    console.log(`${label}: no response`);
    return false;
  }

  if (response.Status === 3) {
    console.log(`${label}: NXDOMAIN`);
    return false;
  }

  if (!response.Answer?.length) {
    console.log(`${label}: no answer (status ${response.Status})`);
    return false;
  }

  console.log(`${label}:`);
  for (const answer of response.Answer) {
    console.log(`  ${answer.data} (TTL ${answer.TTL})`);
  }
  return true;
}

async function main() {
  console.log(`Checking public DNS for ${DOMAIN}`);

  const [registration, ns, a, aaaa, cname, https] = await Promise.all([
    checkDomainRegistration(),
    queryDns('NS'),
    queryDns('A'),
    queryDns('AAAA'),
    queryDns('CNAME'),
    checkHttps(),
  ]);

  const isRegistered = registration.status !== 404;
  console.log(`Registry: ${isRegistered ? `registered (RDAP ${registration.status})` : 'not registered (RDAP 404)'}`);

  const hasNs = summarizeDns('NS', ns);
  const hasAddress = summarizeDns('A', a) || summarizeDns('AAAA', aaaa);
  summarizeDns('CNAME', cname);

  if (https.ok) {
    console.log(`HTTPS: ${https.status}`);
  } else {
    console.log(`HTTPS: unavailable${https.status ? ` (status ${https.status})` : ''}${https.error ? ` - ${https.error}` : ''}`);
  }

  if (!isRegistered) {
    throw new Error(
      [
        `${DOMAIN} is not registered. DNS cannot be fixed until the domain is purchased/registered.`,
        'After registration, attach the domain in Railway and add the DNS records Railway returns.',
      ].join('\n'),
    );
  }

  if (!hasNs || !hasAddress || !https.ok) {
    throw new Error(
      [
        `${DOMAIN} is registered but not fully live.`,
        'Attach the apex and www domains in Railway, add the returned registrar DNS records, then rerun this script.',
      ].join('\n'),
    );
  }

  console.log(`${EXPECTED_ORIGIN} is DNS-resolvable and reachable.`);
}

await main();
