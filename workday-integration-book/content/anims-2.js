(function(){
var A=BOOK.A;

A({id:"a-two-jobs",title:"One worker, two jobs",sum:"A worker has one primary job and can have additional jobs. Payroll looks at each job.",part:"hr",tags:"multiple jobs primary additional positions concurrent",
nodes:[["p","Person","Priya Test","teal",110,16,140,46],["w","Worker record","E9001","teal",110,96,140,46],["j1","Job 1: primary","Data Analyst, 60%","teal",15,186,150,64],["j2","Job 2: additional","Trainer, 40%","amber",195,186,150,64],["f","Payroll file","one block per job","indigo",110,306,140,60]],
edges:[["e1","p","w"],["e2","w","j1",{from:"b",to:"t"}],["e3","w","j2",{from:"b",to:"t"}],["e4","j1","f",{from:"b",to:"t"}],["e5","j2","f",{from:"b",to:"t"}]],
steps:[
{t:"One person, one worker record",p:"Priya is one person with one worker record and one Employee ID.",k:"The Workday guides call extra jobs 'additional jobs'. They do not use the phrase 'concurrent employment'.",d:"Person: Priya Test\nEmployee ID: E9001",on:["p","w"],ed:["e1"],vis:["p","w"]},
{t:"The first job is primary",p:"Her hire created the first job. That job is the primary job.",k:"First job from Hire is primary.",d:"Job 1: Data Analyst\nPrimary: yes",on:["j1"],ed:["e2"],vis:["p","w","j1"]},
{t:"Add a second job",p:"Later she also becomes a trainer. That is an additional job. You cannot add one before a primary job exists.",k:"Task: Add Additional Jobs (multiple jobs must be switched on in the tenant).",d:"Job 2: Trainer\nPrimary: no",on:["j2"],ed:["e3"],vis:["p","w","j1","j2"]},
{t:"Reports show the primary job",p:"Worker reports show the primary job's data. A one-row-per-worker file hides job 2.",k:"Core Connector: Worker needs Include Multiple Positions to return extra jobs.",d:"Row: E9001, Data Analyst\n(Trainer missing)",on:["w","j1"],chip:["j2","missing",true],vis:["p","w","j1","j2"]},
{t:"Payroll works per job",p:"Payroll data repeats for each job. Worker-level data like name appears once.",k:"Position-level sections repeat; worker-level once.",d:"Worker: E9001 Priya\n Job1: Analyst, 60%\n Job2: Trainer, 40%",on:["j1","j2","f"],ed:["e4","e5"]},
{t:"Ask these questions",p:"Does the vendor support more than one job? One row per worker or per job? What if the primary job changes?",k:"Switch Primary Job can reset in-progress pay results.",on:["f"]}
]});

A({id:"a-worker-history",title:"Worker history and 'as of' dates",sum:"Each change has an effective date and an entry moment. The same question gives different answers at different as-of dates.",part:"hr",tags:"worker history effective date entry moment as of",
nodes:[["e1","Hire","effective 2024-01-15","teal",60,16,240,44],["e2","Promotion","effective 2025-07-01","teal",60,86,240,44],["e3","Pay change","effective 2025-10-01","amber",60,156,240,44],["e4","Late correction","effective 2025-10-01, entered 2026-11-03","coral",60,226,240,56],["e5","Today","2026-11-05","gray",60,308,240,40]],
edges:[["e12","e1","e2"],["e23","e2","e3"],["e34","e3","e4"],["e45","e4","e5"]],
steps:[
{t:"A timeline of events",p:"Workday keeps every change as an event on a timeline.",k:"Worker history.",d:"2024-01-15 Hire\n2025-07-01 Promotion\n2025-10-01 Pay change",on:["e1","e2","e3"],ed:["e12","e23"]},
{t:"Two dates on each event",p:"The effective date is when the change counts. The entry moment is when someone typed it.",k:"Effective date vs entry moment.",d:"Pay change\n Effective: 2025-10-01\n Entered: 2025-09-20",on:["e3"],chip:["e3","two dates"]},
{t:"Ask 'as of' an effective date",p:"As of 2025-08-01 she is a Senior Analyst, before the pay change.",k:"As_Of_Effective_Date.",d:"As of 2025-08-01\nTitle: Senior Analyst\nPay: old",on:["e2"],chip:["e2","as of 2025-08-01"]},
{t:"A late correction arrives",p:"On 3 Nov someone fixes the October pay. Its effective date is old but it was entered recently.",k:"Back-dated change.",d:"Effective: 2025-10-01\nEntered: 2026-11-03",on:["e4"],ed:["e34"],chip:["e4","back-dated",true]},
{t:"Ask 'as of' an entry moment",p:"If you ask what Workday knew on 1 Nov, the correction is not there yet. If you ask now, it is.",k:"As_Of_Entry_DateTime. Set both explicitly in web service requests.",d:"As of entry 2026-11-01: old pay\nAs of entry now: corrected pay",on:["e4","e5"],ed:["e45"],chip:["e5","now"]},
{t:"Why integrations care",p:"A delta based on the effective date alone would miss the correction. Use entry moments, and tell payroll about retro.",k:"Retro pay.",on:["e3","e4"]}
]});

A({id:"a-bp",title:"A business process: hire",sum:"Changes in Workday go through steps with owners and approvals.",part:"hr",tags:"business process initiation approval",
nodes:[["i","1 Initiation","manager starts","teal",110,16,140,46],["a","2 Review","HR checks","teal",110,86,140,46],["ap","3 Approval","approver says yes","amber",110,156,140,46],["c","4 Complete","data becomes effective","teal",110,226,140,46],["int","5 Integration","feed fires","indigo",110,296,140,46]],
edges:[["e1","i","a"],["e2","a","ap"],["e3","ap","c"],["e4","c","int"]],
steps:[
{t:"Someone starts it",p:"The manager or HR starts the hire. Workday saves the data as an event.",k:"Initiation step.",d:"Hire: Sam Test\nOrg: Data Team",on:["i"],vis:["i"]},
{t:"It moves to review",p:"Workday sends the event to the next person as a task.",k:"My Tasks.",d:"Task: Review hire",on:["i","a"],ed:["e1"],vis:["i","a"]},
{t:"Approval",p:"An approver can approve, send back or deny.",k:"Approval step; each step has security.",d:"Approve / Send back / Deny",on:["ap"],ed:["e2"],vis:["i","a","ap"]},
{t:"Complete",p:"When all steps finish, the change becomes part of the worker's history on its effective date.",k:"Business process complete.",d:"Status: Successfully Completed",on:["c"],ed:["e3"],vis:["i","a","ap","c"]},
{t:"Integration step",p:"An integration step can send the data to another system. If it fails, the whole process can fail unless a redirect is set.",k:"Integration Process Event.",d:"Fire integration: Payroll feed",on:["int"],ed:["e4"]},
{t:"If it goes wrong",p:"Cancel stops an in-progress process. Rescind reverses a completed one. Correct edits it in place.",k:"History keeps the event.",on:["c"]}
]});

A({id:"a-core-connector",title:"Core Connector: Worker",sum:"A prebuilt connector finds changed workers and writes the output you configure.",part:"tl",tags:"core connector worker change detection",
nodes:[["src","Workday data","workers","teal",110,16,140,46],["cc","Core Connector: Worker","","gray",15,90,330,176,{cont:1,top:1}],["log","Transaction log","finds workers with events","amber",30,136,140,56],["cmp","Compare","this run vs last good run","amber",190,136,140,56],["fld","Fields and maps","overrides, value maps","indigo",30,206,140,50],["out","Output file","XML or CSV","indigo",190,206,140,50],["dt","Document Transformation","XSLT, optional","gray",90,296,180,50,{dash:1}]],
edges:[["e1","src","cc"],["e2","log","cmp"],["e3","fld","out"]],
steps:[
{t:"The connector reads Workday",p:"It starts from the workers in Workday.",k:"Report fields on the Worker business object.",on:["src"]},
{t:"Find who may have changed",p:"It looks at the transaction log for workers with relevant events.",k:"Subscribe to all transaction types except irrelevant ones.",on:["log"],ed:["e1"]},
{t:"Compare with last time",p:"For those workers it compares values now with values at the last successful run.",k:"Last Successful As Of values; Full File turns this off.",on:["cmp"],ed:["e2"]},
{t:"Apply fields and maps",p:"Field overrides and maps shape the values.",k:"Calculated fields, integration maps.",on:["fld"]},
{t:"Write the file",p:"The connector writes create, change or delete records.",k:"Output is XML. Optionally changed by Document Transformation.",d:"Create E1004\nChange E1001: title\nDelete E0999",on:["out"],ed:["e3"]},
{t:"Optional transformation",p:"An XSLT can turn the XML into the vendor's text format.",k:"Document Transformation.",on:["out","dt"]}
]});

A({id:"a-eib-out",title:"Outbound EIB",sum:"A custom report feeds an EIB that transforms and delivers a file.",part:"tl",tags:"eib outbound custom report sftp",
nodes:[["r","Custom report","web service enabled","teal",110,16,140,56],["eib","EIB","get, transform, deliver","amber",110,106,140,56],["tr","Transform","optional XSLT","indigo",110,196,140,50,{dash:1}],["d","Deliver","SFTP / email / HTTPS","gray",110,276,140,50]],
edges:[["e1","r","eib"],["e2","eib","tr"],["e3","tr","d"]],
steps:[
{t:"Build the report",p:"Copy a standard report to a custom report and tick Enable as Web Service. Never use the standard report directly.",k:"Custom report, Advanced type, current Web Service API Version.",on:["r"]},
{t:"Create the EIB",p:"Choose the report as the data source. EIB uses one data source and all of its fields.",k:"Create EIB > Get Data.",on:["r","eib"],ed:["e1"]},
{t:"Transform",p:"Optionally apply an XSLT or pick an alternate format like CSV.",k:"Alternate formats drop Workday IDs.",on:["tr"],ed:["e2"]},
{t:"Deliver",p:"Choose how to deliver: SFTP, email or others. Email and FTP deliveries need PGP.",k:"Transport protocol set per environment.",on:["d"],ed:["e3"]},
{t:"Launch",p:"Run now or schedule at a non-round time. Check the integration event and the delivery.",k:"Completed does not prove delivered.",on:["eib"]}
]});

A({id:"a-eib-in",title:"Inbound EIB",sum:"A spreadsheet is loaded into Workday through a web service; errors come back.",part:"tl",tags:"eib inbound spreadsheet load",
nodes:[["x","Spreadsheet","filled template","teal",110,16,140,50],["l","EIB load","validate, load","amber",110,96,140,50],["wd","Workday","data changes","teal",110,176,140,50],["er","Errors","skipped rows","coral",110,256,140,50],["fix","Fix and reload","only failed rows","gray",110,332,140,40]],
edges:[["e1","x","l"],["e2","l","wd"],["e3","l","er",{from:"r",to:"r"}],["e4","er","fix"]],
steps:[
{t:"Fill the template",p:"Download the spreadsheet template for the web service. Fill with dummy data first.",k:"Dates YYYY-MM-DD; {empty} deletes a value.",on:["x"]},
{t:"Validate only",p:"Run Validate Only. It checks documented rules. It does not catch every business error.",k:"Validate Only Load.",on:["x","l"],ed:["e1"]},
{t:"Load in Sandbox",p:"Always load in a sandbox before Production.",k:"Sandbox first.",on:["l","wd"],ed:["e2"]},
{t:"Read the errors",p:"Bad rows are skipped. The rest load. Read each message.",k:"Load Error Limit: Unlimited means 10,000.",d:"Row 12: Pay group missing",on:["l","er"],chip:["er","3 rows",true]},
{t:"Fix and reload",p:"Fix only the failed rows. Do not reload the rows that worked.",k:"Avoid duplicates.",on:["er","fix"],ed:["e4"]},
{t:"Undo a bad load",p:"Mass Cancel (in progress) or Mass Rescind (completed). Learn them before you need them.",k:"Business process administrator.",on:["wd"]}
]});

A({id:"a-studio",title:"Workday Studio",sum:"Build on your computer, package as a CLAR file, deploy to the tenant, run in the Workday cloud.",part:"tl",tags:"studio clar assembly deploy",
nodes:[["ide","Studio on your PC","build assemblies","teal",110,16,140,56],["clar","CLAR package","cloud archive","amber",110,106,140,50],["t","Workday tenant","deploy","indigo",110,186,140,50],["run","Run in cloud","limits: 2 hours, 12 GB","gray",110,266,140,50],["ext","External systems","web services, files","teal",110,346,140,46]],
edges:[["e1","ide","clar"],["e2","clar","t"],["e3","t","run"],["e4","run","ext"]],
steps:[
{t:"Why Studio",p:"Use Studio when EIB or a connector cannot do the job: complex logic, many calls, special formats.",k:"Eclipse-based development environment.",on:["ide"]},
{t:"Build",p:"You assemble steps in Studio and test on your computer.",k:"Assemblies and components (not explained in the guides we checked).",on:["ide"]},
{t:"Package",p:"You export a CLAR file.",k:"Keep versions.",on:["ide","clar"],ed:["e1"]},
{t:"Deploy",p:"Load the CLAR into the tenant. Test in Sandbox first.",k:"Cloud Integration Template.",on:["clar","t"],ed:["e2"]},
{t:"Run",p:"It runs in the Workday cloud, with time and size limits.",k:"Studio runtime 2 hours and 12 GB.",on:["t","run"],ed:["e3"]},
{t:"Support it",p:"Keep the source, a runbook and a test set. Few people know Studio, so write things down.",k:"Handover.",on:["run","ext"],ed:["e4"]}
]});

A({id:"a-payroll-flow",title:"Workday to payroll, end to end",sum:"From a worker change to the payroll vendor's calculation and your reconciliation.",part:"py",tags:"payroll peci pi pay group flow",
nodes:[["chg","Change in Workday","hire, pay, job","teal",15,16,140,50],["pg","Pay group","period schedule","teal",205,16,140,50],["int","PECI or PI","pick changes","amber",15,116,140,50],["f","Payroll file","vendor shape","indigo",205,116,140,50],["v","Payroll vendor","calculates pay","gray",15,216,140,50],["r","Reconcile","counts and totals","coral",205,216,140,50],["er","Late change","retro","coral",110,306,140,46,{dash:1}]],
edges:[["e1","chg","int",{from:"b",to:"t"}],["e2","pg","int",{from:"b",to:"r"}],["e3","int","f"],["e4","f","v",{from:"b",to:"r"}],["e5","v","r"],["e6","r","er",{from:"b",to:"t"}]],
steps:[
{t:"A change happens",p:"A worker is hired, paid differently or leaves.",k:"Event with effective date and entry date.",on:["chg"]},
{t:"The pay group matters",p:"Each worker is in a pay group with a period schedule. The period tells the interface which period is open.",k:"Not Yet Started, In Progress, Complete.",on:["pg","chg"],ed:["e2"]},
{t:"PECI or PI",p:"PECI sends each change in order. PI sends only the net result. Pick by what the vendor can use.",k:"PICOF is the PI's output file format.",d:"PECI: A, then B, then C\nPI: only C",on:["int"],ed:["e1","e2"]},
{t:"The file is created",p:"A file per pay group (PECI) or one consolidated file (PI).",k:"Primary run moves the last-run marker; ad hoc does not.",on:["int","f"],ed:["e3"]},
{t:"The vendor calculates",p:"The vendor loads the file before the cut-off and runs payroll.",k:"Cut-off is a company/vendor rule.",on:["f","v"],ed:["e4"]},
{t:"Reconcile",p:"Compare headcount, new hires, leavers and pay totals.",k:"Every period.",on:["v","r"],ed:["e5"]},
{t:"Late changes",p:"Changes after the cut-off or back-dated changes produce retro pay in a later period.",k:"Tell payroll about back-dated changes.",on:["r","er"],ed:["e6"],chip:["er","retro",true]}
]});
})();
