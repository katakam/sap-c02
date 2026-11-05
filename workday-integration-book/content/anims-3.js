(function(){
var A=BOOK.A;

A({id:"a-payroll-objects",title:"What payroll needs from Workday",sum:"The data groups a payroll feed usually carries. 'Payroll business objects' is not an official Workday list.",part:"py",tags:"payroll business objects data sections worker position compensation",
nodes:[["hub","Payroll feed","what payroll needs","indigo",90,12,180,46],
["w","Worker and IDs","name, Employee ID","teal",15,76,155,48],["s","Status and dates","hire, leave, termination","teal",190,76,155,48],
["pos","Position / job","one block per job","teal",15,136,155,48],["pg","Pay group and period","schedule, status","teal",190,136,155,48],
["c","Compensation","salary, plans","amber",15,196,155,48],["ed","Earnings, deductions","codes","amber",190,196,155,48],
["pe","Payment elections","bank details","coral",15,256,155,48],["tax","Tax data","Canada and US only in PI","gray",190,256,155,48],
["lv","Leave, time off","absence types","teal",15,316,155,48],["ca","Cost allocation","split by cost center","gray",190,316,155,48]],
edges:[],
steps:[
{t:"Start with a hub",p:"Payroll needs a set of data groups. People call them 'payroll business objects', but Workday has no official list.",k:"Use the data sections of the Payroll Interface plus the setup objects.",on:["hub"]},
{t:"Who",p:"Who is the worker? Name, Employee ID, identifiers.",k:"Personal Data and Identifiers sections.",on:["w","s"]},
{t:"Where in the company",p:"The job or position, and the pay group with its period schedule. Two jobs mean two position blocks.",k:"Position Data section; pay group; period schedule.",on:["pos","pg"]},
{t:"What to pay",p:"Salary and plans, plus earnings and deductions with their codes.",k:"Compensation Data; Earnings and Deductions.",on:["c","ed"]},
{t:"How to pay",p:"Bank details. Very sensitive: encrypt and limit.",k:"Payment Elections.",on:["pe"],chip:["pe","private",true]},
{t:"Taxes",p:"The Payroll Interface has tax sections only for Canada and the US. Singapore tax and CPF are not in the Workday guides we checked.",k:"Ask your payroll team for Singapore rules.",on:["tax"]},
{t:"Time away and cost",p:"Leave and time off change pay. Cost allocation sends cost to the right cost centers.",k:"Leave of Absence, Paid Time Off, Cost Allocations.",on:["lv","ca"]},
{t:"Setup objects",p:"Behind the feed sit setup items: payroll company, pay group, period schedule, run category, external earnings and deductions.",k:"These must exist before data flows.",on:["pg","ed"]}
]});

A({id:"a-backdated",title:"A back-dated change and retro pay",sum:"A change entered late with an old effective date changes pay for an earlier period.",part:"py",tags:"retro back-dated entry effective payroll",
nodes:[["oct","October pay run","paid on 28 Oct","gray",110,16,140,50],["chg","Change entered 3 Nov","effective 1 Oct","coral",110,96,140,56],["det","Integration detects","by entry date","amber",110,186,140,50],["file","File to vendor","change + old effective date","indigo",110,266,140,56],["ret","November pay","includes retro","teal",110,356,140,50]],
edges:[["e1","oct","chg"],["e2","chg","det"],["e3","det","file"],["e4","file","ret"]],
steps:[
{t:"October is already paid",p:"Payroll ran on 28 October with the old salary.",k:"Period status: Complete.",d:"Old salary 5000",on:["oct"]},
{t:"Someone enters a late change",p:"On 3 Nov HR enters a pay rise effective 1 Oct.",k:"Back-dated: effective date earlier than entry date.",d:"New salary 5500\nEffective 2026-10-01\nEntered 2026-11-03",on:["chg"],ed:["e1"]},
{t:"The integration must notice",p:"A feed based only on effective date would miss it. Use the entry date.",k:"Last Successful Run Date vs event entry date.",on:["det"],ed:["e2"]},
{t:"The file carries both dates",p:"The vendor needs the new value and the old effective date.",k:"PECI keeps each change in order with its dates.",on:["file"],ed:["e3"]},
{t:"Payroll calculates the difference",p:"November pay includes 500 for October. That is retro pay.",k:"Retro calculation is done by payroll.",d:"Difference 500",on:["ret"],ed:["e4"]},
{t:"What you do",p:"Check the file has the change. Tell payroll. Keep evidence. Do not re-run a primary run casually.",k:"Re-run can move the marker.",on:["file","ret"]}
]});

A({id:"a-security",title:"Access for an integration",sum:"The integration user belongs to a security group; the group has permissions on domains; changes must be activated.",part:"sc",tags:"isu issg domain get put activate security",
nodes:[["isu","ISU","integration user, no UI sign-in","teal",110,16,140,56],["sg","ISSG","security group","amber",110,100,140,50],["dom","Domain permissions","View, Modify, Get, Put","indigo",110,180,140,56],["act","Activate pending changes","makes it live","coral",110,266,140,50],["run","Integration runs","can read what it needs","gray",110,346,140,46]],
edges:[["e1","isu","sg"],["e2","sg","dom"],["e3","dom","act"],["e4","act","run"]],
steps:[
{t:"Create the ISU",p:"A special user for one integration. No browser sign-in. Session timeout 0 so long jobs do not expire.",k:"Create Integration System User; Do Not Allow UI Sessions.",on:["isu"]},
{t:"Put it in a group",p:"Give permissions to a group, then add the user to the group.",k:"Integration System Security Group (constrained or unconstrained).",on:["isu","sg"],ed:["e1"]},
{t:"Give permissions on domains",p:"Grant only what is needed. SOAP uses Get and Put. REST and reports use View and Modify.",k:"Maintain Permissions for Security Group.",on:["sg","dom"],ed:["e2"]},
{t:"Activate",p:"Edits stay pending until someone runs Activate Pending Security Policy Changes.",k:"Forgetting this gives 403 or blank fields.",on:["dom","act"],ed:["e3"]},
{t:"Run and verify",p:"Run the integration. If a column is empty, check field access.",k:"Calculated fields return blank when access is missing.",on:["act","run"],ed:["e4"]},
{t:"Good habits",p:"One ISU per integration or vendor. Least access. Password exemption if needed. Keep a record.",k:"Least privilege.",on:["isu","sg"]}
]});

A({id:"a-lifecycle",title:"Project life cycle",sum:"From requirement to support, with the proof you keep at each step.",part:"dl",tags:"project requirement build test uat go-live support",
nodes:[["r","1 Requirement","what and why","teal",15,16,150,48],["d","2 Design / spec","mapping, schedule","teal",195,16,150,48],["b","3 Build","report, connector","teal",15,90,150,48],["u","4 Unit test","your checks","amber",195,90,150,48],["s","5 SIT","systems together","amber",15,164,150,48],["a","6 UAT","business approves","amber",195,164,150,48],["g","7 Go-live","deploy, watch","coral",15,238,150,48],["h","8 Support","hypercare, handover","indigo",195,238,150,48]],
edges:[["e1","r","d"],["e2","d","b",{from:"b",to:"t"}],["e3","b","u"],["e4","u","s",{from:"b",to:"t"}],["e5","s","a"],["e6","a","g",{from:"b",to:"t"}],["e7","g","h"]],
steps:[
{t:"Requirement",p:"Ask who, what, when, where, why. Write it down.",k:"Business and technical requirement.",d:"Evidence: signed requirement",on:["r"]},
{t:"Design",p:"Write the spec and the mapping. Get sign-off.",k:"Functional and technical spec.",d:"Evidence: spec, mapping",on:["d"],ed:["e1"]},
{t:"Build",p:"Build in a non-production tenant. Keep changes small.",k:"Version your files.",on:["b"],ed:["e2"]},
{t:"Unit test",p:"Check counts and samples yourself, including edge cases.",k:"Edge cases: two jobs, back-dated, special characters.",d:"Evidence: test results",on:["u"],ed:["e3"]},
{t:"SIT",p:"Test the full flow with the other system.",k:"System integration test.",on:["s"],ed:["e4"]},
{t:"UAT",p:"The business tests and approves.",k:"User acceptance test; sign-off.",d:"Evidence: signed UAT",on:["a"],ed:["e5"]},
{t:"Go-live",p:"Deploy through the change process. Have a rollback plan.",k:"Change request, go/no-go.",on:["g"],ed:["e6"]},
{t:"Support",p:"Hypercare, then hand over with a runbook.",k:"Handover, KT, RCA when needed.",on:["h"],ed:["e7"]}
]});

A({id:"a-environments",title:"Environments (tenants)",sum:"Build and test in non-production tenants, then promote to Production. Names and counts depend on your company.",part:"dl",tags:"tenant environment sandbox implementation production preview",
nodes:[["sb","Sandbox","build and test","teal",15,16,150,50],["im","Implementation","project work","teal",195,16,150,50],["pv","Preview","next release early","gray",15,106,150,50],["pr","Production","live data","coral",195,106,150,50],["mig","Move configuration","Object Transporter","amber",85,196,190,50],["chk","Remember","IDs, endpoints, keys differ","gray",50,280,260,50,{dash:1}]],
edges:[["e1","sb","mig",{from:"b",to:"t"}],["e2","im","mig",{from:"b",to:"t"}],["e3","mig","pr",{from:"r",to:"b"}]],
steps:[
{t:"Different copies",p:"A company has more than one Workday tenant. Production is the live one.",k:"The guides name Production, Implementation, Sandbox, Sandbox Preview and Implementation Preview. Which you have depends on the contract.",on:["sb","im","pv","pr"]},
{t:"Build away from live data",p:"Build and test in a non-production tenant. Production data is live and private.",k:"Run every EIB upload in a sandbox first.",on:["sb","im"]},
{t:"Preview for releases",p:"A preview tenant gets the next Workday release early, so you can retest.",k:"Twice-yearly releases.",on:["pv"]},
{t:"Move configuration",p:"Tools move set-up from one tenant to another. They do not move transactional data.",k:"Object Transporter; ISUs and security groups first; PGP private keys cannot move.",on:["mig","pr"],ed:["e1","e2","e3"]},
{t:"Things that differ",p:"WIDs differ by tenant. Endpoints and transports differ. Notifications can reach real users from test tenants.",k:"Use reference IDs; set transport 'Restricted To' environment.",on:["chk"]},
{t:"Always check where you are",p:"Look at the tenant name and URL before every action.",k:"Label your browser tabs.",on:["pr"],chip:["pr","live!",true]}
]});

A({id:"a-troubleshoot",title:"Where did it break?",sum:"Follow the chain: ran, created, delivered, loaded, correct.",part:"dl",tags:"troubleshoot incident playbook log",
nodes:[["a","1 Did it run?","schedule, event exists","teal",110,16,140,48],["b","2 Was a file made?","count, size, name","teal",110,86,140,48],["c","3 Was it delivered?","delivery status, folder","teal",110,156,140,48],["d","4 Did the receiver load it?","their log, count","teal",110,226,140,48],["e","5 Is the data right?","sample, compare","teal",110,296,140,48],["x","Collect evidence","times, names, screenshots (masked)","coral",110,366,140,52]],
edges:[["e1","a","b"],["e2","b","c"],["e3","c","d"],["e4","d","e"],["e5","e","x"]],
steps:[
{t:"1. Did it run?",p:"Look for an integration event at the expected time. No event means a schedule or launch problem.",k:"Integration Events, Process Monitor.",on:["a"]},
{t:"2. Was a file made?",p:"Check the file exists, with the right name, size and row count.",k:"Empty file: filters, eligibility, delta marker.",on:["b"],ed:["e1"]},
{t:"3. Was it delivered?",p:"Completed does not prove delivered. Check the delivery step and the folder.",k:"Deliver Document status; re-deliver possible for a limited time.",on:["c"],ed:["e2"]},
{t:"4. Did the receiver load it?",p:"Ask the vendor for their log and row count. Compare with yours.",k:"Format, encoding, trailer count.",on:["d"],ed:["e3"]},
{t:"5. Is the data right?",p:"Compare samples. Check dates, time zones, mappings, multiple jobs.",k:"Reconcile.",on:["e"],ed:["e4"]},
{t:"Write it down",p:"Keep times, IDs, counts and logs. Then use the Playbooks tab for the exact symptom.",k:"Evidence helps RCA.",on:["x"],ed:["e5"]}
]});
A({id:"a-positions",title:"How to get all positions from staffing events",sum:"Staffing events build the worker history. Each worker can have several jobs. Pick one route and make one row per job.",part:"hr",tags:"positions jobs staffing events history multiple jobs how to report get_workers connector",
nodes:[["ev","Staffing events","Hire, Change Job, Transfer","teal",110,16,140,50],["hist","Worker history","every event has two dates","teal",110,96,140,50],["jobs","Jobs of one worker","primary + additional","amber",110,176,140,50],["rep","Route 1: Report","one row per job","indigo",15,266,100,60],["ws","Route 2: Web service","Get_Workers","indigo",130,266,100,60],["cc","Route 3: Connector","Include Multiple Positions","indigo",245,266,100,60],["out","Your list or file","check: rows = jobs","gray",110,366,140,50]],
edges:[["e1","ev","hist"],["e2","hist","jobs"],["e3","jobs","rep",{from:"b",to:"t"}],["e4","jobs","ws",{from:"b",to:"t"}],["e5","jobs","cc",{from:"b",to:"t"}],["e6","rep","out",{from:"b",to:"t"}],["e7","ws","out",{from:"b",to:"t"}],["e8","cc","out",{from:"b",to:"t"}]],
steps:[
{t:"What is a staffing event?",p:"A staffing event is a change to a worker, such as Hire or Change Job. Workday saves each one.",k:"Each is a business process.",d:"Hire\nChange Job\nTransfer",on:["ev"],vis:["ev"]},
{t:"Events make the history",p:"All the events together are the worker history. Each event has two dates: when it counts, and when it was typed.",k:"Effective date and entry moment.",d:"2024-01-15 Hire\n2025-07-01 Change Job",on:["hist"],ed:["e1"],vis:["ev","hist"]},
{t:"A worker can have many jobs",p:"One worker can hold more than one job. One is primary. The others are additional.",k:"Positions.",d:"E9001\n Job 1: Data Analyst (primary)\n Job 2: Trainer",on:["jobs"],ed:["e2"],vis:["ev","hist","jobs"]},
{t:"Pick one route",p:"Route 1 is a report. Route 2 is a web service call. Route 3 is a Core Connector. All three can give every job.",k:"Report needs fields for all positions. Check them in Business Object Details.",on:["rep","ws","cc"],ed:["e3","e4","e5"]},
{t:"Watch the trap",p:"Most worker reports show only the primary job. If you do nothing, the other jobs are missing.",k:"Connector needs Include Multiple Positions (version 25 and above).",d:"Row: E9001, Data Analyst\n(Trainer is missing)",on:["jobs"],chip:["jobs","job 2 missing",true]},
{t:"Make one row per job",p:"Write one row for each job. A worker with two jobs gives two rows.",k:"Row key: worker ID plus position ID.",d:"E9001, Data Analyst, primary\nE9001, Trainer, additional",on:["out"],ed:["e6","e7","e8"]},
{t:"Check it",p:"Count the rows. They must equal the number of jobs, not the number of workers. Test with a worker who has two jobs.",k:"Also test back-dated and ended jobs.",on:["out"]}
]});
})();
