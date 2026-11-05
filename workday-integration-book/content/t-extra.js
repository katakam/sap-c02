(function(){
var E=BOOK.E;
function S(t,m,x,f,lv,k,tags,aka){return E("sc",t,m,x,f,lv||2,k||"g",tags,aka)}
function D(t,m,x,f,lv,k,tags,aka){return E("dl",t,m,x,f,lv||1,k||"g",tags,aka)}
function F(t,m,x,f,lv,k,tags,aka){return E("fm",t,m,x,f,lv||2,k||"g",tags,aka)}

/* ---------- encryption, decryption, keys ---------- */
S("Encryption","Locking data so only the right key can read it.","payroll.csv becomes payroll.csv.pgp.","Do it before the file leaves Workday. Say who holds which key.",1,"g","encryption security").D(["Plain file in, locked file out.","Without the right key the locked file looks like noise.","Use it for files with pay, bank or ID data."]);
S("Decryption","Unlocking an encrypted file to read it again.","payroll.csv.pgp becomes payroll.csv.","If decryption fails, suspect the wrong key, a key that expired, or a damaged file.",1,"g","encryption security");
S("Plain text (cleartext)","Data that anyone can read.","payroll.csv before encryption.","Never leave sensitive plain files in shared folders.",1,"g","encryption");
S("Ciphertext","The locked, unreadable form of the data.","The contents of a .pgp file.","If you can read it, it is not encrypted.",2,"g","encryption");
S("Symmetric encryption","One secret key locks and unlocks.","AES.","Fast. The hard part is sharing the key safely.",2,"g","encryption");
S("Asymmetric encryption","Two keys: a public key locks, a private key unlocks.","RSA, PGP.","You can share the public key freely. Never share the private key.",2,"g","encryption");
S("AES","A common, strong symmetric method.","AES-256.","You will see it in vendor specs.",3,"g","encryption");
S("RSA","A common asymmetric method.","RSA 2048 or 4096.","Key size affects strength and speed.",3,"g","encryption");
S("PGP / GPG","A way to encrypt and sign files using public and private keys. GPG is the free version.","payroll.csv.pgp","Sender locks with the receiver's public key. Receiver unlocks with their private key.",1,"g","encryption pgp","GnuPG,OpenPGP").D(["Encrypt: use the receiver's public key.","Decrypt: use your own private key (and its passphrase).","Sign: use your private key, so the receiver can check it came from you.","Verify: use the sender's public key.","In Workday there are tasks for PGP keys, such as Create a PGP Public Key. Ask your lead which key is used in which direction."]);
S("Key pair","A matching public key and private key.","pubkey.asc and secret key.","Generate it once, store the private part safely, share the public part.",1,"g","encryption");
S("Public key","The key you can hand out.","pubkey.asc","The vendor sends you theirs. You send them yours.",1,"g","encryption");
S("Private key","The secret key. It must never leave its owner.","secret.key","If it leaks, replace the key pair and tell security.",1,"g","encryption");
S("Passphrase","A password that protects a private key.","A long phrase.","Store it in a password manager. Do not email it.",1,"g","encryption");
S("Key fingerprint","A short code that identifies a key. Used to check you have the right one.","A1B2 C3D4 ...","Ask the vendor to read their fingerprint on a call.",2,"g","encryption");
S("Key rotation","Replacing a key with a new one on a plan.","New PGP key every 2 years.","Put the date in your calendar and tell the vendor early.",2,"g","encryption");
S("Key expiry date","The date a key stops working.","Expires 31 Dec 2026.","An expired key is a top cause of overnight failures. Note the date.",1,"g","encryption");
S("Key revocation","Cancelling a key before its expiry because it is unsafe.","Private key leaked.","Do it fast and tell the other side.",3,"g","encryption");
S("Digital signature","Proof that a file came from a certain sender and was not changed.","payroll.csv.sig","Signing is different from encrypting. You can do both.",2,"g","encryption");
S("Hash (checksum)","A short fingerprint of a file's contents. A change in the file changes the hash.","SHA-256: 9f86d0...","Compare hashes before and after sending to prove the file is unchanged.",2,"g","encryption checksum","digest,checksum");
S("MD5 and SHA-256","Two ways to compute a hash. SHA-256 is stronger.","sha256sum payroll.csv","Use SHA-256 for new work.",2,"g","encryption checksum");
S("Encoding vs encryption vs hashing","Encoding changes the shape (Base64). Encryption hides the data with a key. Hashing makes a one-way fingerprint.","Base64 is not secret.","Do not call Base64 'encrypted'.",1,"g","encryption");
S("Salt","Random extra data added before hashing a password.","Stops easy guessing.","You rarely handle it. Good to know the word.",3,"g","encryption");
S("TLS / SSL","The encryption used by HTTPS and other secure connections.","https:// uses TLS.","Old SSL versions are unsafe. Use current TLS.",2,"g","encryption web","SSL,transport layer security");
S("Handshake","The first exchange where two systems agree how to encrypt a connection.","TLS handshake.","'Handshake failed' often means a certificate or TLS version problem.",2,"g","encryption web");
S("Certificate authority (CA)","A trusted body that signs certificates.","A public CA.","If a certificate is not trusted, the CA is missing or the cert is self-signed.",2,"g","encryption certificate","CA");
S("Self-signed certificate","A certificate signed by its owner, not a CA.","A test server.","Fine for tests. Not trusted by default.",2,"g","encryption certificate");
S("Certificate chain","A certificate plus the certificates that vouch for it.","Server cert, intermediate, root.","A missing intermediate causes 'untrusted' errors.",3,"g","encryption certificate");
S("PEM, DER, PPK, PFX","File formats for keys and certificates.","key.pem, cert.der, key.ppk, bundle.pfx","A tool may need a different format. Ask which one.",3,"g","encryption certificate format");
S("Armored file (.asc)","A PGP file written as text instead of binary.","pubkey.asc","Text is easy to paste into email. Binary is smaller.",3,"g","encryption pgp");
S("File extensions: .pgp .gpg .asc .sig","Hints about what a file is.",".pgp encrypted, .asc text key or signature, .sig signature.","Check the extension in the spec.",2,"g","encryption pgp");
S("SSH host key","The server's own key. Your client remembers it to make sure it is the same server.","known_hosts entry.","'Host key changed' means check before connecting.",3,"g","encryption sftp");
S("Mutual TLS (mTLS)","Both sides show certificates to prove who they are.","API with client certificate.","Needs a client certificate from you.",3,"g","encryption certificate");
S("Secrets manager / vault","A safe place for passwords, keys and tokens.","A company vault.","Never keep secrets in files, emails or chat.",2,"g","security encryption","KMS,HSM");
S("JWT","JSON Web Token. A signed token that carries claims about who you are.","eyJhbGci...","Seen with some REST APIs. Do not paste real ones.",3,"g","security token");
S("Tokenization","Replacing a sensitive value with a stand-in token.","Card 4111... becomes tok_9A3.","Reduces what you must protect.",3,"g","security privacy");

/* ---------- common support terms ---------- */
D("Ticket","A record of one request or problem in the support tool.","INC0012345.","Every action goes in the ticket: who, what, when.",1,"g","support ticket","case");
D("Ticket states","The stages a ticket moves through.","New, Assigned, In progress, On hold, Resolved, Closed.","Keep the state true. 'On hold' stops the SLA clock only if the rules say so.",1,"g","support ticket");
D("Triage","Quickly deciding how serious a problem is and who should handle it.","Is payroll affected? P1.","Ask impact and urgency first.",1,"g","support");
D("Impact and urgency","Impact is how many are hurt. Urgency is how soon it must be fixed.","40 workers, pay day today.","Together they give the priority.",1,"g","support");
D("Priority matrix","A table that turns impact and urgency into P1, P2, P3.","High impact + high urgency = P1.","Ask your support team for theirs.",2,"c","support");
D("First response time","How fast someone first answers a ticket.","Within 30 minutes for P1.","Answer early, even if you only say you are looking.",2,"g","support sla");
D("Resolution time","How long to fix a ticket.","4 hours for P1.","Tell the user when you cannot meet it.",2,"g","support sla");
D("SLA breach","Missing the promised time.","P1 not fixed in 4 hours.","Warn early and escalate.",1,"g","support sla");
D("Escalation matrix","A list of who to call next and when.","L2, then L3, then manager.","Know it before an incident.",2,"c","support");
D("Functional vs hierarchical escalation","Functional goes to someone with more skill. Hierarchical goes to someone with more authority.","To the Studio expert / to the manager.","Choose by what you need.",3,"g","support");
D("War room","A call or room used by everyone fixing a serious incident.","P1 bridge.","Keep one lead and one note taker.",2,"g","support");
D("Known error","A problem with a known cause and workaround that is not fixed yet.","Key expires each year.","Look in the known error list before you spend hours.",2,"g","support");
D("Knowledge base article","A short written solution you can reuse.","KB: PGP key renewal steps.","Write one after each new fix.",1,"g","support");
D("Hotfix","A fast fix for a serious problem in Production.","Quick mapping change.","Needs approval and notes like any change.",2,"g","support change");
D("Patch","A small update that fixes a problem.","Release patch.","Test before Production.",2,"g","support change");
D("Break-fix","Support work that repairs what broke.","Fix a failed run.","Different from planned project work.",2,"g","support");
D("Reopened ticket","A ticket that was closed but the problem came back.","Same file missing again.","Look for the real root cause.",2,"g","support ticket");
D("Pending customer / awaiting info","The ticket waits for the user to answer.","Waiting for the vendor's log.","Chase politely and note the date.",2,"g","support ticket");
D("Resolved vs closed","Resolved means fixed. Closed means confirmed and finished.","User confirmed the file arrived.","Ask for confirmation before closing.",1,"g","support ticket");
D("MTTR","Mean time to repair. Average time to fix.","3 hours.","A health number for support.",3,"g","support");
D("MTBF","Mean time between failures.","30 days.","Shows how often things break.",3,"g","support");
D("RCA (root cause analysis)","Finding why an incident happened, not just how it was fixed.","PGP key expired because no one tracked the date.","Write timeline, cause, fix, prevention. No blame.",1,"g","support rca","root cause analysis").D(["Timeline with times and a time zone.","Impact: who and how many.","Root cause: use 5 Whys.","Fix: what you did.","Prevention: what changes so it cannot repeat, with owner and date."]);
D("Fishbone diagram","A drawing of possible causes grouped by area.","People, process, system, data.","Helpful when the cause is not clear.",3,"g","support rca","Ishikawa");
D("CAPA","Corrective and preventive action. Fix now and stop it happening again.","Add key expiry alert.","Track it to completion.",3,"g","support rca");
D("Blameless post-mortem","A review that looks at what failed, not who.","What can we change in the system?","People share facts more when no one is blamed.",2,"g","support rca","post-mortem");
D("SOP","Standard operating procedure. A written routine.","Steps to renew a PGP key.","Follow the SOP; update it when it is wrong.",2,"g","support");
D("Shift handover","What you tell the next shift.","Open tickets, risks, watch items.","Write it down, do not rely on memory.",2,"g","support handover");
D("Ageing ticket","A ticket that stays open too long.","Open for 10 days.","Review and chase them weekly.",2,"g","support");
D("First-time fix","Solved on the first attempt.","Fixed without reopening.","Good checking before closing helps this.",3,"g","support");
D("ITSM tools (ServiceNow, Jira)","Systems that record tickets, changes and approvals.","ServiceNow incident.","Use the tool your company uses. Keep notes there.",1,"c","support tools");
D("RAID log","A log of Risks, Assumptions, Issues and Dependencies.","Risk: vendor late.","Update it weekly.",2,"g","delivery");
D("Change freeze","A period with no changes.","Year-end payroll freeze.","Check the calendar before planning.",2,"c","delivery change");

/* ---------- file formats and layouts ---------- */
F("Record layout (file layout)","A spec of every field in a file: position, length, type, rule.","Name: positions 1 to 30, text.","For fixed-width files you must follow it exactly.",1,"g","format file");
F("Padding and justification","Filling unused space in a field. Left or right justified.","Name padded with spaces to 30.","Numbers often pad with zeros on the left, text with spaces on the right.",2,"g","format file");
F("Zero padding","Adding leading zeros to reach a length.","00123.","Excel can remove them. Check before sending.",2,"g","format");
F("Decimal and thousand separators","The characters in numbers.","1,234.56 vs 1.234,56","Agree the format. A wrong separator changes pay.",2,"g","format");
F("Boolean formats","How yes and no are written.","Y/N, 1/0, true/false.","Ask the receiver which one.",2,"g","format");
F("Enumeration (code list)","A fixed list of allowed values.","F, P, C for full-time, part-time, contract.","Map Workday values to the list.",2,"g","format mapping","code list,enum");
F("TSV","Tab-separated values.","Fields split by tabs.","Names with tabs break it.",2,"g","format file");
F("XLSX","The Excel file format. A zipped bundle of XML.","report.xlsx","Not plain text. Do not open it in a text editor.",2,"g","format file");
F("Control file / ack file / trigger file","A small extra file that says the main file is complete or received.","payroll.ok, payroll.ack","Some vendors only pick up the data file after the trigger file appears.",2,"c","format file");
F("Header, detail, trailer records","The three parts of many flat files: first line, data lines, last line.","H|date, D|data, T|5000","The trailer count must match the detail lines.",2,"g","format file");
F("ASCII vs UTF-8","ASCII covers basic English letters. UTF-8 covers all languages.","Zoë needs UTF-8.","Pick the receiver's encoding.",2,"g","format encoding");
F("Code page","An older way to pick characters, such as Windows-1252.","cp1252","If the vendor is old, they may need it.",3,"g","format encoding");
F("CDATA and XML declaration","CDATA holds raw text inside XML. The declaration is the first line stating version and encoding.","<?xml version=\"1.0\" encoding=\"UTF-8\"?>","A wrong declaration can break parsing.",3,"g","format xml");
F("MIME type / Content-Type","A label that says what kind of data is sent.","application/json, text/csv","A wrong header can give 415 errors.",3,"g","format web");
F("NDJSON","One JSON object per line.","{\"id\":1}\\n{\"id\":2}","Good for big files.",3,"g","format json");
F("Parquet","A compact column-based data file for analytics.","data.parquet","Seen in data platforms, rarely in payroll.",3,"g","format");
F("Schema validation","Checking a file against its schema.","Validate XML against XSD.","Do it before sending.",2,"g","format xml");
F("File size limits","The maximum size a system accepts.","50 MB.","Split or compress big files.",2,"g","format file");
F("Timestamp in file names","Date and time inside a file name.","WORKERS_20261105_0210.csv","Use one time zone and a fixed order.",1,"g","format file naming");
})();
