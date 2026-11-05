(function(){
var A=BOOK.A,P=BOOK.PB,Q=BOOK.Q;

A({id:"a-encrypt",title:"Encrypt, send, decrypt",sum:"The sender locks the file with the receiver's public key. Only the receiver's private key unlocks it.",part:"sc",tags:"encryption decryption pgp public private key sign verify file transfer",
nodes:[["pf","Plain file","payroll.csv","teal",15,16,150,50],["pub","Receiver's public key","from the vendor","amber",195,16,150,50],["enc","Encrypt","lock the file","indigo",15,100,150,50],["ef","Locked file","payroll.csv.pgp","gray",195,170,150,50],["sh","Shared storage","SFTP folder","indigo",105,254,150,50],["dec","Decrypt","with private key + passphrase","indigo",15,338,150,56],["priv","Receiver's private key","never shared","coral",195,338,150,56],["out","Plain file again","check hash and counts","teal",105,428,150,50]],
edges:[["e1","pf","enc",{from:"b",to:"t"}],["e2","pub","enc",{from:"b",to:"r"}],["e3","enc","ef",{from:"r",to:"l"}],["e4","ef","sh",{from:"b",to:"r"}],["e5","sh","dec",{from:"b",to:"t"}],["e6","priv","dec",{from:"l",to:"r"}],["e7","dec","out",{from:"b",to:"l"}]],
steps:[
{t:"Start with a plain file",p:"The file has real data. Anyone can read it. Do not leave it in a shared folder.",k:"Plain text.",d:"E9001|Priya|5500",on:["pf"]},
{t:"Get the receiver's public key",p:"The vendor sends their public key. It is safe to share. Check its fingerprint on a call.",k:"Public key, fingerprint.",on:["pub"],ed:["e2"]},
{t:"Encrypt",p:"The file is locked with the receiver's public key.",k:"PGP encrypt.",d:"payroll.csv  ->  payroll.csv.pgp",on:["pf","pub","enc"],ed:["e1","e2"]},
{t:"The locked file looks like noise",p:"If someone steals it, they cannot read it.",k:"Ciphertext.",d:"hQEMA9... (unreadable)",on:["enc","ef"],ed:["e3"]},
{t:"Drop it in shared storage",p:"Move the locked file by SFTP. SFTP also encrypts the connection. That is two protections.",k:"Encryption at rest and in transit.",on:["ef","sh"],ed:["e4"]},
{t:"The receiver decrypts",p:"Only the receiver's private key can unlock it. The private key has a passphrase.",k:"PGP decrypt.",on:["sh","dec","priv"],ed:["e5","e6"]},
{t:"Check it",p:"Compare the row count or hash of the plain file with the original. If decryption fails: wrong key, expired key or damaged file.",k:"Hash, trailer count.",d:"SHA-256 matches\nRows: 5,000",on:["dec","out"],ed:["e7"]}
]});

A({id:"a-ticket",title:"A support ticket from start to RCA",sum:"How a problem moves from first report to root cause and prevention.",part:"dl",tags:"ticket incident triage escalate resolve close rca sla priority support",
nodes:[["n","1 Raised","user reports a problem","teal",15,16,150,50],["t","2 Triage","impact and urgency, priority","amber",195,16,150,50],["a","3 Assigned","L1, L2 or L3","teal",15,100,150,50],["w","4 Working","checks, logs, evidence","indigo",195,100,150,50],["e","5 Escalate?","if SLA at risk or stuck","coral",15,184,150,50,{dash:1}],["r","6 Resolved","fix applied, tested","teal",195,184,150,50],["c","7 Closed","user confirms","gray",15,268,150,50],["rca","8 RCA","timeline, cause, prevention","amber",195,268,150,50]],
edges:[["e1","n","t"],["e2","t","a",{from:"b",to:"t"}],["e3","a","w"],["e4","w","e",{from:"b",to:"t"}],["e5","e","r"],["e6","r","c",{from:"b",to:"t"}],["e7","c","rca"]],
steps:[
{t:"Raised",p:"A user or an alert creates a ticket. Write a clear title and the first facts.",k:"Incident record, e.g. INC0012345.",d:"Title: Payroll file missing 5 Nov run\nTime: 02:10 SGT",on:["n"]},
{t:"Triage",p:"Ask: how many are affected, and how soon must it be fixed? This sets the priority.",k:"Impact + urgency = P1, P2 or P3.",d:"Impact: 40 workers\nUrgency: pay day today\nPriority: P1",on:["t"],ed:["e1"]},
{t:"Assigned",p:"The ticket goes to the right level: L1 first contact, L2 deeper checks, L3 builders and experts.",k:"Escalation matrix.",on:["a"],ed:["e2"]},
{t:"Working",p:"Follow the playbook: safe checks first. Write each action in the ticket.",k:"First response time, then resolution time.",on:["w"],ed:["e3"]},
{t:"Escalate if needed",p:"If you are stuck or the SLA is at risk, pass it on with the facts and what you tried.",k:"Functional or hierarchical escalation.",on:["e"],ed:["e4"]},
{t:"Resolved",p:"The fix is applied and tested. Say what you changed and what you checked.",k:"Resolved is not closed.",on:["r"],ed:["e5"]},
{t:"Closed",p:"Close only after the user confirms. Reopen if it comes back.",k:"Resolved vs closed.",on:["c"],ed:["e6"]},
{t:"RCA",p:"For serious or repeated problems, write the RCA: timeline, impact, root cause, fix and prevention with owner and date.",k:"5 Whys, blameless post-mortem, CAPA.",on:["rca"],ed:["e7"]}
]});

P({area:"Run problems",title:"PGP decrypt or encrypt fails",sym:"A file cannot be decrypted by the receiver, or encryption fails on our side.",
may:["Wrong key used","Key expired or revoked","Passphrase wrong or missing","File damaged or cut during transfer","Armored vs binary mismatch","Signature check fails because the sender key is missing"],
check:["Check the file name and extension (.pgp, .gpg, .asc).","Check the file size is the same on both sides, or compare the hash.","Check the key expiry date on the receiver's side and ours.","Check which key was used: the receiver's public key to encrypt, the receiver's private key to decrypt.","Ask the receiver to try decrypting a tiny test file.","Check whether the transfer used binary mode.","Check the key was loaded in the right environment (test vs production)."],
evid:["Error text","Key fingerprint (not the key)","File size and hash"],who:"Vendor security or IT contact; your security administrator for keys.",dont:"Never send a private key or passphrase in chat or email.",tags:"pgp encryption decrypt key expired"});

P({area:"Run problems",title:"Hash or row count does not match after transfer",sym:"The file arrived but its size, hash or trailer count differs from what was sent.",
may:["File cut during transfer","Text mode changed line endings","Encoding changed","Wrong file picked up","A second run overwrote the file"],
check:["Compare size and hash on both sides.","Compare line endings and encoding.","Check the transfer mode (binary).","Check file names and times for a second run.","Resend a small test file and compare again."],
evid:["Size and hash on both sides","Times of runs"],who:"Vendor contact.",dont:"Do not edit the file by hand to make counts match.",tags:"hash checksum count mismatch transfer"});

Q({part:"sc",q:"Which key does the SENDER use to encrypt a PGP file?",o:["Sender's private key","Receiver's public key","Receiver's private key","Nothing"],a:1,w:"Lock with the receiver's public key. Only the receiver's private key can unlock it."});
Q({part:"sc",q:"Is Base64 encryption?",o:["Yes, it hides data","No, it only changes the shape","Only with a password","Only on SFTP"],a:1,w:"Base64 is encoding. Anyone can reverse it."});
Q({part:"sc",q:"What is a hash used for?",o:["To lock a file","To prove a file did not change","To rename a file","To compress a file"],a:1,w:"A hash is a one-way fingerprint. If the file changes, the hash changes."});
Q({part:"dl",q:"What is the difference between Resolved and Closed?",o:["None","Resolved: fixed. Closed: user confirmed.","Closed comes first","Resolved means cancelled"],a:1,w:"Close only after the user confirms."});
Q({part:"dl",q:"What does an RCA need?",o:["Only the fix","Timeline, impact, root cause, fix and prevention","Only a name to blame","A new ticket"],a:1,w:"Write facts and prevention, not blame."});
Q({part:"dl",q:"How is priority decided?",o:["By who shouts loudest","By impact and urgency","By ticket number","By time of day"],a:1,w:"Impact and urgency set P1, P2 or P3."});
})();
